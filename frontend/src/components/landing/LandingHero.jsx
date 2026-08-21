"use client";

import { useState } from "react";
import { ArrowRight, Play, CheckCircle2, Sparkles, BookOpen, PenTool, Calendar, ShieldCheck } from "lucide-react";

export function LandingHero({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("diario"); // "diario" | "redacao" | "calendario"

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#fff2f6]/40 via-white to-white">
      {/* Círculo radial decorativo de fundo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#f60c49]/10 via-[#f60c49]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-[#101942]/5 rounded-full blur-3xl pointer-events-none -ml-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Lado Esquerdo - Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#fff2f6] border border-[#fde4ec] text-[#d40840] text-xs sm:text-sm font-bold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f60c49] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f60c49]"></span>
              </span>
              <span>NOVO: Hub de Inteligência Artificial para Professores</span>
            </div>

            {/* Headline Manrope */}
            <h1 className="font-head text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101942] tracking-tight leading-[1.08]">
              O SimuladoApp.Edu{" "}
              <span className="text-[#f60c49] relative whitespace-nowrap inline-block">
                devolve seus
                <svg
                  className="absolute left-0 right-0 -bottom-2 w-full h-3 text-[#f60c49]/30"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0 15 Q50 0 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>{" "}
              finais de semana.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#6070a0] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Diga adeus às noites corrigindo pilhas de provas e preenchendo planilhas. Crie atividades alinhadas à BNCC, corrija redações no padrão ENEM em segundos e feche notas bimestrais com 1 clique.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenAuth("cadastro")}
                className="w-full sm:w-auto btn-brand-primary text-base py-3.5 px-8 flex items-center justify-center gap-2.5 group"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </button>

              <a
                href="#jornada"
                className="w-full sm:w-auto btn-brand-ghost text-base py-3.5 px-7 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-[#f60c49] fill-[#f60c49]" />
                <span>Ver Como Funciona</span>
              </a>
            </div>

            {/* Micro Prova Social */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-[#6070a0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#f60c49]" />
                <span className="font-semibold text-[#101942]">Sem cartão</span> de crédito
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#f60c49]" />
                <span className="font-semibold text-[#101942]">15 créditos grátis</span> todo mês
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#f60c49]" />
                <span className="font-semibold text-[#101942]">100% alinhado</span> à BNCC/SAEB
              </div>
            </div>
          </div>

          {/* Lado Direito - Mockup Frame macOS Interativo (.device) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Moldura macOS */}
              <div className="bg-white rounded-2xl shadow-2xl border border-[#dce0f0] overflow-hidden">
                {/* Barra do macOS */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f7f8fc] border-b border-[#dce0f0]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="px-3 py-1 bg-white border border-[#dce0f0] rounded-md text-[11px] font-medium text-[#9098c0] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    simuladoapp.com.br/edu/hub
                  </div>
                  <div className="w-10" />
                </div>

                {/* Abas do Mockup */}
                <div className="flex border-b border-[#dce0f0] bg-[#eef0f8]/50 p-1.5 gap-1 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab("diario")}
                    className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "diario"
                        ? "bg-white text-[#101942] shadow-xs"
                        : "text-[#6070a0] hover:text-[#101942]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#f60c49]" />
                    <span>Diário</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("redacao")}
                    className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "redacao"
                        ? "bg-white text-[#101942] shadow-xs"
                        : "text-[#6070a0] hover:text-[#101942]"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#f60c49]" />
                    <span>Redação IA</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("calendario")}
                    className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "calendario"
                        ? "bg-white text-[#101942] shadow-xs"
                        : "text-[#6070a0] hover:text-[#101942]"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#f60c49]" />
                    <span>Grade</span>
                  </button>
                </div>

                {/* Corpo do Mockup conforme aba selecionada */}
                <div className="p-5 bg-white min-h-[320px] flex flex-col justify-between">
                  {activeTab === "diario" && (
                    <div className="space-y-3 animate-card-in">
                      <div className="flex items-center justify-between pb-2 border-b border-[#dce0f0]">
                        <div>
                          <div className="text-xs font-bold text-[#101942]">Turma 3º Ano B — Língua Portuguesa</div>
                          <div className="text-[11px] text-[#6070a0]">Fechamento 3º Bimestre • 34 Alunos</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#eef0f8] text-[#101942]">
                          Média: 8.4
                        </span>
                      </div>

                      {/* Mini Tabela de Alunos */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#fff2f6] border border-[#fde4ec]">
                          <span className="font-semibold text-[#101942]">Beatriz Santos</span>
                          <span className="text-[#6070a0]">Simulado: 9.0 | Redação: 9.5</span>
                          <span className="font-bold text-[#d40840]">Final: 9.3</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#f7f8fc] border border-[#dce0f0]">
                          <span className="font-semibold text-[#101942]">Lucas Oliveira</span>
                          <span className="text-[#6070a0]">Simulado: 8.0 | Redação: 8.5</span>
                          <span className="font-bold text-[#101942]">Final: 8.3</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#f7f8fc] border border-[#dce0f0]">
                          <span className="font-semibold text-[#101942]">Mariana Costa</span>
                          <span className="text-[#6070a0]">Simulado: 7.5 | Redação: 8.0</span>
                          <span className="font-bold text-[#101942]">Final: 7.8</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#6070a0]">
                        <span className="flex items-center gap-1 text-[#22c55e] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Planilha sincronizada
                        </span>
                        <span className="font-bold text-[#f60c49]">1 clique para exportar</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "redacao" && (
                    <div className="space-y-3 animate-card-in">
                      <div className="flex items-center justify-between pb-2 border-b border-[#dce0f0]">
                        <div>
                          <div className="text-xs font-bold text-[#101942]">Correção por IA — Padrão ENEM</div>
                          <div className="text-[11px] text-[#6070a0]">Tema: Desafios da IA na Educação Brasileira</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#f60c49] text-white">
                          920 / 1000
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center p-1.5 bg-[#f7f8fc] rounded border border-[#dce0f0]">
                          <span className="text-[#101942] font-medium">C1: Norma Culta</span>
                          <span className="font-bold text-[#101942]">160 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-[#f7f8fc] rounded border border-[#dce0f0]">
                          <span className="text-[#101942] font-medium">C2: Tema e Repertório</span>
                          <span className="font-bold text-[#101942]">200 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-[#f7f8fc] rounded border border-[#dce0f0]">
                          <span className="text-[#101942] font-medium">C3: Projeto de Texto</span>
                          <span className="font-bold text-[#101942]">180 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-[#f7f8fc] rounded border border-[#dce0f0]">
                          <span className="text-[#101942] font-medium">C5: Proposta de Intervenção</span>
                          <span className="font-bold text-[#101942]">200 pts</span>
                        </div>
                      </div>

                      <div className="p-2 bg-[#fff2f6] rounded-lg border border-[#fde4ec] text-[11px] text-[#d40840]">
                        <span className="font-bold">Devolutiva da IA:</span> Excelente uso de conectivos interparágrafos e repertório legitimado da UNESCO.
                      </div>
                    </div>
                  )}

                  {activeTab === "calendario" && (
                    <div className="space-y-3 animate-card-in">
                      <div className="flex items-center justify-between pb-2 border-b border-[#dce0f0]">
                        <div>
                          <div className="text-xs font-bold text-[#101942]">Grade Letiva Semanal</div>
                          <div className="text-[11px] text-[#6070a0]">Distribuição inteligente de tópicos</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#eef0f8] text-[#101942]">
                          40 Aulas Alocadas
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-[#f7f8fc] border border-[#dce0f0]">
                          <div className="text-[10px] font-bold text-[#6070a0] uppercase">Segunda</div>
                          <div className="font-bold text-[#101942] mt-1 text-xs">07:30 - 09:10</div>
                          <div className="text-[10px] text-[#f60c49] font-medium mt-1">Sintaxe do Período</div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#fff2f6] border border-[#fde4ec]">
                          <div className="text-[10px] font-bold text-[#d40840] uppercase">Quarta</div>
                          <div className="font-bold text-[#101942] mt-1 text-xs">09:30 - 11:10</div>
                          <div className="text-[10px] text-[#d40840] font-medium mt-1">Oficina de Redação</div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#f7f8fc] border border-[#dce0f0]">
                          <div className="text-[10px] font-bold text-[#6070a0] uppercase">Sexta</div>
                          <div className="font-bold text-[#101942] mt-1 text-xs">07:30 - 08:20</div>
                          <div className="text-[10px] text-[#101942] font-medium mt-1">Simulado Diagnóstico</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#eef0f8] rounded-lg text-[11px] text-[#101942] flex items-center justify-between">
                        <span>Arraste e solte para remanejar aulas</span>
                        <span className="font-bold text-[#f60c49]">Zero conflitos</span>
                      </div>
                    </div>
                  )}

                  {/* Footerzinho do Mockup com Botão de Teste */}
                  <div className="pt-3 border-t border-[#dce0f0] flex items-center justify-between">
                    <span className="text-[11px] text-[#9098c0]">Tempo médio gasto: <strong>35 segundos</strong></span>
                    <button
                      onClick={() => onOpenAuth("cadastro")}
                      className="text-xs font-bold text-[#f60c49] hover:underline flex items-center gap-1"
                    >
                      Testar com meus dados →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
