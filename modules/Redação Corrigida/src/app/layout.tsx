import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redação AI - Corretor Digital Elite",
  description: "Assistente de correção de redações baseado nos critérios do INEP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-neutral-950 text-white selection:bg-violet-500/30 overflow-x-hidden`}>
        <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-10 flex min-h-screen max-w-7xl mx-auto border-x border-white/5">
          <Sidebar />
          <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto relative">
            {children}
            <footer className="mt-auto py-8 text-center">
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-medium">Redação Corrigida ENEM • 2026</p>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
