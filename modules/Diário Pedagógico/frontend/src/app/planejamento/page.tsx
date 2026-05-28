"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  useGerarPlanejamento, 
  useGerarSequencia, 
  useImportarPlanejamento, 
  useListarPlanejamentos, 
  useExcluirPlanejamento, 
  useEditarPlanejamento,
  useSalvarPlanejamentosBatch
} from "@/hooks/useApi";
import type { Bimestre, Conteudo, SequenciaDidatica, PlanejamentoAnual, PlanejamentoTemporario } from "@/hooks/useApi";


// ── Form ──
function NovoPlanejamentoForm({ onSuccess }: { onSuccess: (planejamento: PlanejamentoAnual) => void }) {
  const { mutate, isPending, data } = useGerarPlanejamento();
  const [form, setForm] = useState({
    professor_id: "prof-123",
    disciplina: "",
    serie: "",
    turma: "",
    carga_horaria_semanal: 5,
    ano_letivo: 2026,
    temas_curriculares: [] as string[],
  });
  const [temaInput, setTemaInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disciplina || !form.serie) return;
    mutate(form, { onSuccess: (d) => onSuccess(d) });
  }

  return (
    <AnimatedSection className="max-w-2xl">
      <GlassCard>
        <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">Novo Planejamento Anual</h3>
        <p className="mt-1 text-sm text-fg-muted">Preencha os dados para gerar com IA</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Disciplina</span>
              <input
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                placeholder="Língua Portuguesa"
                value={form.disciplina}
                onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
                required
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Série/Nível</span>
              <input
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                placeholder="3º Ano Ensino Médio"
                value={form.serie}
                onChange={(e) => setForm({ ...form, serie: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Carga Horária (aulas/semana)</span>
              <input
                type="number" min={1} max={15}
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                value={form.carga_horaria_semanal}
                onChange={(e) => setForm({ ...form, carga_horaria_semanal: +e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Ano Letivo</span>
              <input
                type="number" min={2024} max={2100}
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                value={form.ano_letivo}
                onChange={(e) => setForm({ ...form, ano_letivo: +e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Turma (Opcional)</span>
              <input
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                placeholder="Ex: Turma A"
                value={form.turma}
                onChange={(e) => setForm({ ...form, turma: e.target.value })}
              />
            </label>
          </div>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Temas Curriculares</span>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                placeholder="Ex: Gramática, Literatura..."
                value={temaInput}
                onChange={(e) => setTemaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && temaInput.trim()) {
                    e.preventDefault();
                    setForm({ ...form, temas_curriculares: [...form.temas_curriculares, temaInput.trim()] });
                    setTemaInput("");
                  }
                }}
              />
            </div>
            {form.temas_curriculares.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.temas_curriculares.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent-400/10 px-2.5 py-1 text-xs text-accent-400">
                    {t}
                    <button type="button" onClick={() => setForm({ ...form, temas_curriculares: form.temas_curriculares.filter((x) => x !== t) })} className="ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </label>
          <MagneticButton onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} className="w-full">
            {isPending ? "Gerando..." : "✦ Gerar Planejamento com IA"}
          </MagneticButton>
        </form>
      </GlassCard>
    </AnimatedSection>
  );
}

// ── Timeline View ──
function TimelineBimestres({ 
  planejamento, 
  onBack 
}: { 
  planejamento: PlanejamentoAnual; 
  onBack: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sequenciaConteudo, setSequenciaConteudo] = useState<string | null>(null);
  const { mutate: gerarSeq, data: seqData, isPending: seqLoading } = useGerarSequencia();

  return (
    <AnimatedSection className="space-y-6" delay={0.2}>
      <div className="flex items-start justify-between">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-medium text-fg-muted hover:text-fg transition-colors mb-4 group"
          >
            <span className="inline-block transform group-hover:-translate-x-1 transition-transform">←</span> Voltar para meus planejamentos
          </button>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Planejamento Anual</p>
          <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em] mt-2">
            {planejamento.disciplina} — {planejamento.serie}{planejamento.turma ? ` (${planejamento.turma})` : ""}
          </h2>
          <p className="text-sm text-fg-muted mt-1">
            {planejamento.ano_letivo} · {planejamento.carga_horaria_anual} aulas · <StatusBadge status={planejamento.status as any} />
          </p>
        </div>
      </div>

      {/* Bimestre Timeline */}
      <div className="grid grid-cols-2 gap-6">
        {planejamento.bimestres.map((bim, i) => (
          <motion.div
            key={bim.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <GlassCard
              className={`cursor-pointer transition-all ${expanded === bim.numero ? "glow-accent-subtle ring-1 ring-accent-400/20" : ""}`}
              onClick={() => setExpanded(expanded === bim.numero ? null : bim.numero)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-accent-400">
                    {bim.numero}º Bimestre
                  </span>
                  <h4 className="mt-1 text-[var(--step-1)] font-medium">{bim.titulo || `Bimestre ${bim.numero}`}</h4>
                  <p className="text-sm text-fg-muted">{bim.carga_horaria} aulas</p>
                </div>
                <motion.span
                  animate={{ rotate: expanded === bim.numero ? 180 : 0 }}
                  className="text-fg-muted"
                >
                  ▾
                </motion.span>
              </div>
              {bim.temas_principais && (
                <p className="mt-3 text-xs text-fg-muted line-clamp-2">{bim.temas_principais}</p>
              )}

              {/* Expanded content list */}
              <AnimatePresence>
                {expanded === bim.numero && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 space-y-2 border-t border-border pt-5">
                      {bim.conteudos.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-m bg-bg-soft px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium">{c.titulo}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-fg-muted">{c.tipo}</span>
                              <span className="text-xs text-fg-muted">·</span>
                              <span className="text-xs text-fg-muted">{c.carga_horaria_estimada} aulas</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSequenciaConteudo(c.id);
                              gerarSeq({ conteudo_id: c.id });
                            }}
                            className="text-xs text-accent-400 hover:underline"
                          >
                            {seqLoading && sequenciaConteudo === c.id ? "Gerando..." : "Sequência"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Sequência Didática Modal */}
      <AnimatePresence>
        {seqData && sequenciaConteudo !== null && (
          <SequenceModal seq={seqData} onClose={() => setSequenciaConteudo(null)} />
        )}
      </AnimatePresence>
    </AnimatedSection>
  );
}

function SequenceModal({ seq, onClose }: { seq: SequenciaDidatica; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-xl mx-4 max-h-[80vh] max-w-2xl overflow-y-auto p-8 shadow-l"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">{seq.titulo}</h3>
          <button onClick={onClose} className="text-fg-muted hover:text-fg">✕</button>
        </div>

        <div className="mt-6 space-y-5">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Objetivo Geral</h4>
            <p className="mt-1 text-sm">{seq.objetivo_geral}</p>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Objetivos Específicos</h4>
            <ul className="mt-1 space-y-1">
              {seq.objetivos_especificos.map((o, i) => (
                <li key={i} className="text-sm text-fg-muted">→ {o}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Metodologia</h4>
            <p className="mt-1 text-sm text-fg-muted">{seq.metodologia}</p>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Etapas</h4>
            <div className="mt-2 space-y-2">
              {seq.etapas.map((e) => (
                <div key={e.numero} className="flex gap-3 rounded-m bg-bg-soft p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-400/20 text-xs font-mono text-accent-400">
                    {e.numero}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{e.descricao}</p>
                    <p className="text-xs text-fg-muted">{e.duracao_minutos}min · {e.estrategia}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Avaliação</h4>
            <p className="mt-1 text-sm text-fg-muted">{seq.avaliacao}</p>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Recursos</h4>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {seq.recursos.map((r, i) => (
                <span key={i} className="rounded-full bg-bg-soft px-2.5 py-1 text-xs">{r}</span>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Referências</h4>
            <ul className="mt-1 space-y-0.5">
              {seq.referencias.map((r, i) => (
                <li key={i} className="text-xs text-fg-muted">{r}</li>
              ))}
            </ul>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Importar Planejamento Form ──
function ImportarPlanejamentoForm({ onSuccess }: { onSuccess: (planejamentos: PlanejamentoTemporario[]) => void }) {
  const { mutate, isPending } = useImportarPlanejamento();
  const [form, setForm] = useState({
    professor_id: "prof-123",
    ano_letivo: 2026,
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx") {
        setFile(droppedFile);
        setErrorMessage("");
      } else {
        setErrorMessage("Apenas arquivos PDF ou DOCX são suportados.");
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx") {
        setFile(selectedFile);
        setErrorMessage("");
      } else {
        setErrorMessage("Apenas arquivos PDF ou DOCX são suportados.");
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("professor_id", form.professor_id);
    formData.append("ano_letivo", String(form.ano_letivo));

    mutate(formData, { 
      onSuccess: (d) => onSuccess(d),
      onError: (err: any) => {
        setErrorMessage(err.message || "Erro ao processar arquivo. Verifique o conteúdo e tente novamente.");
      }
    });
  }

  return (
    <AnimatedSection className="max-w-2xl">
      <GlassCard>
        <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">Importar Planejamento Existente</h3>
        <p className="mt-1 text-sm text-fg-muted">Suba o seu plano de aulas (.pdf ou .docx) para a IA estruturar no sistema</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Ano Letivo</span>
              <input
                type="number" min={2024} max={2100}
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                value={form.ano_letivo}
                onChange={(e) => setForm({ ...form, ano_letivo: +e.target.value })}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Arquivo de Planejamento (PDF ou DOCX)</span>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-m p-8 flex flex-col items-center justify-center transition-all ${
                dragActive ? "border-accent-400 bg-accent-400/5 scale-[1.01]" : "border-border bg-bg-soft hover:bg-bg-soft/70"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              <div className="text-center space-y-2 pointer-events-none">
                <span className="text-[var(--step-2)] block">📁</span>
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-accent-400">{file.name}</p>
                    <p className="text-xs text-fg-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Arraste e solte o arquivo aqui, ou clique para navegar</p>
                    <p className="text-xs text-fg-muted mt-1">Suporta apenas PDF ou DOCX</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-red-400 bg-red-400/10 rounded-m px-3 py-2">
              ⚠️ {errorMessage}
            </p>
          )}

          <MagneticButton
            disabled={!file || isPending}
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            className="w-full"
          >
            {isPending ? "Processando e estruturando arquivo..." : "✦ Analisar e Estruturar Planejamento"}
          </MagneticButton>
        </form>
      </GlassCard>
    </AnimatedSection>
  );
}

// ── Painel de Revisão (Fase 2) ──
function RevisarPlanejamentosPanel({
  propostas,
  onConfirm,
  onCancel,
  isSaving,
}: {
  propostas: PlanejamentoTemporario[];
  onConfirm: (final: PlanejamentoTemporario[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [revisados, setRevisados] = useState<PlanejamentoTemporario[]>(
    propostas.map((p) => ({ ...p, turmasInput: "" }))
  );
  const [colapsados, setColapsados] = useState<Record<number, boolean>>({});

  function updateField(index: number, key: keyof PlanejamentoTemporario, value: any) {
    setRevisados((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  }

  function toggleColapsar(index: number) {
    setColapsados((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(revisados);
  }

  return (
    <AnimatedSection className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 text-xs font-medium text-fg-muted hover:text-fg transition-colors mb-4 group disabled:opacity-50"
          >
            <span className="inline-block transform group-hover:-translate-x-1 transition-transform">←</span> Voltar para o upload
          </button>
          <h2 className="text-[var(--step-3)] font-medium tracking-[-0.02em]">Revisar Planejamentos Gerados por IA</h2>
          <p className="text-sm text-fg-muted mt-1">
            Detectamos {revisados.length} planejamentos no seu arquivo. Revise as informações e configure as turmas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {revisados.map((plan, index) => {
          const isColapsado = colapsados[index] ?? true;
          return (
            <GlassCard key={index} className="p-6 relative border-border/80 bg-bg-soft/50">
              <div className="absolute right-6 top-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleColapsar(index)}
                  className="rounded-full bg-bg-soft px-3 py-1.5 border border-border/50 text-xs text-fg-muted hover:text-fg hover:bg-bg-soft/80 transition-all flex items-center justify-center gap-1"
                >
                  {isColapsado ? "👁 Ver Detalhes" : "🙈 Ocultar Detalhes"}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-medium text-accent-400">Planejamento #{index + 1}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-fg-muted">Disciplina</span>
                  <input
                    type="text"
                    required
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    value={plan.disciplina}
                    onChange={(e) => updateField(index, "disciplina", e.target.value)}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-fg-muted">Série / Nível</span>
                  <input
                    type="text"
                    required
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    value={plan.serie}
                    onChange={(e) => updateField(index, "serie", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-fg-muted">Carga Horária Semanal (aulas)</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    value={plan.carga_horaria_semanal}
                    onChange={(e) => updateField(index, "carga_horaria_semanal", +e.target.value)}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-fg-muted">Ano Letivo</span>
                  <input
                    type="number"
                    min={2024}
                    max={2100}
                    required
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    value={plan.ano_letivo}
                    onChange={(e) => updateField(index, "ano_letivo", +e.target.value)}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-fg-muted">Cadastrar para quais Turmas? (separe por vírgula)</span>
                  <input
                    type="text"
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    placeholder="Ex: 301, 302"
                    value={plan.turmasInput || ""}
                    onChange={(e) => updateField(index, "turmasInput", e.target.value)}
                  />
                </label>
              </div>

              {!isColapsado && (
                <div className="mt-6 border-t border-border/50 pt-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Estrutura de Bimestres Extraída</h4>
                  <div className="space-y-3">
                    {plan.bimestres.map((bim) => (
                      <div key={bim.numero} className="bg-bg-soft/70 border border-border/30 rounded-m p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{bim.numero}º Bimestre: {bim.titulo || `Bimestre ${bim.numero}`}</span>
                          <span className="text-xs font-mono text-fg-muted">{bim.carga_horaria}h de carga horária</span>
                        </div>
                        {bim.temas_principais && (
                          <p className="text-xs text-fg-muted mt-1 italic">Temas: {bim.temas_principais}</p>
                        )}
                        <ul className="mt-3 space-y-2 pl-4 list-disc text-xs text-fg-muted">
                          {bim.conteudos.map((cont, cIdx) => (
                            <li key={cIdx}>
                              <span className="text-fg font-medium">{cont.titulo}</span>
                              {cont.habilidade_bncc && (
                                <span className="ml-2 font-mono text-[10px] bg-accent-400/10 text-accent-400 px-1.5 py-0.5 rounded-full">
                                  {cont.habilidade_bncc}
                                </span>
                              )}
                              <p className="text-[11px] mt-0.5">{cont.descricao}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}

        <div className="flex gap-4">
          <MagneticButton
            type="submit"
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? "Salvando planejamentos no sistema..." : "✦ Confirmar e Importar Planejamentos"}
          </MagneticButton>
        </div>
      </form>
    </AnimatedSection>
  );
}

// ── Listagem ──
function ListaPlanejamentos({ 
  planejamentos, 
  onSelecionar, 
  onEditar, 
  onExcluir, 
  onNovo 
}: { 
  planejamentos: PlanejamentoAnual[]; 
  onSelecionar: (p: PlanejamentoAnual) => void;
  onEditar: (p: PlanejamentoAnual) => void;
  onExcluir: (p: PlanejamentoAnual) => void;
  onNovo: () => void;
}) {
  return (
    <AnimatedSection className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em] gradient-text">Meus Planejamentos</h2>
          <p className="text-sm text-fg-muted mt-1">Gerencie suas turmas, disciplinas e programações curriculares</p>
        </div>
        <MagneticButton onClick={onNovo} className="px-6 py-3 font-semibold">
          ✦ Novo Planejamento
        </MagneticButton>
      </div>

      {planejamentos.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <span className="text-[var(--space-xl)] block">📋</span>
          <div>
            <h4 className="text-[var(--step-1)] font-medium">Nenhum planejamento encontrado</h4>
            <p className="text-sm text-fg-muted mt-1 max-w-md">
              Você ainda não tem planejamentos cadastrados. Crie um planejamento anual gerado por inteligência artificial ou importe um documento estruturado.
            </p>
          </div>
          <MagneticButton onClick={onNovo} className="px-5 py-2.5">
            Começar Agora
          </MagneticButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planejamentos.map((p) => (
            <GlassCard 
              key={p.id} 
              className="group relative flex flex-col justify-between hover:glow-accent-subtle hover:border-accent-400/30 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono bg-bg-soft border border-border px-2.5 py-1 rounded-full text-fg-muted">
                    {p.ano_letivo}
                  </span>
                  <StatusBadge status={p.status as any} />
                </div>
                
                <div>
                  <h3 className="text-[var(--step-2)] font-semibold leading-tight group-hover:text-accent-400 transition-colors">
                    {p.disciplina}
                  </h3>
                  <p className="text-sm text-fg-muted mt-1">
                    {p.serie}{p.turma ? ` — ${p.turma}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-fg-muted font-mono bg-bg-soft/50 p-2.5 rounded-m border border-border/50">
                  <div>
                    <span className="block text-fg font-medium">{p.carga_horaria_semanal}h</span>
                    <span>semanais</span>
                  </div>
                  <div className="border-l border-border h-6" />
                  <div>
                    <span className="block text-fg font-medium">{p.carga_horaria_anual}h</span>
                    <span>anuais</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-border/50">
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(p);
                    }}
                    className="p-2 text-xs rounded-m border border-border bg-bg-soft hover:bg-bg hover:border-accent-400 hover:text-accent-400 transition-all"
                    title="Editar Planejamento"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcluir(p);
                    }}
                    className="p-2 text-xs rounded-m border border-border bg-bg-soft hover:bg-bg hover:border-red-400/50 hover:text-red-400 transition-all"
                    title="Excluir Planejamento"
                  >
                    🗑️
                  </button>
                </div>
                
                <button
                  onClick={() => onSelecionar(p)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-m bg-accent-400 text-bg-soft hover:bg-accent-300 transition-all"
                >
                  Ver Cronograma ➔
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AnimatedSection>
  );
}

// ── Editar Planejamento Modal ──
function EditarPlanejamentoModal({
  planejamento,
  onClose,
  onSaveSuccess
}: {
  planejamento: PlanejamentoAnual;
  onClose: () => void;
  onSaveSuccess: (updated: PlanejamentoAnual) => void;
}) {
  const { mutate, isPending } = useEditarPlanejamento();
  const [form, setForm] = useState({
    disciplina: planejamento.disciplina,
    serie: planejamento.serie,
    turma: planejamento.turma || "",
    carga_horaria_semanal: planejamento.carga_horaria_semanal,
    ano_letivo: planejamento.ano_letivo,
  });
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disciplina || !form.serie) return;

    mutate(
      {
        planejamentoId: planejamento.id,
        ...form
      },
      {
        onSuccess: (updatedPlanejamento) => {
          onSaveSuccess(updatedPlanejamento);
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.message || "Erro ao editar planejamento.");
        }
      }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass mx-4 w-full max-w-md p-8 shadow-l"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[var(--step-2)] font-medium tracking-[-0.02em]">Editar Planejamento</h3>
            <p className="text-xs text-fg-muted mt-1">Altere os dados básicos do planejamento anual</p>
          </div>
          <button onClick={onClose} className="text-fg-muted hover:text-fg text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Disciplina</span>
            <input
              className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
              value={form.disciplina}
              onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Série/Nível</span>
            <input
              className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
              value={form.serie}
              onChange={(e) => setForm({ ...form, serie: e.target.value })}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Turma (Opcional)</span>
            <input
              className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
              value={form.turma}
              onChange={(e) => setForm({ ...form, turma: e.target.value })}
              placeholder="Ex: Turma A"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Carga Semanal</span>
              <input
                type="number" min={1} max={15}
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                value={form.carga_horaria_semanal}
                onChange={(e) => setForm({ ...form, carga_horaria_semanal: +e.target.value })}
                required
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Ano Letivo</span>
              <input
                type="number" min={2024} max={2100}
                className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                value={form.ano_letivo}
                onChange={(e) => setForm({ ...form, ano_letivo: +e.target.value })}
                required
              />
            </label>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-red-400 bg-red-400/10 rounded-m px-3 py-2">
              ⚠️ {errorMessage}
            </p>
          )}

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-m border border-border text-sm font-medium hover:bg-bg-soft transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-m bg-accent-400 text-bg-soft text-sm font-semibold hover:bg-accent-300 transition-colors"
            >
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Confirmar Exclusão Modal ──
function ConfirmarExclusaoModal({
  planejamento,
  onClose,
  onDeleteSuccess
}: {
  planejamento: PlanejamentoAnual;
  onClose: () => void;
  onDeleteSuccess: () => void;
}) {
  const { mutate, isPending } = useExcluirPlanejamento();
  const [errorMessage, setErrorMessage] = useState("");

  function handleConfirm() {
    mutate(planejamento.id, {
      onSuccess: () => {
        onDeleteSuccess();
        onClose();
      },
      onError: (err: any) => {
        setErrorMessage(err.message || "Erro ao excluir planejamento.");
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass mx-4 w-full max-w-md p-8 border border-red-500/20 shadow-l"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[var(--step-2)] font-medium text-red-400 tracking-[-0.02em]">Excluir Planejamento?</h3>
            <p className="text-xs text-fg-muted mt-1">Essa ação é irreversível</p>
          </div>
          <button onClick={onClose} className="text-fg-muted hover:text-fg text-sm">✕</button>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-fg-muted">
            Você tem certeza de que deseja excluir o planejamento de <strong className="text-fg">{planejamento.disciplina}</strong> ({planejamento.serie})?
          </p>
          <div className="p-3 bg-red-400/5 border border-red-400/10 rounded-m">
            <p className="text-xs text-red-400 font-medium leading-relaxed">
              ⚠️ <strong>Atenção:</strong> Isso excluirá permanentemente todos os 4 bimestres, conteúdos associados, cronograma de aulas planejadas e horários vinculados a este planejamento.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-red-400 bg-red-400/10 rounded-m px-3 py-2">
              ⚠️ {errorMessage}
            </p>
          )}

          <div className="flex gap-3 mt-6 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-m border border-border text-sm font-medium hover:bg-bg-soft transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-m bg-red-500 text-fg text-sm font-semibold hover:bg-red-400 transition-colors"
            >
              {isPending ? "Excluindo..." : "Sim, Excluir"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──
export default function PlanejamentoPage() {
  const [modo, setModo] = useState<"lista" | "criar" | "detalhes" | "revisar">("lista");
  const [planejamentoAtivo, setPlanejamentoAtivo] = useState<PlanejamentoAnual | null>(null);
  const [planejamentosTemporarios, setPlanejamentosTemporarios] = useState<PlanejamentoTemporario[]>([]);
  const [activeTab, setActiveTab] = useState<"gerar" | "importar">("gerar");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Modais
  const [planejamentoEditando, setPlanejamentoEditando] = useState<PlanejamentoAnual | null>(null);
  const [planejamentoExcluindo, setPlanejamentoExcluindo] = useState<PlanejamentoAnual | null>(null);

  const { data: planejamentos = [], isLoading, refetch } = useListarPlanejamentos("prof-123");
  const { mutate: salvarBatch, isPending: isSavingBatch } = useSalvarPlanejamentosBatch();

  function handleCriarSuccess(planejamento: PlanejamentoAnual) {
    setPlanejamentoAtivo(planejamento);
    setModo("detalhes");
    refetch();
  }

  function handleImportarTemporarios(importados: PlanejamentoTemporario[]) {
    setPlanejamentosTemporarios(importados);
    setModo("revisar");
  }

  function handleConfirmarImportacao(planejamentosRevisados: PlanejamentoTemporario[]) {
    const payload = {
      professor_id: "prof-123",
      planejamentos: planejamentosRevisados.map(p => ({
        disciplina: p.disciplina,
        serie: p.serie,
        carga_horaria_semanal: p.carga_horaria_semanal,
        carga_horaria_anual: p.carga_horaria_semanal * 40,
        ano_letivo: p.ano_letivo,
        turmas: p.turmasInput ? p.turmasInput.split(",").map(t => t.trim()).filter(Boolean) : [],
        bimestres: p.bimestres.map(b => ({
          numero: b.numero,
          titulo: b.titulo,
          temas_principais: b.temas_principais,
          carga_horaria: b.carga_horaria,
          conteudos: b.conteudos.map(c => ({
            titulo: c.titulo,
            descricao: c.descricao,
            tipo: c.tipo,
            carga_estimada: c.carga_estimada,
            habilidade_bncc: c.habilidade_bncc
          }))
        }))
      }))
    };

    salvarBatch(payload, {
      onSuccess: (importados) => {
        refetch();
        setPlanejamentosTemporarios([]);
        if (importados.length === 0) {
          setModo("lista");
          return;
        }
        if (importados.length === 1) {
          setPlanejamentoAtivo(importados[0]);
          setModo("detalhes");
        } else {
          setModo("lista");
          const seriesNomes = importados.map(p => `${p.serie}${p.turma ? ` (${p.turma})` : ''}`).join(", ");
          setNotification({
            type: "success",
            message: `Sucesso! Foram criados ${importados.length} planejamentos para as turmas: ${seriesNomes}`
          });
          // Ocultar automaticamente após 10 segundos
          setTimeout(() => {
            setNotification(prev => prev?.message.includes(seriesNomes) ? null : prev);
          }, 10000);
        }
      },
      onError: (err: any) => {
        setNotification({
          type: "error",
          message: err.message || "Erro ao salvar os planejamentos."
        });
      }
    });
  }

  return (
    <Shell>
      <div className="space-y-12 px-8 py-12">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden mb-6"
            >
              <div className={`p-4 rounded-m border flex items-center justify-between gap-3 text-sm font-medium ${
                notification.type === "success" 
                  ? "bg-accent-400/10 border-accent-400/20 text-accent-400" 
                  : "bg-red-400/10 border-red-400/20 text-red-400"
              }`}>
                <div className="flex items-center gap-2">
                  <span>✦</span>
                  <span>{notification.message}</span>
                </div>
                <button 
                  onClick={() => setNotification(null)}
                  className="text-fg-muted hover:text-fg transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {modo === "lista" && (
          isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-400" />
              <p className="text-sm text-fg-muted mt-4">Carregando seus planejamentos...</p>
            </div>
          ) : (
            <ListaPlanejamentos
              planejamentos={planejamentos}
              onSelecionar={(p) => {
                setPlanejamentoAtivo(p);
                setModo("detalhes");
              }}
              onEditar={(p) => setPlanejamentoEditando(p)}
              onExcluir={(p) => setPlanejamentoExcluindo(p)}
              onNovo={() => setModo("criar")}
            />
          )
        )}

        {modo === "criar" && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setModo("lista")} 
                className="flex items-center gap-2 text-xs font-medium text-fg-muted hover:text-fg transition-colors mb-4 group"
              >
                <span className="inline-block transform group-hover:-translate-x-1 transition-transform">←</span> Voltar para a lista
              </button>
              <h2 className="text-[var(--step-3)] font-medium tracking-[-0.02em]">Criar Planejamento</h2>
              <p className="text-sm text-fg-muted mt-1">Selecione uma das opções abaixo para criar o seu cronograma</p>
            </div>

            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setActiveTab("gerar")}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                  activeTab === "gerar"
                    ? "border-accent-400 text-accent-400 font-semibold"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                Gerar com IA
              </button>
              <button
                onClick={() => setActiveTab("importar")}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                  activeTab === "importar"
                    ? "border-accent-400 text-accent-400 font-semibold"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                Importar Documento (PDF/DOCX)
              </button>
            </div>

            {activeTab === "gerar" ? (
              <NovoPlanejamentoForm onSuccess={handleCriarSuccess} />
            ) : (
              <ImportarPlanejamentoForm onSuccess={handleImportarTemporarios} />
            )}
          </div>
        )}

        {modo === "revisar" && (
          <RevisarPlanejamentosPanel
            propostas={planejamentosTemporarios}
            isSaving={isSavingBatch}
            onCancel={() => setModo("criar")}
            onConfirm={handleConfirmarImportacao}
          />
        )}

        {modo === "detalhes" && planejamentoAtivo && (
          <TimelineBimestres 
            planejamento={planejamentoAtivo} 
            onBack={() => {
              setPlanejamentoAtivo(null);
              setModo("lista");
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {planejamentoEditando && (
          <EditarPlanejamentoModal
            planejamento={planejamentoEditando}
            onClose={() => setPlanejamentoEditando(null)}
            onSaveSuccess={(updated) => {
              refetch();
              if (planejamentoAtivo && planejamentoAtivo.id === updated.id) {
                setPlanejamentoAtivo(updated);
              }
            }}
          />
        )}

        {planejamentoExcluindo && (
          <ConfirmarExclusaoModal
            planejamento={planejamentoExcluindo}
            onClose={() => setPlanejamentoExcluindo(null)}
            onDeleteSuccess={() => {
              refetch();
              if (planejamentoAtivo && planejamentoAtivo.id === planejamentoExcluindo.id) {
                setPlanejamentoAtivo(null);
                setModo("lista");
              }
            }}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}

