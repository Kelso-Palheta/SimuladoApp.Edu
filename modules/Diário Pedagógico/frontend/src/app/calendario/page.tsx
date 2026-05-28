"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useCalendarSync,
  useCalendarEvents,
  useDistribute,
  useListarPlanejamentos,
  useHorarios,
  useSalvarHorarios,
  useDistribuirManual,
  type Horario,
} from "@/hooks/useApi";

const PROFESSOR_ID = "prof-123";
const hoje = new Date();
const dataInicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split("T")[0];
const dataFim = new Date(hoje.getFullYear(), 11, 31).toISOString().split("T")[0];

const DIAS_SEMANA_MAP = [
  { value: 2, label: "Segunda-feira" },
  { value: 3, label: "Terça-feira" },
  { value: 4, label: "Quarta-feira" },
  { value: 5, label: "Quinta-feira" },
  { value: 6, label: "Sexta-feira" },
  { value: 7, label: "Sábado" },
  { value: 1, label: "Domingo" },
];

export default function CalendarioPage() {
  const [activeTab, setActiveTab] = useState<"local" | "google">("local");
  const [synced, setSynced] = useState(false);

  // --- Planejamento Selecionado ---
  const [selectedPlanoId, setSelectedPlanoId] = useState<string>("");

  // --- Hooks de listagem e eventos ---
  const { data: planejamentos, isLoading: loadingPlanos } = useListarPlanejamentos(PROFESSOR_ID);
  const { data: calData, isLoading: loadingEvents } = useCalendarEvents(
    PROFESSOR_ID,
    dataInicio,
    dataFim
  );

  // --- Hooks de Horários ---
  const { data: dbHorarios, isLoading: loadingHorarios } = useHorarios(selectedPlanoId);
  const [horariosTemporarios, setHorariosTemporarios] = useState<Horario[]>([]);

  // Sincronizar horários do banco com estado local ao carregar ou trocar planejamento
  useEffect(() => {
    if (dbHorarios) {
      setHorariosTemporarios(dbHorarios);
    } else {
      setHorariosTemporarios([]);
    }
  }, [dbHorarios]);

  // Form de Novo Horário
  const [novoHorario, setNovoHorario] = useState({
    dia_semana: 2, // Segunda
    horario_inicio: "08:00",
    duracao_minutos: 50,
  });

  // --- Hooks do Google Calendar ---
  const { mutate: sync, isPending: syncing } = useCalendarSync();
  const { mutate: distribute, data: distResult, isPending: distribuindoGoogle } = useDistribute();

  // --- Hooks de Distribuição Local ---
  const { mutate: salvarHorarios, isPending: salvandoHorarios } = useSalvarHorarios();
  const { mutate: distribuirManual, data: distManualResult, isPending: distribuindoManual } = useDistribuirManual();

  function handleSync() {
    sync(
      { professor_id: PROFESSOR_ID },
      { onSuccess: () => setSynced(true) }
    );
  }

  function handleAddHorario() {
    if (!novoHorario.horario_inicio || !novoHorario.duracao_minutos) return;
    const item: Horario = {
      dia_semana: novoHorario.dia_semana,
      horario_inicio: novoHorario.horario_inicio,
      duracao_minutos: novoHorario.duracao_minutos,
    };
    
    // Evitar duplicados exatos
    const duplicado = horariosTemporarios.some(
      (h) => h.dia_semana === item.dia_semana && h.horario_inicio === item.horario_inicio
    );
    if (duplicado) return;

    setHorariosTemporarios([...horariosTemporarios, item]);
  }

  function handleRemoveHorario(index: number) {
    setHorariosTemporarios(horariosTemporarios.filter((_, i) => i !== index));
  }

  function handleSalvarGrade() {
    if (!selectedPlanoId) return;
    salvarHorarios({
      planejamentoId: selectedPlanoId,
      horarios: horariosTemporarios,
    });
  }

  function handleDistribuirLocal() {
    if (!selectedPlanoId) return;
    distribuirManual({
      planejamentoId: selectedPlanoId,
      professor_id: PROFESSOR_ID,
    });
  }

  // Filtrar aulas planejadas para exibir apenas as que pertencem ao planejamento selecionado
  const aulasFiltradas = calData?.aulas_planejadas || [];

  return (
    <Shell>
      <div className="space-y-12 px-8 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Calendário</p>
              <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em]">
                Organize e Distribua suas <span className="gradient-text">Aulas</span>
              </h2>
              <p className="max-w-prose text-fg-muted">
                Configure sua grade horária semanal local ou conecte seu Google Calendar para estruturar suas aulas letivas automaticamente.
              </p>
            </div>
            
            {/* Tab Switched Capsule */}
            <div className="flex bg-bg-soft p-1 rounded-full border border-border shrink-0 self-start md:self-auto">
              <button
                onClick={() => setActiveTab("local")}
                className={`px-5 py-2 text-xs font-medium rounded-full transition-all ${
                  activeTab === "local"
                    ? "bg-accent-400 text-bg font-semibold shadow-s"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Grade Horária Local
              </button>
              <button
                onClick={() => setActiveTab("google")}
                className={`px-5 py-2 text-xs font-medium rounded-full transition-all ${
                  activeTab === "google"
                    ? "bg-accent-400 text-bg font-semibold shadow-s"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Google Calendar
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Tab 1: Grade Horária Local */}
        {activeTab === "local" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Painel de Configurações da Grade Horária */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatedSection delay={0.05}>
                  <GlassCard>
                    <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">
                      Configuração da Grade Semanal
                    </h3>
                    <p className="text-sm text-fg-muted mt-1">
                      Selecione um planejamento e defina as aulas semanais recorrentes da turma.
                    </p>

                    {/* Dropdown de Planejamento */}
                    <div className="mt-6 space-y-2">
                      <span className="text-xs font-medium text-fg-muted block">Planejamento Ativo</span>
                      {loadingPlanos ? (
                        <div className="h-10 w-full animate-pulse rounded-m bg-bg-soft" />
                      ) : planejamentos && planejamentos.length > 0 ? (
                        <select
                          value={selectedPlanoId}
                          onChange={(e) => setSelectedPlanoId(e.target.value)}
                          className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                        >
                          <option value="">Selecione um planejamento...</option>
                          {planejamentos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.disciplina} — {p.serie}{p.turma ? ` (${p.turma})` : ""} ({p.ano_letivo})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="rounded-m border border-border bg-bg-soft/40 p-4 text-center">
                          <p className="text-sm text-fg-muted">Nenhum planejamento encontrado.</p>
                          <a href="/planejamento" className="inline-block mt-3 text-xs text-accent-400 hover:underline">
                            Criar ou importar planejamento agora →
                          </a>
                        </div>
                      )}
                    </div>

                    {selectedPlanoId && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 border-t border-border pt-6 space-y-6"
                      >
                        {/* Adicionar Novo Horário */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Adicionar Aula à Grade</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <label className="space-y-1.5">
                              <span className="text-xs text-fg-muted">Dia da Semana</span>
                              <select
                                value={novoHorario.dia_semana}
                                onChange={(e) => setNovoHorario({ ...novoHorario, dia_semana: +e.target.value })}
                                className="w-full rounded-m border border-border bg-bg-soft px-3 py-2 text-xs outline-none focus:border-accent-400"
                              >
                                {DIAS_SEMANA_MAP.map((d) => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                            </label>
                            
                            <label className="space-y-1.5">
                              <span className="text-xs text-fg-muted">Horário de Início</span>
                              <input
                                type="time"
                                value={novoHorario.horario_inicio}
                                onChange={(e) => setNovoHorario({ ...novoHorario, horario_inicio: e.target.value })}
                                className="w-full rounded-m border border-border bg-bg-soft px-3 py-2 text-xs outline-none focus:border-accent-400"
                              />
                            </label>

                            <label className="space-y-1.5">
                              <span className="text-xs text-fg-muted">Duração (minutos)</span>
                              <input
                                type="number" min={1} max={300}
                                value={novoHorario.duracao_minutos}
                                onChange={(e) => setNovoHorario({ ...novoHorario, duracao_minutos: +e.target.value })}
                                className="w-full rounded-m border border-border bg-bg-soft px-3 py-2 text-xs outline-none focus:border-accent-400"
                              />
                            </label>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleAddHorario}
                            className="w-full sm:w-auto text-xs px-4 py-2 bg-bg-soft hover:bg-border rounded-m border border-border transition-colors font-medium"
                          >
                            + Adicionar Horário à Lista
                          </button>
                        </div>

                        {/* Lista de Horários Temporários */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-fg-muted">Horários na Grade</h4>
                          {loadingHorarios ? (
                            <div className="space-y-2 animate-pulse">
                              <div className="h-8 rounded bg-bg-soft w-2/3" />
                              <div className="h-8 rounded bg-bg-soft w-1/2" />
                            </div>
                          ) : horariosTemporarios.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {horariosTemporarios.map((h, index) => {
                                const diaLabel = DIAS_SEMANA_MAP.find((d) => d.value === h.dia_semana)?.label || "";
                                return (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-2 rounded-m bg-accent-400/10 border border-accent-400/20 px-3 py-1.5 text-xs text-accent-400 font-medium"
                                  >
                                    <span>{diaLabel} às {h.horario_inicio} ({h.duracao_minutos} min)</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveHorario(index)}
                                      className="text-accent-400 hover:text-red-400 font-bold transition-colors ml-1 text-sm leading-none"
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-fg-muted italic">Nenhum horário adicionado na grade ainda.</p>
                          )}
                        </div>

                        {/* Ações da Grade */}
                        <div className="flex gap-3 border-t border-border pt-5">
                          <MagneticButton
                            disabled={salvandoHorarios}
                            onClick={handleSalvarGrade}
                            variant="secondary"
                            className="text-xs"
                          >
                            {salvandoHorarios ? "Salvando..." : "Salvar Grade Horária"}
                          </MagneticButton>
                          
                          <MagneticButton
                            disabled={horariosTemporarios.length === 0 || distribuindoManual}
                            onClick={handleDistribuirLocal}
                            className="text-xs font-semibold"
                          >
                            {distribuindoManual ? "Distribuindo..." : "✦ Distribuir Aulas Localmente"}
                          </MagneticButton>
                        </div>
                      </motion.div>
                    )}
                  </GlassCard>
                </AnimatedSection>
              </div>

              {/* Box de Resumo Lateral */}
              <div className="space-y-6">
                <AnimatedSection delay={0.1}>
                  <GlassCard className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-accent-400">
                        Como Funciona
                      </h3>
                      <div className="mt-4 space-y-4 text-xs text-fg-muted leading-relaxed">
                        <p>
                          <strong>1. Selecione o planejamento:</strong> Escolha qual plano curricular deseja alocar no ano letivo.
                        </p>
                        <p>
                          <strong>2. Defina os horários da turma:</strong> Defina os dias da semana e horários em que você tem aulas com essa turma (ex: Terças às 07:30 e Quintas às 09:15).
                        </p>
                        <p>
                          <strong>3. Distribua localmente:</strong> A IA pegará todos os conteúdos ordenados do planejamento anual e os distribuirá sequencialmente nas datas letivas da sua grade, pulando feriados locais de forma offline e inteligente.
                        </p>
                      </div>
                    </div>
                    {distManualResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 rounded-m bg-success/10 p-3.5 border border-success/20 text-xs text-success"
                      >
                        <p className="font-semibold">✓ Distribuição Concluída!</p>
                        <p className="mt-1">
                          <strong>{distManualResult.total}</strong> aulas geradas no calendário local.
                        </p>
                        {distManualResult.nao_alocados > 0 && (
                          <p className="mt-1 text-red-300">
                            ⚠️ {distManualResult.nao_alocados} conteúdos não puderam ser alocados (ano letivo curto).
                          </p>
                        )}
                      </motion.div>
                    )}
                  </GlassCard>
                </AnimatedSection>
              </div>
            </div>

            {/* Aulas Planejadas */}
            {selectedPlanoId && (
              <AnimatedSection delay={0.15}>
                <GlassCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">Aulas Distribuídas</h3>
                      <p className="text-sm text-fg-muted mt-1">
                        Visualização da distribuição sequencial das aulas no calendário escolar.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent-400/10 text-accent-400">
                      {aulasFiltradas.length} aulas geradas
                    </span>
                  </div>

                  {loadingEvents ? (
                    <div className="mt-6 space-y-2 animate-pulse">
                      <div className="h-10 bg-bg-soft rounded" />
                      <div className="h-10 bg-bg-soft rounded" />
                      <div className="h-10 bg-bg-soft rounded" />
                    </div>
                  ) : aulasFiltradas.length > 0 ? (
                    <div className="mt-6 max-h-[450px] space-y-1.5 overflow-y-auto pr-2">
                      {aulasFiltradas.map((aula: any, i: number) => {
                        const dateObj = new Date(aula.data);
                        const formattedDate = dateObj.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <div key={i} className="flex items-center justify-between rounded-m bg-bg-soft px-4 py-3 border border-border/40 hover:border-accent-400/20 transition-all">
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono text-accent-400 bg-accent-400/5 px-2.5 py-1 rounded-m border border-accent-400/10">
                                {formattedDate}
                              </span>
                              <span className="text-sm font-medium">{aula.titulo}</span>
                            </div>
                            <StatusBadge status={(aula.status as "pendente" | "completa") || "pendente"} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-fg-muted italic text-center py-8">
                      Nenhuma aula distribuída neste calendário ainda. Defina a grade horária e clique em "Distribuir Aulas Localmente" acima.
                    </p>
                  )}
                </GlassCard>
              </AnimatedSection>
            )}
          </div>
        )}

        {/* Tab 2: Sincronização Google Calendar (Antiga Funcionalidade) */}
        {activeTab === "google" && (
          <div className="space-y-8">
            <AnimatedSection delay={0.05}>
              <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">
                    Integração com Google Calendar
                  </h3>
                  <p className="text-sm text-fg-muted mt-1 max-w-prose">
                    Importe automaticamente os eventos da sua agenda do Google para detectar slots de aula recorrentes e fazer a alocação pedagógica inteligente.
                  </p>
                </div>
                <MagneticButton onClick={handleSync} variant={synced ? "secondary" : "primary"}>
                  {syncing ? "Conectando..." : synced ? "✓ Sincronizado" : "⟳ Conectar Google Calendar"}
                </MagneticButton>
              </GlassCard>
            </AnimatedSection>

            {synced && calData ? (
              <div className="space-y-8">
                {/* Slots de Aula */}
                <AnimatedSection delay={0.1}>
                  <GlassCard>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">
                        Slots de Aula Detectados no Google
                      </h3>
                      <span className="text-sm text-fg-muted">
                        {calData.slots_aula.length} slots
                      </span>
                    </div>
                    {calData.slots_aula.length > 0 ? (
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {calData.slots_aula.slice(0, 20).map((slot: Record<string, unknown>, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.03 * i }}
                            className="rounded-m bg-bg-soft p-3 text-center border border-border/40"
                          >
                            <p className="text-xs font-semibold">{String(slot.data || "")}</p>
                            <p className="mt-1 text-xs text-fg-muted">{String(slot.horario_inicio || "")}</p>
                            <p className="text-[10px] text-accent-400 mt-1 font-medium truncate bg-accent-400/5 py-0.5 rounded">
                              {String(slot.summary || "")}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-fg-muted italic">Nenhum slot de aula recorrente detectado. Verifique seu Google Calendar.</p>
                    )}
                  </GlassCard>
                </AnimatedSection>

                {/* Google Events */}
                <AnimatedSection delay={0.15}>
                  <GlassCard>
                    <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">
                      Eventos Importados
                    </h3>
                    <div className="mt-5 max-h-64 space-y-1.5 overflow-y-auto pr-2">
                      {calData.eventos_google.map((ev: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-m bg-bg-soft px-3 py-2.5 border border-border/30">
                          <span className="text-sm font-medium">{String(ev.summary || "Sem título")}</span>
                          <span className="text-xs text-fg-muted bg-bg px-2 py-1 rounded border border-border/40 font-mono">
                            {typeof ev.start === "object" && ev.start
                              ? String((ev.start as Record<string, string>).date || (ev.start as Record<string, string>).dateTime || "")
                              : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </AnimatedSection>

                {/* Aulas Planejadas + Distribuir */}
                <AnimatedSection delay={0.2}>
                  <GlassCard>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">Aulas Planejadas no Google</h3>
                        <p className="text-sm text-fg-muted mt-1">
                          {calData.aulas_planejadas.length} aulas com data atribuída
                        </p>
                      </div>
                      <MagneticButton
                        variant="secondary"
                        disabled={distribuindoGoogle}
                        onClick={() =>
                          distribute({ planejamento_bimestral_id: "b1", professor_id: PROFESSOR_ID })
                        }
                      >
                        {distribuindoGoogle ? "Distribuindo..." : "Distribuir Conteúdos"}
                      </MagneticButton>
                    </div>

                    {distResult && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-m bg-success/10 p-3 text-sm border border-success/20 text-success"
                      >
                        ✓ {distResult.total} aulas criadas. {distResult.nao_alocados > 0 ? `${distResult.nao_alocados} conteúdos não alocados.` : "Todos os conteúdos alocados!"}
                      </motion.div>
                    )}

                    <div className="mt-5 max-h-80 space-y-1.5 overflow-y-auto pr-2">
                      {calData.aulas_planejadas.map((aula: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-m bg-bg-soft px-3 py-2.5 border border-border/40">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-fg-muted">{String(aula.data || "")}</span>
                            <span className="text-sm font-medium">{String(aula.titulo || "")}</span>
                          </div>
                          <StatusBadge status={(aula.status as "pendente" | "completa") || "pendente"} />
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </AnimatedSection>
              </div>
            ) : (
              <AnimatedSection delay={0.1}>
                <GlassCard className="text-center py-16">
                  <span className="text-5xl">◷</span>
                  <h3 className="mt-4 text-[var(--step-2)] font-medium">Conecte seu Google Calendar</h3>
                  <p className="mt-2 text-fg-muted max-w-md mx-auto">
                    Importe seus horários de aula automaticamente e distribua os conteúdos do planejamento nas datas reais da sua agenda do Google.
                  </p>
                  <div className="mt-6">
                    <MagneticButton onClick={handleSync}>
                      ⟳ Conectar Agora
                    </MagneticButton>
                  </div>
                </GlassCard>
              </AnimatedSection>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
