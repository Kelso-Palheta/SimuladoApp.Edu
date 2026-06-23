// Este arquivo gerencia a persistência dos dados.
// No ambiente local, salva em JSON. No ambiente de produção (Vercel), deve usar Supabase.

import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/lib/data/corrections.json');

export interface Correction {
  id: string;
  userId?: string; // ID do professor que criou a correção
  studentName: string;
  studentClass: string;
  essayTheme: string;
  result: string;
  scoreData: any[];
  totalScore: number;
  createdAt: string;
}

// Inicializa o arquivo se não existir (Apenas Local)
async function ensureFile() {
  if (process.env.SUPABASE_URL) return; // Pula se usar Supabase
  try {
    const dir = path.dirname(DATA_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
  }
}

export async function saveCorrection(data: Omit<Correction, 'id' | 'createdAt'>): Promise<string> {
  const id = Math.random().toString(36).substring(2, 5).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  const newCorrection: Correction = { ...data, id, createdAt: new Date().toISOString() };

  // Prioridade 1: Supabase (Nuvem/Produção) usando REST API nativa
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(newCorrection)
      });
      if (res.ok) return id;
      throw new Error(`Supabase API Erro: ${res.status}`);
    } catch (error) {
      console.error("Erro ao salvar no Supabase, tentando local...", error);
    }
  }

  // Prioridade 2: Local JSON
  try {
    await ensureFile();
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const currentData = JSON.parse(fileContent || '[]');
    currentData.push(newCorrection);
    await fs.writeFile(DATA_PATH, JSON.stringify(currentData, null, 2));
  } catch (error) {
    console.warn("Aviso: Falha ao salvar no backup local (Comum em ambientes cloud read-only como Vercel). O ID será retornado sem persistência.");
  }
  
  return id;
}

export async function getCorrectionById(id: string): Promise<Correction | null> {
  const searchId = id.trim().toUpperCase();

  // Prioridade 1: Supabase via REST API
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections?id=eq.${searchId}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        // Adiciona cache control no build para garantir fetches dinâmicos
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data[0];
      }
    } catch (e) {}
  }

  // Prioridade 2: Local JSON
  try {
    await ensureFile();
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const currentData: Correction[] = JSON.parse(fileContent || '[]');
    return currentData.find(c => c.id.toUpperCase() === searchId) || null;
  } catch {
    return null;
  }
}

export async function getAllCorrections(userId?: string): Promise<Correction[]> {
  // Prioridade 1: Supabase via REST API
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      let url = `${process.env.SUPABASE_URL}/rest/v1/corrections?select=*&order=createdAt.desc`;
      if (userId) {
        url += `&userId=eq.${userId}`;
      }
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}
  }

  // Prioridade 2: Local JSON
  try {
    await ensureFile();
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const allData = JSON.parse(fileContent || '[]');
    if (userId) {
      return allData.filter((c: Correction) => c.userId === userId);
    }
    return allData;
  } catch {
    return [];
  }
}

export async function claimCorrection(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const searchId = id.trim().toUpperCase();

  // 1. Prioridade: Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      // Verifica se a correção existe e se já tem dono
      const checkRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections?id=eq.${searchId}&select=userId`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        cache: 'no-store'
      });
      
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (!data || data.length === 0) return { success: false, error: 'Correção não encontrada.' };
        if (data[0].userId && data[0].userId !== userId) {
          return { success: false, error: 'Esta correção já pertence a outro professor.' };
        }
      }

      // Atualiza o userId
      const updateRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections?id=eq.${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ userId })
      });

      if (updateRes.ok) return { success: true };
      throw new Error('Falha ao atualizar no Supabase');
    } catch (e) {
      console.error('Erro ao reivindicar no Supabase:', e);
    }
  }

  // 2. Fallback: Local JSON
  try {
    await ensureFile();
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const currentData: Correction[] = JSON.parse(fileContent || '[]');
    
    const index = currentData.findIndex(c => c.id.toUpperCase() === searchId);
    if (index === -1) return { success: false, error: 'Correção não encontrada.' };
    
    if (currentData[index].userId && currentData[index].userId !== userId) {
      return { success: false, error: 'Esta correção já pertence a outro professor.' };
    }

    currentData[index].userId = userId;
    await fs.writeFile(DATA_PATH, JSON.stringify(currentData, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao reivindicar localmente:', error);
    return { success: false, error: 'Erro interno ao processar a reivindicação.' };
  }
}

export async function deleteCorrection(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const searchId = id.trim().toUpperCase();

  // 1. Prioridade: Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections?id=eq.${searchId}&userId=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      // O Supabase retorna 204 No Content se encontrar ou não, mas se for apanhado pelo filtro, o delete ocorre.
      if (res.ok) return { success: true };
      throw new Error(`Falha ao excluir no Supabase: ${res.status}`);
    } catch (e) {
      console.error('Erro ao excluir no Supabase:', e);
    }
  }

  // 2. Fallback: Local JSON
  try {
    await ensureFile();
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const currentData: Correction[] = JSON.parse(fileContent || '[]');
    
    const index = currentData.findIndex(c => c.id.toUpperCase() === searchId && c.userId === userId);
    if (index === -1) {
      // Verifica se existe sem o userId (legacy) ou se pertence a outro
      const exists = currentData.find(c => c.id.toUpperCase() === searchId);
      if (!exists) return { success: false, error: 'Correção não encontrada.' };
      return { success: false, error: 'Você não tem permissão para excluir esta correção.' };
    }

    currentData.splice(index, 1);
    await fs.writeFile(DATA_PATH, JSON.stringify(currentData, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir localmente:', error);
    return { success: false, error: 'Erro interno ao processar a exclusão.' };
  }
}
