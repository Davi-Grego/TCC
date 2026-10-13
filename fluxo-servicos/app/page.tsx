"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function Home() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && usuario) router.replace("/discover");
  }, [carregando, usuario, router]);

  // enquanto o Firebase verifica a sessão, não mostra nada
  if (carregando || usuario) return null;

  return (
    <div className="flex flex-col w-full pb-24 font-mono min-h-screen bg-[#f7f8fc]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#f7f8fc]/80 backdrop-blur-md border-b border-[#314c53]/10 px-8 lg:px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#010300] flex items-center justify-center rounded-sm">
            <span className="text-[#f7f8fc] font-black text-xl leading-none">F</span>
          </div>
          <span className="text-[#010300] font-black tracking-tighter text-xl">
            FLUXOSERVIÇOS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#314c53] uppercase tracking-widest">
          <Link href="/discover" className="hover:text-[#5a7f78] transition-colors">
            Descobrir
          </Link>
          <a href="#vantagens" className="hover:text-[#5a7f78] transition-colors">
            Vantagens
          </a>
          <Link href="/login" className="hover:text-[#5a7f78] transition-colors">
            Sou Profissional
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold text-[#314c53] uppercase tracking-widest hover:text-[#010300] transition-colors hidden sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="bg-[#010300] text-[#f7f8fc] px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#314c53] transition-colors rounded-sm"
          >
            Começar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center px-8 lg:px-20 overflow-hidden">
        {/* Abstract geometric element */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#5a7f78]/10 transform origin-top-right skew-x-[-15deg] translate-x-20 hidden lg:block" />
        
        <div className="relative z-10 max-w-4xl pt-12 lg:pt-0">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-[#bbdec6]/30 border border-[#5a7f78]/20 text-[#314c53] text-xs font-bold tracking-widest uppercase mb-8 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#5a7f78] animate-pulse"></span>
            Acesso Restrito
          </div>
          
          <h1 className="text-5xl lg:text-7xl text-[#010300] font-black leading-[1.1] mb-6 tracking-tighter">
            Conectando você aos <br />
            <span className="text-[#5a7f78]">melhores profissionais.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-[#314c53] font-medium mb-10 max-w-2xl leading-relaxed">
            Plataforma exclusiva para contratação de especialistas técnicos e criativos. Qualidade garantida, sem fricção.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/discover"
              className="group flex items-center justify-center gap-3 bg-[#010300] text-[#f7f8fc] px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#314c53] transition-all duration-300 rounded-sm"
            >
              Encontrar Especialista
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center bg-transparent border-2 border-[#314c53] text-[#314c53] px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#314c53] hover:text-[#f7f8fc] transition-all duration-300 rounded-sm"
            >
              Sou Profissional
            </Link>
          </div>
        </div>

        {/* Hero Decorative Area */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-[40%] h-[60vh]">
            <div className="w-full h-full relative grid grid-cols-2 gap-4">
               <div className="bg-[#314c53] rounded-tl-3xl rounded-br-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity duration-500"></div>
               </div>
               <div className="bg-[#5a7f78] rounded-tr-3xl rounded-bl-3xl overflow-hidden mt-12 relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity duration-500"></div>
               </div>
               {/* Floating Badge */}
               <div className="absolute -left-12 top-1/3 bg-[#f7f8fc] border-2 border-[#bbdec6] p-4 rounded-xl shadow-xl flex items-center gap-4">
                  <div className="bg-[#bbdec6]/30 p-2 rounded-lg">
                    <Star className="text-[#5a7f78] w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#010300]">4.9/5</p>
                    <p className="text-xs text-[#314c53] font-bold">Média Plataforma</p>
                  </div>
               </div>
            </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-8 lg:px-20 py-24 bg-[#010300]">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl text-[#f7f8fc] font-black mb-4 tracking-tight">Demandas em alta</h2>
            <p className="text-[#bbdec6]/80 font-medium text-lg">Especialistas prontos para resolver seus desafios mais complexos.</p>
          </div>
          <Link href="/discover" className="text-sm font-bold tracking-widest uppercase text-[#5a7f78] hover:text-[#bbdec6] transition-colors flex items-center gap-2 w-fit">
            Ver todas categorias <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Desenvolvimento Full-stack", desc: "Aplicações web e mobile robustas.", color: "bg-[#314c53]" },
            { title: "UI/UX Design Avançado", desc: "Interfaces focadas em conversão.", color: "bg-[#5a7f78]" },
            { title: "Arquitetura Cloud", desc: "Infraestrutura escalável e segura.", color: "bg-[#010300] border border-[#314c53]" },
          ].map((service, idx) => (
            <Link href="/discover" key={idx} className={`block group cursor-pointer p-8 rounded-xl ${service.color} hover:-translate-y-2 transition-transform duration-300`}>
              <div className="w-12 h-12 bg-[#f7f8fc]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#bbdec6]/20 transition-colors">
                <Zap className="text-[#bbdec6] w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#f7f8fc] mb-3">{service.title}</h3>
              <p className="text-sm text-[#bbdec6]/70">{service.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section id="vantagens" className="px-8 lg:px-20 py-32 bg-[#f7f8fc] text-[#010300]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2">
            <div className="inline-block p-3 bg-[#bbdec6]/30 rounded-2xl mb-6">
              <ShieldCheck className="w-8 h-8 text-[#5a7f78]" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight tracking-tight">
              Garantia de <br/>
              <span className="text-[#5a7f78]">Qualidade Absoluta.</span>
            </h2>
            
            <div className="space-y-10 mt-12">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-2 h-2 bg-[#314c53] rotate-45"></div>
                  <h4 className="text-xl font-bold mb-2">Processo Seletivo Rigoroso</h4>
                  <p className="text-[#314c53] font-medium leading-relaxed">Aprovamos apenas os top 5% dos candidatos. Análise técnica, portfólio e fit cultural.</p>
                </div>
                <div className="relative pl-8">
                   <div className="absolute left-0 top-1.5 w-2 h-2 bg-[#314c53] rotate-45"></div>
                  <h4 className="text-xl font-bold mb-2">Pagamento Protegido</h4>
                  <p className="text-[#314c53] font-medium leading-relaxed">Seu dinheiro fica em escrow. O profissional só recebe após a sua aprovação final do escopo entregue.</p>
                </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
              <div className="aspect-square bg-[#bbdec6] rounded-full absolute -top-10 -left-10 w-64 h-64 mix-blend-multiply opacity-50 blur-3xl"></div>
              <div className="aspect-square bg-[#5a7f78] rounded-full absolute -bottom-10 -right-10 w-64 h-64 mix-blend-multiply opacity-30 blur-3xl"></div>
              
              <div className="relative z-10 bg-[#010300] rounded-2xl p-1 shadow-2xl">
                <div className="border border-[#314c53] rounded-xl p-8 bg-gradient-to-br from-[#010300] to-[#314c53]/30">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#314c53]">
                    <div>
                      <p className="text-[#bbdec6] text-sm font-bold mb-1">Status do Projeto</p>
                      <p className="text-[#f7f8fc] text-2xl font-black">Em Andamento</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-[#5a7f78] flex items-center justify-center">
                       <span className="text-[#bbdec6] font-bold">65%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 bg-[#f7f8fc]/5 p-4 rounded-lg">
                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${i < 2 ? 'bg-[#5a7f78]' : 'border-2 border-[#314c53]'}`}>
                          {i < 2 && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-[#314c53] rounded-full w-3/4 mb-2"></div>
                          <div className="h-2 bg-[#314c53]/50 rounded-full w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}