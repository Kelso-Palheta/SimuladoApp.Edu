"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

export function LandingPricing({ onOpenAuth }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="precos" className="py-24 bg-[#eef0f8]/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#f60c49] mb-3">
            <span className="w-6 h-0.5 bg-[#f60c49]"></span>
            PLANOS TRANSPARENTES
            <span className="w-6 h-0.5 bg-[#f60c49]"></span>
          </div>
          <h2 className="font-head text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101942] tracking-tight">
            Investimento acessível que se paga no primeiro fim de semana livre.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6070a0]">
            Escolha o plano ideal para a sua rotina docente. Cancele quando quiser, sem fidelidade ou letras miúdas.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-white border border-[#dce0f0] shadow-xs">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                !isAnnual
                  ? "bg-[#101942] text-white shadow-xs"
                  : "text-[#6070a0] hover:text-[#101942]"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                isAnnual
                  ? "bg-[#f60c49] text-white shadow-xs"
                  : "text-[#6070a0] hover:text-[#101942]"
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                -25% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Gratuito */}
          <div className="p-8 rounded-3xl bg-white border border-[#dce0f0] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-6">
              <div>
                <h3 className="font-head text-xl font-bold text-[#101942]">Degustação Grátis</h3>
                <p className="text-xs text-[#6070a0] mt-1">Para você testar todo o poder da plataforma sem custos.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-head text-4xl font-extrabold text-[#101942]">R$ 0</span>
                <span className="text-xs text-[#6070a0] font-semibold">/para sempre</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#101942] font-medium border-t border-[#dce0f0] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span><strong>15 créditos de IA</strong> todo mês</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Diário pedagógico com até 2 turmas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Correção de redação ENEM</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Gerador de atividades BNCC</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenAuth("cadastro")}
                className="w-full btn-brand-ghost py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="w-4 h-4 text-[#f60c49]" />
              </button>
            </div>
          </div>

          {/* Card 2: Pro Ilimitado (Destaque) */}
          <div className="p-8 rounded-3xl bg-white border-2 border-[#f60c49] shadow-xl flex flex-col justify-between relative hover:scale-[1.02] transition-all">
            {/* Badge de Mais Popular */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#f60c49] text-white text-xs font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              MAIS ESCOLHIDO PELOS DOCENTES
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-head text-2xl font-extrabold text-[#101942]">Professor Pro</h3>
                <p className="text-xs text-[#6070a0] mt-1">Tudo ilimitado para transformar sua rotina letiva.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-head text-5xl font-extrabold text-[#101942]">
                  R$ {isAnnual ? "14,90" : "19,90"}
                </span>
                <span className="text-xs text-[#6070a0] font-semibold">/mês</span>
              </div>
              {isAnnual && (
                <p className="text-[11px] text-[#22c55e] font-bold">
                  Cobrado anualmente (R$ 178,80/ano — Economize R$ 60,00)
                </p>
              )}

              <ul className="space-y-3 text-xs sm:text-sm text-[#101942] font-semibold border-t border-[#dce0f0] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span><strong>Turmas e Alunos Ilimitados</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span><strong>Correções de Redação ENEM Ilimitadas</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Gerador de Atividades & Provas sem limite</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Calendário letivo com remanejamento automático</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Exportação de boletins em PDF e WhatsApp</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Suporte prioritário via WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenAuth("cadastro")}
                className="w-full btn-brand-primary py-4 text-base font-bold flex items-center justify-center gap-2 group shadow-lg shadow-[#f60c49]/20"
              >
                <span>Assinar Plano Pro</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-[11px] text-center text-[#6070a0] mt-2">
                Garantia incondicional de 7 dias. Cancele com 1 clique.
              </p>
            </div>
          </div>

          {/* Card 3: Pacotes Avulsos */}
          <div className="p-8 rounded-3xl bg-white border border-[#dce0f0] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-6">
              <div>
                <h3 className="font-head text-xl font-bold text-[#101942]">Pacotes de Créditos</h3>
                <p className="text-xs text-[#6070a0] mt-1">Para quem quer usar sob demanda em épocas de provas.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-head text-4xl font-extrabold text-[#101942]">A partir de R$ 29</span>
                <span className="text-xs text-[#6070a0] font-semibold">/único</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#101942] font-medium border-t border-[#dce0f0] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span><strong>Créditos que NUNCA expiram</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Pacote P (100 correções/questões): R$ 29,90</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Pacote M (250 correções/questões): R$ 49,90</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#f60c49] shrink-0" />
                  <span>Sem assinatura recorrente</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenAuth("cadastro")}
                className="w-full btn-brand-ghost py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Comprar Pacote Avulso</span>
                <ArrowRight className="w-4 h-4 text-[#f60c49]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
