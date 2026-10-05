import { useState, useMemo } from "react";
import FleetTabs from "@/components/mobile/frota/FleetTabs";
import FleetSearch from "@/components/mobile/frota/FleetSearch";
import VehicleCard from "@/components/mobile/frota/VehicleCard";
import DriverCard from "@/components/mobile/frota/DriverCard";
import BottomSheet from "@/components/mobile/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Settings, Loader2 } from "lucide-react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { fmtBRL } from "@/lib/utils";

const MobileFrota = () => {
  const [activeTab, setActiveTab] = useState<"veiculos" | "motoristas">("veiculos");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vehicles, loading: loadingVehicles } = useRealtimeData("carcontrol_vehicles");
  const { data: drivers, loading: loadingDrivers } = useRealtimeData("carcontrol_drivers");

  const handleOpenDetails = (item: any) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(v => 
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    return drivers.filter(d => 
      d.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drivers, searchTerm]);

  const isLoading = loadingVehicles || loadingDrivers;

  return (
    <div className="animate-fade-in pb-20">
      <div className="px-2 mb-6">
        <h2 className="text-2xl font-bold font-display">Sua Frota</h2>
      </div>

      <FleetTabs activeTab={activeTab} onChange={setActiveTab} />
      <FleetSearch value={searchTerm} onChange={setSearchTerm} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando dados reais...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeTab === "veiculos" ? (
            <>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => {
                  const driver = drivers?.find(d => d.veiculo_id === v.id);
                  return (
                    <VehicleCard 
                      key={v.id}
                      marca={v.marca} 
                      modelo={v.modelo} 
                      placa={v.placa} 
                      status={v.status as any} 
                      motoristaAtual={driver?.nome} 
                      valorSemanal={driver?.valor_semanal || 0} 
                      diasSemPagar={0} // TODO: Calcular atraso real
                      fotoUrl={v.photo_urls?.[0]}
                      onClick={() => handleOpenDetails({ 
                        type: 'veiculo', 
                        name: v.modelo, 
                        plate: v.placa,
                        data: v,
                        driver: driver
                      })}
                    />
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted-foreground">Nenhum veículo encontrado.</div>
              )}
            </>
          ) : (
            <>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((d) => {
                  const vehicle = vehicles?.find(v => v.id === d.veiculo_id);
                  return (
                    <DriverCard 
                      key={d.id}
                      nome={d.nome} 
                      score={5.0} // TODO: Score real
                      veiculo={vehicle ? `${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})` : undefined} 
                      pagamentosStatus={d.status === 'atrasado' ? 'atrasado' : 'em_dia'} 
                      status={d.status === 'ativo' ? 'ativo' : 'inativo'} 
                      fotoUrl={d.foto_url ?? undefined}
                      onClick={() => handleOpenDetails({ 
                        type: 'motorista', 
                        name: d.nome,
                        data: d,
                        vehicle: vehicle
                      })}
                    />
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted-foreground">Nenhum motorista encontrado.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Bottom Sheet */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        title={selectedItem?.name}
        description={selectedItem?.type === 'veiculo' ? `Placa: ${selectedItem?.plate}` : 'Motorista Ativo'}
      >
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="neu-interactive p-4 rounded-2xl flex flex-col items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Phone className="w-5 h-5" /></div>
              <span className="text-xs font-bold">Ligar</span>
            </button>
            <button className="neu-interactive p-4 rounded-2xl flex flex-col items-center gap-2">
              <div className="p-2 bg-success/10 text-success rounded-lg"><MessageCircle className="w-5 h-5" /></div>
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Informações</h4>
            <div className="neu p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`chip text-[10px] ${
                  (selectedItem?.type === 'veiculo' ? selectedItem?.data?.status : selectedItem?.data?.status) === 'ativo' || 
                  (selectedItem?.type === 'veiculo' ? selectedItem?.data?.status : selectedItem?.data?.status) === 'disponivel' ||
                  (selectedItem?.type === 'veiculo' ? selectedItem?.data?.status : selectedItem?.data?.status) === 'alugado'
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  {selectedItem?.type === 'veiculo' ? selectedItem?.data?.status : selectedItem?.data?.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vencimento</span>
                <span className="font-bold text-sm">Todo Domingo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor Acordado</span>
                <span className="font-bold text-sm text-primary">
                  {fmtBRL(selectedItem?.type === 'veiculo' ? (selectedItem?.driver?.valor_semanal || 0) : (selectedItem?.data?.valor_semanal || 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-neu-sm">
              Ver Histórico Completo
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-border/40">
              <Settings className="w-4 h-4 mr-2" /> Editar Cadastro
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default MobileFrota;
