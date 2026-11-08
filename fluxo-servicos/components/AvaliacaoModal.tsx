"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

interface AvaliacaoModalProps {
  contratacaoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AvaliacaoModal({ contratacaoId, onClose, onSuccess }: AvaliacaoModalProps) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Bloqueia o scroll da página enquanto o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Libera o scroll quando o componente for desmontado (fechado)
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleAvaliar = async () => {
    if (nota === 0) return setErro("Selecione uma nota de 1 a 5.");

    setLoading(true);
    setErro("");

    try {
      await apiFetch(`/api/contratacoes/${contratacaoId}/avaliacoes`, {
        method: "POST",
        body: JSON.stringify({ nota, comentario }),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Alterado de z-50 para z-[9999] para garantir que fique acima de qualquer sidebar ou header fixo
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#010300]/50 backdrop-blur-sm px-4">
      <div className="bg-[#f7f8fc] w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-mono text-[#010300]">
        <div className="flex justify-between items-center p-6 border-b border-[#314c53]/10">
          <h3 className="font-black text-lg">Avaliar Serviço</h3>
          <button onClick={onClose} className="text-[#314c53] hover:text-[#5a7f78]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {erro && <div className="text-red-600 text-xs font-bold bg-red-100 p-3 rounded-md">{erro}</div>}

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#314c53]">Nota</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setNota(star)}>
                  <Star className={`w-8 h-8 ${star <= nota ? "text-[#5a7f78] fill-current" : "text-[#bbdec6]"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#314c53]">Comentário (opcional)</p>
            <textarea
              className="w-full bg-[#bbdec6]/20 border border-[#314c53]/20 rounded-md p-3 text-sm focus:outline-none focus:border-[#5a7f78] min-h-[100px]"
              placeholder="Como foi a experiência?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <button
            onClick={handleAvaliar}
            disabled={loading}
            className="w-full bg-[#010300] text-[#f7f8fc] font-bold uppercase tracking-widest text-xs py-4 rounded-sm hover:bg-[#314c53] transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Confirmar Avaliação"}
          </button>
        </div>
      </div>
    </div>
  );
}