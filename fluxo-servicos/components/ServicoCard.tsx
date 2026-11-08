"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import DenunciaModal from "./DenunciaModal";

// Adicione aqui a tipagem correta do seu Serviço conforme a sua API
interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria?: { nome: string };
  contratadoId: string;
  // ...outros campos que sua API retorna
}

interface Props {
  servico: Servico;
  ehDono?: boolean; // Para saber se é "Seu Serviço" igual na imagem
}

export function ServicoCard({ servico, ehDono = false }: Props) {
  const [modalDenuncia, setModalDenuncia] = useState(false);

  return (
    <>
      <div className="flex flex-col bg-white border border-[#314c53]/10 rounded-xl p-6 relative font-mono transition-all hover:shadow-md">
        
        {/* RF18: Botão de Denúncia Discreto no Canto */}
        {!ehDono && (
          <button 
            onClick={() => setModalDenuncia(true)}
            className="absolute top-6 right-6 text-[#314c53]/30 hover:text-red-500 transition-colors"
            title="Denunciar este serviço"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}

        {servico.categoria && (
          <span className="w-fit mb-4 px-3 py-1 bg-[#bbdec6]/30 text-[#5a7f78] text-[10px] font-bold uppercase tracking-wider rounded-full">
            {servico.categoria.nome}
          </span>
        )}

        <h3 className="text-lg font-bold text-[#010300] mb-3 line-clamp-1 pr-6">{servico.titulo}</h3>
        <p className="text-sm text-[#314c53]/80 line-clamp-3 mb-6 flex-grow">{servico.descricao}</p>

        <div className="flex items-end justify-between border-t border-[#314c53]/10 pt-4 mt-auto">
          <div>
            <p className="text-[11px] text-[#314c53]/60 mb-1">Valor base</p>
            <p className="text-lg font-black text-[#314c53]">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(servico.preco || 0)}
            </p>
          </div>
          
          {ehDono ? (
            <span className="text-xs text-[#314c53]/50">seu serviço</span>
          ) : (
            <Link 
              href={`/servicos/${servico.id}`} // Vai para a página de detalhes!
              className="bg-[#314c53] text-[#f7f8fc] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#010300] transition-colors rounded-sm"
            >
              Ver Serviço
            </Link>
          )}
        </div>
      </div>

      {modalDenuncia && (
        <DenunciaModal 
          alvoId={servico.id} 
          alvoTipo="SERVICO" 
          onClose={() => setModalDenuncia(false)} 
        />
      )}
    </>
  );
}