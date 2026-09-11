import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/firebase/AuthProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Fluxo | Serviços Premium",
  description: "Conectando você aos melhores profissionais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jetbrainsMono.variable}`}>
      <body className="font-mono antialiased bg-[#f7f8fc] text-[#010300] flex min-h-screen selection:bg-[#5a7f78] selection:text-white">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col transition-all duration-300 pt-20">
            <div className="flex-1">
              {children}
            </div>
            <footer className="bg-[#010300] text-white py-12 px-8 lg:px-16 mt-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                  <h3 className="font-mono text-2xl mb-4 text-[#bbdec6] font-bold">Fluxo.</h3>
                  <p className="text-[#bbdec6]/70 font-light max-w-sm">
                    A curadoria definitiva de profissionais de excelência. Qualidade sem concessões.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4 tracking-wide uppercase text-sm text-[#bbdec6]">Navegação</h4>
                  <ul className="space-y-3 text-[#f7f8fc]/80 font-light">
                    <li><a href="#" className="hover:text-[#bbdec6] transition-colors">Início</a></li>
                    <li><a href="#" className="hover:text-[#bbdec6] transition-colors">Serviços</a></li>
                    <li><a href="#" className="hover:text-[#bbdec6] transition-colors">Profissionais</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4 tracking-wide uppercase text-sm text-[#bbdec6]">Legal</h4>
                  <ul className="space-y-3 text-[#f7f8fc]/80 font-light">
                    <li><a href="#" className="hover:text-[#bbdec6] transition-colors">Termos de Uso</a></li>
                    <li><a href="#" className="hover:text-[#bbdec6] transition-colors">Privacidade</a></li>
                  </ul>
                </div>
              </div>
              <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#314c53] text-center text-sm text-[#bbdec6]/50">
                © {new Date().getFullYear()} Fluxo Serviços. Todos os direitos reservados.
              </div>
            </footer>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}