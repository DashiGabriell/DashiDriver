import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const OportunidadeDetalhe = ({ oportunidade }: { oportunidade: any }) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_-2px_rgba(59,130,246,0.4)]">Ver Detalhes</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] neu">
          <DialogHeader>
            <DialogTitle>Detalhes da Oportunidade</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <section>
              <h4 className="font-bold mb-2">Dados da Locadora</h4>
              <p>Nome: {oportunidade.locadora}***</p>
              <p>Localização: {oportunidade.cidade}/{oportunidade.estado}</p>
            </section>
            <section>
              <h4 className="font-bold mb-2">Necessidade</h4>
              <p>Modelo: {oportunidade.modelo}</p>
              <p>Orçamento: {oportunidade.orcamento}</p>
            </section>
            <Button size="lg" className="w-full text-lg text-white bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_-2px_rgba(37,211,102,0.4)]" onClick={() => setShowWhatsAppModal(true)}>
              Conversar via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Conexão WhatsApp */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="neu p-6 rounded-lg bg-background max-w-sm">
            <h3 className="font-bold text-lg mb-4">Conexão WhatsApp</h3>
            <p className="mb-6">Você será conectado ao time DashiDrive para iniciar esta negociação.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowWhatsAppModal(false)}>Cancelar</Button>
              <Button onClick={() => window.open("https://wa.me/55...", "_blank")}>Continuar para WhatsApp</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
