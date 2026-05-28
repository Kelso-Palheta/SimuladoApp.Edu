"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──

export interface PlanejamentoAnual {
  id: string;
  professor_id: string;
  disciplina: string;
  serie: string;
  turma?: string | null;
  carga_horaria_semanal: number;
  carga_horaria_anual: number;
  ano_letivo: number;
  status: string;
  carga_warning: boolean;
  bimestres: Bimestre[];
  created_at: string;
}

export interface Bimestre {
  id: string;
  numero: number;
  titulo: string | null;
  temas_principais: string | null;
  carga_horaria: number;
  conteudos: Conteudo[];
}

export interface Conteudo {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  carga_horaria_estimada: number;
}

export interface SequenciaDidatica {
  id: string;
  conteudo_id: string;
  titulo: string;
  objetivo_geral: string;
  objetivos_especificos: string[];
  metodologia: string;
  recursos: string[];
  etapas: Etapa[];
  avaliacao: string;
  referencias: string[];
  created_at: string;
}

export interface Etapa {
  numero: number;
  descricao: string;
  duracao_minutos: number;
  estrategia: string;
}

// ── Types Temporários (Fase 2) ──

export interface ConteudoTemporario {
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  carga_estimada: number;
  habilidade_bncc: string | null;
}

export interface BimestreTemporario {
  numero: number;
  titulo: string | null;
  temas_principais: string | null;
  carga_horaria: number;
  conteudos: ConteudoTemporario[];
}

export interface PlanejamentoTemporario {
  disciplina: string;
  serie: string;
  carga_horaria_semanal: number;
  carga_horaria_anual: number;
  ano_letivo: number;
  bimestres: BimestreTemporario[];
  turmasInput?: string; // para controle no frontend
}

export interface CalendarData {
  eventos_google: Array<Record<string, unknown>>;
  slots_aula: Array<Record<string, unknown>>;
  aulas_planejadas: Array<Record<string, unknown>>;
}

// ── Hooks ──

export function useGerarPlanejamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      professor_id: string;
      disciplina: string;
      serie: string;
      turma?: string;
      carga_horaria_semanal: number;
      ano_letivo: number;
      temas_curriculares: string[];
    }) => api.post<PlanejamentoAnual>("/planning/annual", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planejamentos"] }),
  });
}

export function useGerarSequencia() {
  return useMutation({
    mutationFn: (data: { conteudo_id: string }) =>
      api.post<SequenciaDidatica>("/planning/sequence", data),
  });
}

export function useCalendarSync() {
  return useMutation({
    mutationFn: (data: { professor_id: string; redirect_uri?: string }) =>
      api.post<{ auth_url: string }>("/calendar/sync", data),
  });
}

export function useCalendarEvents(professorId: string, dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ["calendar", professorId, dataInicio, dataFim],
    queryFn: () =>
      api.get<CalendarData>("/calendar/events", {
        professor_id: professorId,
        data_inicio: dataInicio,
        data_fim: dataFim,
      }),
    enabled: !!professorId && !!dataInicio && !!dataFim,
  });
}

export function useDistribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { planejamento_bimestral_id: string; professor_id: string }) =>
      api.post<{ aulas_criadas: Array<Record<string, unknown>>; total: number; nao_alocados: number }>(
        "/calendar/distribute",
        data
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

export interface Horario {
  id?: string;
  dia_semana: number;
  horario_inicio: string;
  duracao_minutos: number;
}

export function useImportarPlanejamento() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.postMultipart<PlanejamentoTemporario[]>("/planning/upload", formData),
  });
}

export function useSalvarPlanejamentosBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      professor_id: string;
      planejamentos: Array<{
        disciplina: string;
        serie: string;
        carga_horaria_semanal: number;
        carga_horaria_anual: number;
        ano_letivo: number;
        turmas: string[];
        bimestres: BimestreTemporario[];
      }>;
    }) => api.post<PlanejamentoAnual[]>("/planning/batch", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planejamentos"] }),
  });
}

export function useSalvarHorarios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { planejamentoId: string; horarios: Horario[] }) =>
      api.post<Horario[]>(`/planning/${data.planejamentoId}/schedule`, { horarios: data.horarios }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["horarios", variables.planejamentoId] });
    },
  });
}

export function useHorarios(planejamentoId: string) {
  return useQuery({
    queryKey: ["horarios", planejamentoId],
    queryFn: () => api.get<Horario[]>(`/planning/${planejamentoId}/schedule`),
    enabled: !!planejamentoId,
  });
}

export function useDistribuirManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { planejamentoId: string; professor_id: string }) =>
      api.post<{ aulas_criadas: Array<Record<string, unknown>>; total: number; nao_alocados: number }>(
        `/planning/${data.planejamentoId}/distribute-manual`,
        { professor_id: data.professor_id }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

export function useListarPlanejamentos(professorId: string) {
  return useQuery({
    queryKey: ["planejamentos", professorId],
    queryFn: () => api.get<PlanejamentoAnual[]>("/planning", { professor_id: professorId }),
    enabled: !!professorId,
  });
}

export function useExcluirPlanejamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planejamentoId: string) =>
      api.delete<{ status: string; message: string }>(`/planning/${planejamentoId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planejamentos"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

export function useEditarPlanejamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      planejamentoId: string;
      disciplina?: string;
      serie?: string;
      turma?: string;
      carga_horaria_semanal?: number;
      ano_letivo?: number;
    }) => {
      const { planejamentoId, ...body } = data;
      return api.patch<PlanejamentoAnual>(`/planning/${planejamentoId}`, body);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["planejamentos"] });
      qc.invalidateQueries({ queryKey: ["horarios", variables.planejamentoId] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}



