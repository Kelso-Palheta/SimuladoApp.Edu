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

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload JSON inválido.' }, { status: 400 });
    }

    // Validação de limite de tamanho total do payload (DoS protection)
    const jsonStr = JSON.stringify(body);
    if (jsonStr.length > 50000) {
      return NextResponse.json({ error: 'Payload excede o limite máximo permitido (50KB).' }, { status: 400 });
    }

    // Valida se possui messages ou prompt
    if (!body.messages && !body.prompt && !body.contents) {
      return NextResponse.json({ error: 'Formato de requisição de IA inválido (messages ou prompt obrigatório).' }, { status: 400 });
    }

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
