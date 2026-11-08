"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Flag, ArrowLeft, Star, Clock, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/firebase/AuthProvider";
import DenunciaModal from "@/components/DenunciaModal";

type ServicoDetalhes = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  contratadoId: string;
  categoria: { nome: string } | null;
  prestador: { id: string; nome: string } | null;
  prestadorStats: { media: number; total: number };
};

export default function ServicoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  
  const [servico, setServico] = useState<ServicoDetalhes | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [contratando, setContratando] = useState(false);
  const [modalDenuncia, setModalDenuncia] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiFetch<{ servico: ServicoDetalhes }>(`/api/servicos/${id}`)
      .then((data) => setServico(data.servico))
      .catch((e: unknown) =>
        setErro(e instanceof Error ? e.message : "Não foi possível carregar o serviço"),
      )
      .finally(() => setCarregando(false));
  }, [id]);

  const handleContratar = async () => {
    if (!servico) return;
    if (!confirm("Deseja confirmar a solicitação de contratação?")) return;
    setContratando(true);
    setErro("");
    
    try {
      await apiFetch("/api/contratacoes", {
        method: "POST",
        body: JSON.stringify({ servicoId: servico.id }),
      });
      router.push("/contratacoes"); // Manda pro painel de Em Andamento
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao contratar");
      setContratando(false);
    }
  };

  if (carregando) return <div className="p-8 text-[#314c53] font-mono">Carregando detalhes...</div>;
  if (!servico) return <div className="p-8 text-red-500 font-mono">Serviço não encontrado.</div>;

  const ehDono = usuario?.id === servico.contratadoId;

  return (
    <main className="mx-auto max-w-4xl px-8 py-10 font-mono">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#314c53] hover:text-[#010300] mb-8">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-white border border-[#314c53]/10 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner/Header */}
        <div className="bg-[#314c53] p-8 text-[#f7f8fc]">
          {servico.categoria && (
            <span className="inline-block px-3 py-1 bg-[#f7f8fc]/10 text-[#bbdec6] text-[10px] font-bold uppercase tracking-wider rounded-full mb-4">
              {servico.categoria.nome}
            </span>
          )}
          <h1 className="text-3xl font-black mb-4">{servico.titulo}</h1>
          <p className="text-lg opacity-90 max-w-2xl">{servico.descricao}</p>
        </div>

        {/* Informações de Contratação */}
        <div className="p-8 grid md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#314c53]/60 mb-2">Valor Base</h3>
              <p className="text-4xl font-black text-[#010300]">
                 {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(servico.preco || 0)}
              </p>
            </div>

            <div className="bg-[#f7f8fc] rounded-xl p-4 border border-[#314c53]/5 space-y-3">
               <div className="flex items-center gap-3 text-[#314c53]">
                  <ShieldCheck className="w-5 h-5 text-[#5a7f78]" />
                  <p className="text-sm">Pagamento seguro pela plataforma</p>
               </div>
               <div className="flex items-center gap-3 text-[#314c53]">
                  <Clock className="w-5 h-5 text-[#5a7f78]" />
                  <p className="text-sm">Alinhamento de prazo após aceite</p>
               </div>
            </div>
            
            {erro && <p className="text-sm text-red-500 font-bold">{erro}</p>}

            {!ehDono && (
              <button 
                onClick={handleContratar}
                disabled={contratando}
                className="w-full bg-[#010300] text-[#f7f8fc] px-8 py-5 text-sm font-bold tracking-widest uppercase hover:bg-[#314c53] transition-colors rounded-sm disabled:opacity-50"
              >
                {contratando ? "Processando..." : "Contratar Agora"}
              </button>
            )}
          </div>

         <div className="border-l border-[#314c53]/10 pl-0 md:pl-12">
             <h3 className="text-xs font-bold uppercase tracking-widest text-[#314c53]/60 mb-6">Sobre o Prestador</h3>
             
             {/* Transformamos a div num Link para abrir o perfil público */}
             <Link 
                href={`/perfil/${servico.prestador?.id}`}
                className="flex items-center gap-4 mb-6 group hover:bg-[#f7f8fc] p-3 -ml-3 rounded-xl transition-colors cursor-pointer"
             >
                <div className="w-16 h-16 bg-[#bbdec6] rounded-full flex items-center justify-center text-xl font-black text-[#010300] group-hover:bg-[#5a7f78] group-hover:text-white transition-colors">
                  {/* Pega a inicial do nome real */}
                  {servico.prestador?.nome?.[0]?.toUpperCase() || "P"} 
                </div>
                <div>
                  <p className="font-bold text-[#010300] group-hover:underline underline-offset-2">
                    {servico.prestador?.nome || "Usuário não encontrado"}
                  </p>
                  <div className="flex items-center gap-1 text-[#5a7f78] mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    {/* Renderiza a média real ou 0.0 */}
                    <span className="text-sm font-bold">
                      {servico.prestadorStats?.media?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-xs text-[#314c53]/60 ml-1">
                      ({servico.prestadorStats?.total || 0} avaliações)
                    </span>
                  </div>
                </div>
             </Link>
             
             {!ehDono && (
               <button 
                 onClick={() => setModalDenuncia(true)}
                 className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#314c53]/50 hover:text-red-500 transition-colors"
               >
                 <Flag className="w-4 h-4" /> Denunciar este serviço
               </button>
             )}
          </div>

        </div>
      </div>

      {modalDenuncia && (
        <DenunciaModal 
          alvoId={servico.id} 
          alvoTipo="SERVICO" 
          onClose={() => setModalDenuncia(false)} 
        />
      )}
    </main>
  );
}