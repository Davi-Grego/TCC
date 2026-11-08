"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, Phone, Star } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type PerfilPublico = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  criadoEm: string;
  bio: string | null;
  fotoUrl: string | null;
  telefone: string | null;
  localizacao: string | null;
  avaliacao: { media: number; total: number };
  servicos: Array<{
    id: string;
    titulo: string;
    descricao: string;
    preco: number;
    categoria: { nome: string };
  }>;
  projetos: Array<{
    id: string;
    titulo: string;
    descricao: string;
    criadoEm: string;
    imagemUrl: string | null;
  }>;
  avaliacoes: Array<{
    id: string;
    nota: number;
    comentario: string | null;
    criadoEm: string;
    autor: { id: string; nome: string };
    contratacao: { servico: { titulo: string } };
  }>;
};

function dataFormatada(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export default function PerfilPublicoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    apiFetch<PerfilPublico>(`/api/perfil/${id}`)
      .then((data) => {
        if (ativo) setPerfil(data);
      })
      .catch((err: unknown) => {
        if (ativo) setErro(err instanceof Error ? err.message : "Não foi possível carregar o perfil.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) return <main className="p-8 font-mono text-[#314c53]">Carregando perfil...</main>;
  if (!perfil) return <main className="p-8 font-mono text-red-600">{erro || "Perfil não encontrado."}</main>;

  const membroDesde = new Date(perfil.criadoEm).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-10 font-mono text-[#010300] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#314c53] hover:text-[#010300]">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <section className="overflow-hidden rounded-3xl border border-[#314c53]/10 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-br from-[#010300] to-[#314c53]" />
          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-14 flex flex-wrap items-end gap-5">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#bbdec6] text-3xl font-bold">
                {perfil.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.fotoUrl} alt={`Foto de ${perfil.nome}`} className="h-full w-full object-cover" />
                ) : (
                  perfil.nome[0]?.toUpperCase()
                )}
              </div>
              <div className="pb-2 pt-14">
                <h1 className="text-2xl font-bold sm:text-3xl">{perfil.nome}</h1>
                <p className="mt-1 text-sm capitalize text-[#5a7f78]">{perfil.papel.toLowerCase()}</p>
              </div>
              <div className="mb-2 ml-auto flex items-center gap-2 rounded-full bg-[#bbdec6]/40 px-4 py-2 text-[#314c53]">
                <Star className="h-5 w-5 fill-current text-[#5a7f78]" />
                <strong>{perfil.avaliacao.media.toFixed(1)}</strong>
                <span className="text-xs">({perfil.avaliacao.total} avaliações)</span>
              </div>
            </div>

            <p className="mt-6 max-w-3xl whitespace-pre-wrap leading-7 text-[#314c53]">
              {perfil.bio || "Este profissional ainda não adicionou uma biografia."}
            </p>

            <div className="mt-6 grid gap-3 border-t border-[#314c53]/10 pt-5 text-sm text-[#314c53] sm:grid-cols-2">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#5a7f78]" /> Na plataforma desde {membroDesde}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#5a7f78]" /> {perfil.localizacao || "Localização não informada"}</p>
              <a href={`mailto:${perfil.email}`} className="break-all hover:text-[#5a7f78]">{perfil.email}</a>
              {perfil.telefone ? (
                <a href={`tel:${perfil.telefone}`} className="flex items-center gap-2 hover:text-[#5a7f78]">
                  <Phone className="h-4 w-4 text-[#5a7f78]" /> {perfil.telefone}
                </a>
              ) : (
                <p className="flex items-center gap-2 text-[#314c53]/60"><Phone className="h-4 w-4" /> Telefone não informado</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-[#5a7f78]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Serviços</p>
              <h2 className="mt-1 text-xl font-bold">O que este profissional oferece</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {perfil.servicos.map((servico) => (
              <Link key={servico.id} href={`/servicos/${servico.id}`} className="rounded-2xl border border-[#314c53]/10 p-5 transition hover:border-[#5a7f78] hover:bg-[#f7f8fc]">
                <p className="text-xs uppercase tracking-wide text-[#5a7f78]">{servico.categoria.nome}</p>
                <h3 className="mt-2 font-bold">{servico.titulo}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#314c53]">{servico.descricao}</p>
                <p className="mt-4 font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(servico.preco)}</p>
              </Link>
            ))}
            {perfil.servicos.length === 0 && <p className="text-sm text-[#314c53]/70">Nenhum serviço publicado.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Portfólio</p>
          <h2 className="mt-1 text-xl font-bold">Projetos realizados</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {perfil.projetos.map((projeto) => (
              <article key={projeto.id} className="overflow-hidden rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc]">
                {projeto.imagemUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={projeto.imagemUrl} alt={projeto.titulo} className="h-52 w-full object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-bold">{projeto.titulo}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#314c53]">{projeto.descricao}</p>
                  <p className="mt-4 text-xs text-[#314c53]/60">Adicionado em {dataFormatada(projeto.criadoEm)}</p>
                </div>
              </article>
            ))}
            {perfil.projetos.length === 0 && <p className="text-sm text-[#314c53]/70">Nenhum projeto adicionado ao portfólio.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Reputação</p>
            <h2 className="mt-1 text-xl font-bold">Avaliações recebidas</h2>
          </div>
          <div className="mt-6 space-y-4">
            {perfil.avaliacoes.map((avaliacao) => (
              <article key={avaliacao.id} className="rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{avaliacao.autor.nome}</p>
                    <p className="mt-1 text-xs text-[#314c53]/70">Serviço: {avaliacao.contratacao.servico.titulo}</p>
                  </div>
                  <div className="flex items-center gap-1" aria-label={`${avaliacao.nota} de 5 estrelas`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < avaliacao.nota ? "fill-[#5a7f78] text-[#5a7f78]" : "text-[#314c53]/20"}`} />
                    ))}
                    <span className="ml-1 text-xs font-bold">{avaliacao.nota}/5</span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#314c53]">
                  {avaliacao.comentario || "Avaliação sem comentário."}
                </p>
                <p className="mt-3 text-xs text-[#314c53]/60">{dataFormatada(avaliacao.criadoEm)}</p>
              </article>
            ))}
            {perfil.avaliacoes.length === 0 && <p className="text-sm text-[#314c53]/70">Este perfil ainda não recebeu avaliações.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
