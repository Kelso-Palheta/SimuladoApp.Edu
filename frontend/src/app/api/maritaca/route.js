import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Pegar a chave do .env (fallback para a NEXT_PUBLIC para compatibilidade)
    const apiKey = process.env.MARITACA_API_KEY || process.env.NEXT_PUBLIC_MARITACA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "MARITACA_API_KEY não configurada no servidor." }, { status: 500 });
    }

    const res = await fetch("https://chat.maritaca.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na rota /api/maritaca:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
