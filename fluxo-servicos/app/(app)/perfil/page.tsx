"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit3,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/firebase/AuthProvider";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  criadoEm: string;
};

type Perfil = {
  bio: string | null;
  fotoUrl: string | null;
  telefone: string | null;
  localizacao: string | null;
};

type Projeto = {
  id: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  imagemUrl: string | null;
};

type Servico = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: { nome: string };
};

type PerfilPublico = {
  projetos: Projeto[];
  servicos: Servico[];
};

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join("");
}

const campoClassName =
  "w-full rounded-xl border border-[#314c53]/20 bg-[#f7f8fc] px-4 py-3 text-sm text-[#010300] outline-none transition focus:border-[#5a7f78] focus:bg-white";

export default function ProfilePage() {
  const { usuario: usuarioAuth, carregando: authCarregando, logout } = useAuth();
  const router = useRouter();
  const usuarioAuthId = usuarioAuth?.id;
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [draft, setDraft] = useState<Perfil | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoProjeto, setSalvandoProjeto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroProjeto, setErroProjeto] = useState<string | null>(null);

  useEffect(() => {
    if (!fotoPreview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(fotoPreview);
  }, [fotoPreview]);

  useEffect(() => {
    if (authCarregando) return;
    if (!usuarioAuthId) {
      router.replace("/login");
      return;
    }

    let ativo = true;
    async function carregar() {
      try {
        const [dadosPrivados, dadosPublicos] = await Promise.all([
          apiFetch<{ usuario: Usuario; perfil: Perfil }>("/api/perfil"),
          apiFetch<PerfilPublico>(`/api/perfil/${usuarioAuthId}`),
        ]);
        if (!ativo) return;
        setUsuario(dadosPrivados.usuario);
        setPerfil(dadosPrivados.perfil);
        setDraft(dadosPrivados.perfil);
        setProjetos(dadosPublicos.projetos);
        setServicos(dadosPublicos.servicos);
      } catch (err) {
        if (ativo) {
          setMensagem(err instanceof Error ? err.message : "Não foi possível carregar o perfil.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();

    return () => {
      ativo = false;
    };
  }, [authCarregando, usuarioAuthId, router]);

  function iniciarEdicao() {
    if (!perfil) return;
    setDraft({ ...perfil });
    setFotoArquivo(null);
    setFotoPreview(null);
    setEditando(true);
    setMensagem(null);
  }

  function cancelarEdicao() {
    setDraft(perfil);
    setFotoArquivo(null);
    setFotoPreview(null);
    setEditando(false);
    setMensagem(null);
  }

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    setSalvando(true);
    setMensagem(null);
    try {
      const formData = new FormData();
      formData.set("bio", draft.bio ?? "");
      formData.set("telefone", draft.telefone ?? "");
      formData.set("localizacao", draft.localizacao ?? "");
      if (fotoArquivo) formData.set("foto", fotoArquivo);

      const data = await apiFetch<{ perfil: Perfil }>("/api/perfil", {
        method: "PUT",
        body: formData,
      });
      setPerfil(data.perfil);
      setDraft(data.perfil);
      setFotoArquivo(null);
      setFotoPreview(null);
      setEditando(false);
      setMensagem("Perfil atualizado com sucesso.");
    } catch (err) {
      setMensagem(err instanceof Error ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarProjeto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvandoProjeto(true);
    setErroProjeto(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = await apiFetch<{ projeto: Projeto }>("/api/perfil/projetos", {
        method: "POST",
        body: formData,
      });
      setProjetos((atuais) => [data.projeto, ...atuais]);
      form.reset();
    } catch (err) {
      setErroProjeto(err instanceof Error ? err.message : "Não foi possível adicionar o projeto.");
    } finally {
      setSalvandoProjeto(false);
    }
  }

  async function removerProjeto(projetoId: string) {
    if (!confirm("Remover este projeto do seu portfólio?")) return;
    try {
      await apiFetch(`/api/perfil/projetos/${projetoId}`, { method: "DELETE" });
      setProjetos((atuais) => atuais.filter((projeto) => projeto.id !== projetoId));
    } catch (err) {
      setErroProjeto(err instanceof Error ? err.message : "Não foi possível remover o projeto.");
    }
  }

  async function sair() {
    try {
      await logout();
      router.replace("/login");
    } catch {
      setMensagem("Não foi possível sair agora.");
    }
  }

  if (authCarregando || carregando) {
    return <main className="p-8 font-mono text-[#314c53]">Carregando perfil...</main>;
  }
  if (!usuario || !perfil || !draft) {
    return <main className="p-8 font-mono text-red-600">{mensagem ?? "Perfil não encontrado."}</main>;
  }

  const foto = fotoPreview ?? perfil.fotoUrl;
  const membroDesde = new Date(usuario.criadoEm).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-10 font-mono text-[#010300] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#bbdec6] text-2xl font-bold">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto} alt={`Foto de ${usuario.nome}`} className="h-full w-full object-cover" />
                ) : (
                  iniciais(usuario.nome)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{usuario.nome}</h1>
                <p className="mt-1 text-sm text-[#314c53]/70">{usuario.email}</p>
                <p className="mt-2 text-xs capitalize text-[#5a7f78]">
                  {usuario.papel.toLowerCase()} · membro desde {membroDesde}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {editando ? (
                <>
                  <button
                    type="submit"
                    form="editar-perfil"
                    disabled={salvando}
                    className="inline-flex items-center gap-2 rounded-full bg-[#314c53] px-4 py-2 text-xs font-bold text-white hover:bg-[#010300] disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar alterações"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    disabled={salvando}
                    className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 px-4 py-2 text-xs font-bold text-[#314c53] hover:bg-[#f7f8fc]"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="inline-flex items-center gap-2 rounded-full border border-[#314c53]/20 px-4 py-2 text-xs font-bold text-[#314c53] hover:bg-[#bbdec6]"
                >
                  <Edit3 className="h-4 w-4" /> Editar perfil
                </button>
              )}
              <button
                type="button"
                onClick={sair}
                className="inline-flex items-center gap-2 rounded-full bg-[#010300] px-4 py-2 text-xs font-bold text-white hover:bg-[#314c53]"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
          {mensagem && (
            <p className="mt-5 rounded-xl bg-[#f7f8fc] px-4 py-3 text-sm text-[#314c53]" role="status">
              {mensagem}
            </p>
          )}
        </section>

        <form id="editar-perfil" onSubmit={salvarPerfil} className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Seu perfil</p>
            <h2 className="mt-2 text-xl font-bold">Informações públicas</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53] md:col-span-2">
              <span className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Biografia</span>
              {editando ? (
                <textarea
                  value={draft.bio ?? ""}
                  maxLength={1000}
                  onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                  className={`${campoClassName} min-h-32 resize-y`}
                  placeholder="Conte sobre sua experiência e seu trabalho"
                />
              ) : (
                <p className="rounded-xl bg-[#f7f8fc] px-4 py-3 leading-6">
                  {perfil.bio || "Ainda não adicionou uma biografia."}
                </p>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Telefone</span>
              {editando ? (
                <input
                  value={draft.telefone ?? ""}
                  maxLength={40}
                  onChange={(event) => setDraft({ ...draft, telefone: event.target.value })}
                  className={campoClassName}
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="rounded-xl bg-[#f7f8fc] px-4 py-3">{perfil.telefone || "Não informado"}</p>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53]">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Localização</span>
              {editando ? (
                <input
                  value={draft.localizacao ?? ""}
                  maxLength={120}
                  onChange={(event) => setDraft({ ...draft, localizacao: event.target.value })}
                  className={campoClassName}
                  placeholder="Cidade, UF ou remoto"
                />
              ) : (
                <p className="rounded-xl bg-[#f7f8fc] px-4 py-3">{perfil.localizacao || "Não informado"}</p>
              )}
            </label>

            {editando && (
              <label className="flex flex-col gap-2 text-sm font-medium text-[#314c53] md:col-span-2">
                <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Foto de perfil</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const arquivo = event.target.files?.[0] ?? null;
                    setFotoArquivo(arquivo);
                    setFotoPreview(arquivo ? URL.createObjectURL(arquivo) : null);
                  }}
                  className="block w-full rounded-xl border border-[#314c53]/20 bg-[#f7f8fc] p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#314c53] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                />
                <span className="text-xs text-[#314c53]/60">JPG, PNG ou WebP; até 2 MB. A foto é enviada ao salvar.</span>
              </label>
            )}
          </div>
        </form>

        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Portfólio</p>
            <h2 className="mt-2 text-xl font-bold">Adicionar um projeto</h2>
            <p className="mt-1 text-sm text-[#314c53]/70">Mostre trabalhos anteriores com uma descrição e uma imagem opcional.</p>
          </div>

          <form onSubmit={adicionarProjeto} className="grid gap-4 md:grid-cols-2">
            <input name="titulo" required maxLength={120} className={campoClassName} placeholder="Título do projeto" />
            <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp" className={campoClassName} />
            <textarea name="descricao" required maxLength={2000} className={`${campoClassName} min-h-28 resize-y md:col-span-2`} placeholder="Descreva o projeto e o trabalho realizado" />
            <p className="text-xs text-[#314c53]/60 md:col-span-2">Imagem opcional em JPG, PNG ou WebP; até 5 MB.</p>
            {erroProjeto && <p className="text-sm text-red-600 md:col-span-2" role="alert">{erroProjeto}</p>}
            <button
              type="submit"
              disabled={salvandoProjeto}
              className="w-fit rounded-full bg-[#314c53] px-5 py-3 text-xs font-bold text-white hover:bg-[#010300] disabled:opacity-50"
            >
              {salvandoProjeto ? "Adicionando..." : "Adicionar ao portfólio"}
            </button>
          </form>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {projetos.map((projeto) => (
              <article key={projeto.id} className="overflow-hidden rounded-2xl border border-[#314c53]/10 bg-[#f7f8fc]">
                {projeto.imagemUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={projeto.imagemUrl} alt={projeto.titulo} className="h-48 w-full object-cover" />
                )}
                <div className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-bold">{projeto.titulo}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#314c53]">{projeto.descricao}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerProjeto(projeto.id)}
                    aria-label={`Remover ${projeto.titulo}`}
                    className="shrink-0 rounded-full p-2 text-[#314c53]/60 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
            {projetos.length === 0 && <p className="text-sm text-[#314c53]/70">Seu portfólio ainda não tem projetos.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-[#314c53]/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a7f78]">Serviços publicados</p>
          <h2 className="mt-2 text-xl font-bold">O que você oferece</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {servicos.map((servico) => (
              <Link key={servico.id} href={`/servicos/${servico.id}`} className="rounded-2xl border border-[#314c53]/10 p-5 transition hover:border-[#5a7f78] hover:bg-[#f7f8fc]">
                <p className="text-xs uppercase tracking-wide text-[#5a7f78]">{servico.categoria.nome}</p>
                <h3 className="mt-2 font-bold">{servico.titulo}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#314c53]">{servico.descricao}</p>
                <p className="mt-4 font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(servico.preco)}</p>
              </Link>
            ))}
            {servicos.length === 0 && <p className="text-sm text-[#314c53]/70">Você ainda não publicou serviços.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
