"use client";

export function LandingTicker() {
  const items = [
    "DIÁRIO DE NOTAS AUTOMÁTICO",
    "CORREÇÃO DE REDAÇÃO ENEM COM IA",
    "GERADOR DE ATIVIDADES BNCC",
    "GRADE HORÁRIA INTELIGENTE",
    "DEVOLUTIVAS PEDAGÓGICAS FORMATIVAS",
    "EXPORTAÇÃO DE BOLETINS EM 1 CLIQUE",
    "AGENTES ESPECIALISTAS ENEM",
    "IMPORTAÇÃO INTELIGENTE DE PLANOS",
  ];

  return (
    <div className="border-y border-[#dce0f0] py-6 overflow-hidden bg-white">
      <div className="flex animate-marquee gap-14 items-center">
        {[...items, ...items].map((text, idx) => (
          <div
            key={idx}
            className="flex items-center gap-14 text-sm sm:text-base font-extrabold text-[#9098c0] tracking-wider whitespace-nowrap"
          >
            <span className="text-[#101942]/60 hover:text-[#f60c49] transition-colors">{text}</span>
            <span className="w-2 h-2 rounded-full bg-[#f60c49]/40"></span>
          </div>
        ))}
      </div>
    </div>
  );
}
