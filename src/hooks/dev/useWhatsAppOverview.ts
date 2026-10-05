import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DayBucket {
  date: string;
  label: string;
  count: number;
}

export interface CompanyBucket {
  companyId: string;
  company: string;
  count: number;
}

export interface ListingBucket {
  listingId: string;
  listing: string;
  company: string;
  count: number;
}

export interface HourBucket {
  hour: number;
  label: string;
  count: number;
}

export interface RecentClick {
  id: string;
  company: string;
  listing: string;
  created_at: string;
}

export interface WhatsAppOverview {
  totalClicks: number;
  totalCompanies: number;
  totalListings: number;
  totalUsers: number;
  clicksByDay: DayBucket[];
  clicksByCompany: CompanyBucket[];
  clicksByListing: ListingBucket[];
  clicksByHour: HourBucket[];
  recentClicks: RecentClick[];
  firstClickDate: string | null;
}

function buildDayBucketsFromData(clickDates: string[]): DayBucket[] {
  const countMap = new Map<string, number>();
  for (const d of clickDates) {
    const day = d.slice(0, 10);
    countMap.set(day, (countMap.get(day) ?? 0) + 1);
  }
  const sorted = Array.from(countMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([date, count]) => ({
    date,
    label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    count,
  }));
}

const HOUR_LABELS = [
  "00h", "01h", "02h", "03h", "04h", "05h", "06h", "07h", "08h", "09h", "10h", "11h",
  "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h",
];

export function useWhatsAppOverview() {
  return useQuery<WhatsAppOverview>({
    queryKey: ["dev-whatsapp-overview"],
    queryFn: async () => {
      const [clicksRes, companiesRes, listingsRes] = await Promise.all([
        supabase
          .from("marketplace_whatsapp_clicks")
          .select("id, listing_id, user_id, company_id, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("carcontrol_companies")
          .select("id, nome"),
        supabase
          .from("marketplace_listings")
          .select("id, title, company_id"),
      ]);

      if (clicksRes.error) throw clicksRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (listingsRes.error) throw listingsRes.error;

      const clicks = clicksRes.data ?? [];
      const companies = companiesRes.data ?? [];
      const listings = listingsRes.data ?? [];

      const companyMap = new Map(companies.map((c) => [c.id, c.nome || "Sem nome"]));

      const uniqueCompanies = new Set<string>();
      const uniqueListings = new Set<string>();
      const uniqueUsers = new Set<string>();

      const companyCountMap = new Map<string, number>();
      const listingCountMap = new Map<string, { count: number; company: string }>();
      const hourCounts = new Array(24).fill(0);
      const clickDates: string[] = [];
      const recent: RecentClick[] = [];

      for (const click of clicks) {
        const companyName = companyMap.get(click.company_id) || "Desconhecida";
        const listingInfo = listings.find((l) => l.id === click.listing_id);

        uniqueCompanies.add(click.company_id);
        uniqueListings.add(click.listing_id);
        uniqueUsers.add(click.user_id);

        clickDates.push(click.created_at);

        companyCountMap.set(companyName, (companyCountMap.get(companyName) ?? 0) + 1);

        const listingTitle = listingInfo?.title || "Sem titulo";
        const existing = listingCountMap.get(click.listing_id);
        if (existing) {
          existing.count += 1;
        } else {
          listingCountMap.set(click.listing_id, { count: 1, company: companyName });
        }

        const hour = new Date(click.created_at).getHours();
        hourCounts[hour] += 1;

        if (recent.length < 200) {
          recent.push({
            id: click.id,
            company: companyName,
            listing: listingTitle,
            created_at: click.created_at,
          });
        }
      }

      const clicksByDay = buildDayBucketsFromData(clickDates);

      const clicksByCompany: CompanyBucket[] = Array.from(companyCountMap.entries())
        .map(([company, count]) => ({ companyId: "", company, count }))
        .sort((a, b) => b.count - a.count);

      const clicksByListing: ListingBucket[] = Array.from(listingCountMap.entries())
        .map(([listingId, data]) => ({
          listingId,
          listing: listings.find((l) => l.id === listingId)?.title || "Sem titulo",
          company: data.company,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count);

      const clicksByHour: HourBucket[] = hourCounts.map((count, hour) => ({
        hour,
        label: HOUR_LABELS[hour],
        count,
      }));

      const firstClickDate = clickDates.length > 0
        ? clickDates[clickDates.length - 1]
        : null;

      return {
        totalClicks: clicks.length,
        totalCompanies: uniqueCompanies.size,
        totalListings: uniqueListings.size,
        totalUsers: uniqueUsers.size,
        clicksByDay,
        clicksByCompany,
        clicksByListing,
        clicksByHour,
        recentClicks: recent,
        firstClickDate,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
