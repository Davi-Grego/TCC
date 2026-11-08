"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

export default function NotificacoesDropdown() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    carregarNotificacoes();
    // Você pode colocar um setInterval aqui se quiser polling (ex: a cada 30s)
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const data = await apiFetch("/api/notificacoes");
      setNotificacoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await apiFetch(`/api/notificacoes/${id}`, { method: "PATCH" });
      setNotificacoes(notificacoes.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative font-mono">
      <button 
        onClick={() => setAberto(!aberto)}
        className="relative p-2 text-[#314c53] hover:text-[#5a7f78] transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notificacoes.length > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#f7f8fc]"></span>
        )}
      </button>

      {aberto && (
       <div className="absolute left-0 bottom-full mb-2 w-80 bg-[#f7f8fc] border border-[#314c53]/20 rounded-lg shadow-xl z-50 overflow-hidden origin-bottom-left">
          <div className="p-4 border-b border-[#314c53]/10 bg-[#bbdec6]/10">
            <h3 className="font-black text-sm uppercase tracking-widest text-[#010300]">Notificações</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="p-6 text-center text-xs font-bold text-[#314c53]/60 uppercase">Nenhuma notificação</p>
            ) : (
              notificacoes.map((notif) => (
                <div key={notif.id} className="p-4 border-b border-[#314c53]/5 hover:bg-black/5 flex justify-between gap-4 items-start">
                  <p className="text-sm text-[#314c53]">{notif.mensagem}</p>
                  <button 
                    onClick={() => marcarComoLida(notif.id)}
                    className="text-[10px] font-bold uppercase text-[#5a7f78] hover:text-[#010300]"
                  >
                    Lida
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}