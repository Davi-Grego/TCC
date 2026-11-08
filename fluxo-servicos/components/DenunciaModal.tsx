"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

interface DenunciaModalProps {
  alvoId: string;
  alvoTipo: "SERVICO" | "USUARIO";
  onClose: () => void;
}

export default function DenunciaModal({ alvoId, alvoTipo, onClose }: DenunciaModalProps) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleDenunciar = async () => {
    if (motivo.length < 10) return setErro("O motivo deve ter pelo menos 10 caracteres.");
    
    setLoading(true);
    setErro("");

    try {
      await apiFetch("/api/denuncias", {
        method: "POST",
        body: JSON.stringify({ alvoId, alvoTipo, motivo }),
      });
      setSucesso(true);
      setTimeout(onClose, 2500); // Fecha após 2.5s para o usuário ler o sucesso
    } catch (err: any) {
      setErro(err.message || "Erro ao enviar denúncia.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010300]/60 backdrop-blur-sm px-4">
        <div className="bg-[#f7f8fc] w-full max-w-md rounded-xl p-8 text-center font-mono shadow-2xl">
          <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Flag className="w-6 h-6" />
          </div>
          <h3 className="font-black text-lg text-[#010300] mb-2">Denúncia Registrada</h3>
          <p className="text-sm text-[#314c53]">Nossa equipe de moderação irá analisar este caso em breve. Obrigado por ajudar a manter a comunidade segura.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010300]/60 backdrop-blur-sm px-4">
      <div className="bg-[#f7f8fc] w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-mono text-[#010300]">
        <div className="flex justify-between items-center p-6 border-b border-[#314c53]/10 bg-red-50/50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-lg">Denunciar {alvoTipo === "SERVICO" ? "Serviço" : "Usuário"}</h3>
          </div>
          <button onClick={onClose} className="text-[#314c53] hover:text-[#5a7f78]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {erro && <div className="text-red-600 text-xs font-bold bg-red-100 p-3 rounded-md">{erro}</div>}
          
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#314c53]">Motivo da denúncia</p>
            <textarea
              className="w-full bg-white border border-[#314c53]/20 rounded-md p-3 text-sm focus:outline-none focus:border-red-500 min-h-[120px]"
              placeholder="Descreva o que há de errado (fraude, conteúdo impróprio, assédio, etc)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-[#314c53]/20 text-[#314c53] font-bold uppercase tracking-widest text-xs py-4 rounded-sm hover:bg-[#314c53]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDenunciar}
              disabled={loading}
              className="flex-1 bg-red-600 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Denúncia"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}