import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { MASTER_ENEM_PROMPT } from "./constants";

type AIPayload = {
  text?: string;
  imageBase64?: string;
  studentName?: string;
  studentClass?: string;
  essayTheme?: string;
  depth?: string;
  competencies?: string;
  mediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
};

/**
 * Realiza a correção completa da redação usando o provedor configurado.
 */
export async function generateCorrection(payload: AIPayload) {
  const provider = process.env.AI_PROVIDER || "openai";
  let { 
    text, 
    imageBase64, 
    studentName = "Estudante",
    studentClass = "N/A",
    essayTheme = "Geral",
    depth = "analyzed",
    competencies = "Todas",
    mediaType = "image/jpeg" 
  } = payload;

  console.log(`📡 [AI Provider] Iniciando correção (${depth}) via ${provider} para ${studentName}`);

  // Fallback de Visão para Maritaca se necessário (embora agora suporte via Upload de Arquivos)
  const needsTranscriptionFallback = provider !== "openai" && provider !== "anthropic" && provider !== "maritaca";

  if (needsTranscriptionFallback && imageBase64 && !text) {
    console.log(`👁️ [Vision Fallback] Transcrevendo imagem antes de corrigir com ${provider}...`);
    text = await extractTextOnly(imageBase64, mediaType);
    imageBase64 = undefined; 
  }

  const finalPrompt = MASTER_ENEM_PROMPT
    .replace(/{theme}/g, essayTheme)
    .replace(/{studentName}/g, studentName)
    .replace(/{studentClass}/g, studentClass)
    .replace(/{depth}/g, depth)
    .replace(/{competencies}/g, competencies);

  try {
    if (provider === "maritaca") {
      const maritaca = new OpenAI({ 
        apiKey: process.env.MARITACA_API_KEY, 
        baseURL: "https://chat.maritaca.ai/api" 
      });
      return await handleMaritaca(maritaca, text, imageBase64, mediaType, finalPrompt);
    } else if (provider === "openai") {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return await handleOpenAI(openai, text, imageBase64, finalPrompt);
    } else {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return await handleAnthropic(anthropic, text, imageBase64, mediaType, finalPrompt);
    }
  } catch (error: any) {
    console.error(`🔥 [AI Provider ERROR - ${provider}]:`, error);
    throw error;
  }
}

/**
 * Função dedicada apenas a extrair texto de uma imagem (OCR).
 * Utiliza o melhor provedor disponível com visão.
 */
export async function extractTextOnly(imageBase64: string, mediaType: string = "image/jpeg"): Promise<string> {
  console.log("🔍 [AI Provider] Extraindo texto da imagem...");
  
  // Tentar Anthropic primeiro (Claude 3.5 Sonnet é excelente para OCR de manuscrito)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 3000,
        messages: [{ 
          role: "user", 
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as any, data: imageBase64.replace(/\s/g, '') } },
            { type: "text", text: "Você é um especialista em transcrição de redações manuscritas. Transcreva fielmente todo o texto desta imagem. Mantenha parágrafos e pontuação. Retorne APENAS o texto transcrito, sem introduções ou comentários." }
          ] 
        }],
      });
      const block = response.content.find(b => b.type === "text");
      if (block && block.type === "text") return block.text;
    } catch (e) {
      console.warn("⚠️ Anthropic falhou na extração, tentando fallback...", e);
    }
  } 
  
  // Fallback para OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Transcreva fielmente todo o texto desta redação manuscrita. Retorne APENAS a transcrição textual, sem comentários periféricos." },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64.replace(/\s/g, '')}` } }
          ]
        }]
      });
      return response.choices[0].message.content || "";
    } catch (e) {
      console.warn("⚠️ OpenAI falhou na extração.", e);
    }
  }

  // Fallback para Maritaca se os outros falharem ou não estiverem configurados
  if (process.env.MARITACA_API_KEY) {
    try {
      const maritaca = new OpenAI({ 
        apiKey: process.env.MARITACA_API_KEY, 
        baseURL: "https://chat.maritaca.ai/api" 
      });
      const response = await maritaca.chat.completions.create({
        model: process.env.MARITACA_MODEL || "sabiazinho-4",
        messages: [{
          role: "user",
          content: [
            { type: "file", file: { filename: "redacao.jpg", file_data: `data:${mediaType};base64,${imageBase64.replace(/\s/g, '')}` } } as any,
            { type: "text", text: "Transcreva o texto desta imagem." }
          ]
        }]
      });
      return response.choices[0].message.content || "";
    } catch (e) {
      console.error("🔥 Todos os provedores de OCR falharam.", e);
    }
  }

  throw new Error("Nenhum provedor de OCR disponível.");
}

async function handleMaritaca(maritaca: OpenAI, text?: string, imageBase64?: string, mediaType: string = "image/jpeg", prompt: string = MASTER_ENEM_PROMPT) {
  const model = process.env.MARITACA_MODEL || "sabiazinho-4";
  const content: any[] = [];

  if (imageBase64) {
    content.push({
      type: "file",
      file: { filename: "redacao.jpg", file_data: `data:${mediaType};base64,${imageBase64.replace(/\s/g, '')}` }
    });
  }

  content.push({
    type: "text",
    text: text ? `Redação para correção: \n\n${text}` : "Por favor, corrija a redação contida no arquivo/imagem enviado utilizando os critérios do INEP."
  });

  const response = await maritaca.chat.completions.create({
    model,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: content as any },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

async function handleOpenAI(openai: OpenAI, text?: string, imageBase64?: string, prompt: string = MASTER_ENEM_PROMPT) {
  const content: any[] = [];
  if (text) content.push({ type: "text", text: `Redação para correção: \n\n${text}` });
  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${imageBase64.replace(/\s/g, '')}` },
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

async function handleAnthropic(anthropic: Anthropic, text?: string, imageBase64?: string, mediaType: any = "image/jpeg", prompt: string = MASTER_ENEM_PROMPT) {
  const content: any[] = [];
  if (imageBase64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: imageBase64.replace(/\s/g, '') },
    });
  }
  if (text) {
    content.push({ type: "text", text: `Redação para correção: \n\n${text}` });
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4000,
    temperature: 0.3,
    system: prompt,
    messages: [{ role: "user", content }],
  });

  const block = response.content.find(b => b.type === "text");
  return block && block.type === "text" ? block.text : "Ocorreu um erro na geração da resposta.";
}
