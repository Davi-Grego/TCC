"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type Props = { usuario: { nome: string; email: string } };

const navItems = [
  { href: "/discover", label: "Discover" },
  { href: "/projetos", label: "Projetos" },
  { href: "/contratacoes", label: "Contratações" },
  { href: "/perfil", label: "Perfil" },
];

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ usuario }: Props) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between bg-gradient-to-b from-[#010300] to-[#314c53] px-4 py-6 font-mono">
      <div>
        <Link href="/discover" className="block px-2 text-sm font-medium tracking-wide text-[#f7f8fc]">
          Fluxo
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md border-l-2 px-3 py-2 text-sm transition ${
                  ativo
                    ? "border-[#bbdec6] bg-[#f7f8fc]/10 text-[#f7f8fc]"
                    : "border-transparent text-[#bbdec6]/70 hover:bg-[#f7f8fc]/5 hover:text-[#f7f8fc]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 border-t border-[#f7f8fc]/10 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#bbdec6] text-xs font-medium text-[#010300]">
          {iniciais(usuario.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#f7f8fc]">{usuario.nome}</p>
          <p className="truncate text-[11px] text-[#bbdec6]/60">{usuario.email}</p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="shrink-0 text-xs text-[#bbdec6]/70 underline underline-offset-2 hover:text-[#f7f8fc]"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}