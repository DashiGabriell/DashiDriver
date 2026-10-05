import { Search } from "lucide-react";

interface FleetSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const FleetSearch = ({ value, onChange }: FleetSearchProps) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder="Pesquisar placa, modelo ou nome..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-12 pr-4 bg-background shadow-neu-inset rounded-[24px] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
      />
    </div>
  );
};

export default FleetSearch;
