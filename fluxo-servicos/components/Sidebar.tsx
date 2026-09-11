"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Compass, FolderKanban, MessageSquare, Bookmark, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { usuario } = useAuth();

  const navItems = [
    { name: "Descobrir", path: "/", icon: Compass },
    { name: "Meus Projetos", path: "/projetos", icon: FolderKanban },
    { name: "Mensagens", path: "/mensagens", icon: MessageSquare },
    { name: "Salvos", path: "/salvos", icon: Bookmark },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 right-5 z-50 p-2 bg-[#f7f8fc] rounded-md shadow-md text-[#010300] hover:bg-[#bbdec6]/30 transition-colors border border-[#314c53]/10"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed top-0 left-0 right-0 z-40 h-20 bg-[#010300] text-[#f7f8fc] border-b border-[#314c53] shadow-2xl transform transition-transform duration-500 ease-in-out flex items-center ${
          isOpen ? "translate-y-0" : "-translate-y-full lg:translate-y-0"
        }`}
      >
        <div className="flex h-full w-full items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="inline-block" onClick={() => setIsOpen(false)}>
              <span className="font-mono text-3xl font-bold tracking-tighter text-[#f7f8fc]">
                Fluxo<span className="text-[#5a7f78]">_</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md relative group overflow-hidden ${
                      isActive
                        ? "text-[#010300] bg-[#bbdec6]"
                        : "text-[#bbdec6]/70 hover:text-[#f7f8fc] hover:bg-[#314c53]/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-[#010300]" : "text-[#5a7f78] group-hover:text-[#bbdec6]"}`} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/perfil"
              className="flex items-center gap-3 group rounded-md hover:bg-[#314c53]/50 transition-colors px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="w-8 h-8 text-[#5a7f78] group-hover:text-[#bbdec6] transition-colors" />
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[#f7f8fc]">{usuario?.nome ?? "Visitante"}</p>
                <p className="text-[11px] text-[#bbdec6]/60 font-mono">Ver perfil</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-[#010300]/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}