import { NextResponse } from 'next/server';
import { callAIRaw, getProviderName } from '@/lib/ai-provider-central';

/**
 * Gateway de IA unificado.
 * Antes apontava apenas para Maritack; agora roteia pelo provider ativo (AI_PROVIDER).
 * Mantém retrocompatibilidade com todos os clientes que chamam /api/maritaca.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, status, ok } = await callAIRaw(body);

    if (!ok) {
      console.error(`[/api/maritaca → ${getProviderName()}] Erro ${status}:`, data);
      return NextResponse.json({ error: data }, { status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/maritaca] Erro inesperado:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
