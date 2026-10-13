"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Image, LogOut, MapPin, Phone, Save, UserRound, X } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { auth } from "@/lib/firebase/client";

type Usuario = {
  id?: string;
  nome: string;
  email: string;
  papel: string;
  criadoEm: string;
};

type Perfil = {
  bio: string | null;
  fotoUrl: string | null;
  localizacao: string | null;
  telefone: string | null;
};

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { usuario: usuarioAuth, carregando: authCarregando, logout } = useAuth();
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [draft, setDraft] = useState<Perfil | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (authCarregando) return;

    if (!usuarioAuth) {
      router.push("/login");
      return;
    }

    async function carregar() {
      try {
        setMensagem(null);
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Não foi possível carregar o perfil.");
        }

        setUsuario(data.usuario);
        setPerfil(data.perfil);
        setDraft(data.perfil);
      } catch (err) {
        setMensagem(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      } finally {
        setCarregandoPerfil(false);
      }
    }

    carregar();
  }, [authCarregando, usuarioAuth, router]);

  function ativaEdicao() {
    if (!perfil) return;
    setDraft({ ...perfil });
    setIsEditing(true);
    setMensagem(null);
  }

  function cancelaEdicao() {
    setDraft(perfil);
    setIsEditing(false);
    setMensagem(null);
  }

  async function salvarPerfil() {
    if (!draft) return;

    setSalvando(true);
    setMensagem(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao salvar perfil.");
      }

      setPerfil(data.perfil ?? draft);
      setDraft(data.perfil ?? draft);
      setIsEditing(false);
      setMensagem("Perfil atualizado.");
    } catch (err) {
      setMensagem(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    salvarPerfil();
  }

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch {
      setMensagem("Não foi possível sair agora.");
    }
  }

  if (authCarregando || carregandoPerfil) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="rounded-2xl border border-[#314c53]/10 bg-white px-8 py-5 text-sm font-medium text-[#314c53] shadow-sm">
          Carregando perfil...
        </div>
      </main>
    );
  }

  if (!usuario || !perfil) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="rounded-2xl border border-[#314c53]/10 bg-white px-8 py-5 text-sm font-medium text-red-700 shadow-sm">
          {mensagem ?? "Perfil não encontrado."}
        </div>
      </main>
    );
  }

  const membroDesde = new Date(usuario.criadoEm).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  const foto = perfil.fotoUrl || "";
  const nomeUsuario = usuario.nome || "Usuário";

  return (
    <main className="min-h-screen bg-[#f7f8fc] pb-20 font-mono text-[#010300]">
      <section className="relative">
        <div className="h-44 overflow-hidden bg-gradient-to-br from-[#010300] to-[#314c53]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(#f7f8fc 1px, transparent 1px), linear-gradient(90deg, #f7f8fc 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="absolute -bottom-14 left-10 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#f7f8fc] bg-[#bbdec6] text-3xl font-medium text-[#010300] shadow-lg">
          {foto ? (
            <img src={foto} alt={nomeUsuario} className="h-full w-full object-cover" />
          ) : (
            <span className="tracking-wide">{iniciais(nomeUsuario)}</span>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-20">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-medium text-[#010300]">{nomeUsuario}</h1>
              <button
                type="button"
                onClick={isEditing ? salvarPerfil : ativaEdicao}
                className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 bg-white px-3 py-2 text-xs font-medium text-[#314c53] shadow-sm transition hover:bg-[#bbdec6] hover:text-[#010300]"
                disabled={salvando}
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? (salvando ? "Salvando..." : "Salvar") : "Editar"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelaEdicao}
                  className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 bg-white px-3 py-2 text-xs font-medium text-[#314c53] shadow-sm transition hover:bg-[#314c53] hover:text-white"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 bg-[#010300] px-3 py-2 text-xs font-medium text-[#f7f8fc] shadow-sm transition hover:bg-[#314c53]"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
            <p className="mt-2 text-sm text-[#314c53]/70">{usuario.email}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#5a7f78]/30 bg-[#5a7f78]/15 px-3 py-1 text-xs text-[#314c53]">
                {usuario.papel.toLowerCase()}
              </span>
              <span className="rounded-full border border-[#314c53]/15 px-3 py-1 text-xs text-[#314c53]/70">
                membro desde {membroDesde}
              </span>
            </div>
          </div>
        </div>

        {mensagem && (
          <div className="mt-6 rounded-xl border border-[#314c53]/15 bg-white px-4 py-3 text-sm text-[#314c53] shadow-sm">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[#314c53]/10 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#5a7f78]">Perfil</span>
                <h2 className="mt-2 text-xl font-medium text-[#010300]">Informações públicas</h2>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={ativaEdicao}
                  className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 px-3 py-2 text-xs font-medium text-[#314c53] transition hover:bg-[#bbdec6]"
                >
                  <Edit3 className="h-4 w-4" /> Editar
                </button>
              )}
            </div>

            <div className="space-y-5">
              <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#5a7f78]" /> Bio
                </span>
                {isEditing ? (
                  <textarea
                    value={draft?.bio ?? ""}
                    onChange={(e) => setDraft({ ...(draft ?? perfil), bio: e.target.value })}
                    className="min-h-28 rounded-2xl border border-[#314c53]/20 bg-[#f7f8fc] p-4 text-[#010300] outline-none transition focus:border-[#5a7f78] focus:bg-white"
                    placeholder="Conte um pouco sobre você"
                  />
                ) : (
                  <div className="rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc] px-4 py-3 text-sm leading-6 text-[#314c53]">
                    {perfil.bio || "Ainda não escreveu uma bio."}
                  </div>
                )}
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#5a7f78]" /> Telefone
                  </span>
                  {isEditing ? (
                    <input
                      value={draft?.telefone ?? ""}
                      onChange={(e) => setDraft({ ...(draft ?? perfil), telefone: e.target.value })}
                      className="rounded-2xl border border-[#314c53]/20 bg-[#f7f8fc] p-4 text-[#010300] outline-none transition focus:border-[#5a7f78] focus:bg-white"
                      placeholder="(00) 00000-0000"
                    />
                  ) : (
                    <div className="rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc] px-4 py-3 text-sm text-[#314c53]">
                      {perfil.telefone || "Não informado"}
                    </div>
                  )}
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#5a7f78]" /> Localização
                  </span>
                  {isEditing ? (
                    <input
                      value={draft?.localizacao ?? ""}
                      onChange={(e) => setDraft({ ...(draft ?? perfil), localizacao: e.target.value })}
                      className="rounded-2xl border border-[#314c53]/20 bg-[#f7f8fc] p-4 text-[#010300] outline-none transition focus:border-[#5a7f78] focus:bg-white"
                      placeholder="Cidade, UF"
                    />
                  ) : (
                    <div className="rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc] px-4 py-3 text-sm text-[#314c53]">
                      {perfil.localizacao || "Não informado"}
                    </div>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
                <span className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-[#5a7f78]" /> URL da foto
                </span>
                {isEditing ? (
                  <input
                    value={draft?.fotoUrl ?? ""}
                    onChange={(e) => setDraft({ ...(draft ?? perfil), fotoUrl: e.target.value })}
                    className="rounded-2xl border border-[#314c53]/20 bg-[#f7f8fc] p-4 text-[#010300] outline-none transition focus:border-[#5a7f78] focus:bg-white"
                    placeholder="https://..."
                  />
                ) : (
                  <div className="rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc] px-4 py-3 text-sm text-[#314c53]">
                    {perfil.fotoUrl || "Nenhuma foto adicionada"}
                  </div>
                )}
              </label>
            </div>
          </section>

          <aside className="rounded-3xl border border-[#314c53]/10 bg-[#010300] p-8 text-[#f7f8fc] shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#bbdec6] bg-[#314c53] text-3xl font-medium text-[#f7f8fc] shadow-sm">
                {foto ? (
                  <img src={foto} alt={nomeUsuario} className="h-full w-full object-cover" />
                ) : (
                  iniciais(nomeUsuario)
                )}
              </div>

              <h2 className="mt-4 text-xl font-medium text-[#f7f8fc]">{nomeUsuario}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-[#bbdec6]">{usuario.papel}</p>

              <div className="mt-8 w-full space-y-3">
                <div className="rounded-2xl border border-[#314c53]/40 bg-[#314c53]/30 px-4 py-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#bbdec6]">
                    <span>Email</span>
                  </div>
                  <p className="mt-2 text-sm text-[#f7f8fc]">{usuario.email}</p>
                </div>

                <div className="rounded-2xl border border-[#314c53]/40 bg-[#314c53]/30 px-4 py-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#bbdec6]">
                    <span>Desde</span>
                  </div>
                  <p className="mt-2 text-sm text-[#f7f8fc]">{membroDesde}</p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}