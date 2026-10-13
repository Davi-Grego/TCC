"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { apiFetch } from "@/lib/api/client";
import type { Servico } from "@/lib/api/types";
import { ServicoCard } from "@/components/ServicoCard";

export default function DiscoverPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [contratandoId, setContratandoId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ servicos: Servico[] }>("/api/servicos")
      .then((d) => setServicos(d.servicos))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  // categorias derivadas dos próprios serviços carregados (sem endpoint extra)
  const categorias = useMemo(() => {
    const mapa = new Map<string, string>(
      servicos.map((s): [string, string] => [s.categoria.id, s.categoria.nome])
    );
    return Array.from(mapa, ([id, nome]) => ({ id, nome }));
  }, [servicos]);

  const visiveis = categoriaAtiva
    ? servicos.filter((s) => s.categoria.id === categoriaAtiva)
    : servicos;

  async function contratar(servico: Servico) {
    setErro(null);
    setContratandoId(servico.id);
    try {
      await apiFetch("/api/contratacoes", {
        method: "POST",
        body: JSON.stringify({ servicoId: servico.id }),
      });
      router.push("/contratacoes");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível contratar");
      setContratandoId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-8 py-10">
      <header>
        <h1 className="text-2xl font-medium text-[#010300]">Discover</h1>
        <p className="mt-1 text-sm text-[#314c53]/70">Serviços disponíveis para contratação</p>
      </header>

      {categorias.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip ativo={categoriaAtiva === null} onClick={() => setCategoriaAtiva(null)}>
            Todas
          </Chip>
          {categorias.map((c) => (
            <Chip key={c.id} ativo={categoriaAtiva === c.id} onClick={() => setCategoriaAtiva(c.id)}>
              {c.nome}
            </Chip>
          ))}
        </div>
      )}

      {erro && <p className="mt-6 text-sm text-[#314c53]">{erro}</p>}

      {carregando ? (
        <p className="mt-10 text-sm text-[#314c53]/60">Carregando serviços...</p>
      ) : visiveis.length === 0 ? (
        <p className="mt-10 text-sm text-[#314c53]/60">Nenhum serviço disponível ainda.</p>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((s) => (
            <ServicoCard
              key={s.id}
              servico={s}
              ehMeu={s.contratadoId === usuario?.id}
              contratando={contratandoId === s.id}
              onContratar={() => contratar(s)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${ativo
        ? "border-[#314c53] bg-[#314c53] text-[#f7f8fc]"
        : "border-[#314c53]/20 bg-white text-[#314c53] hover:border-[#5a7f78]"
        }`}
    >
      {children}
    </button>
  );
}