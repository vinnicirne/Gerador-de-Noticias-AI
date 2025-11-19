import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js'; 
import type { GeneratedNews } from '../types'; 

// --- Configuração de Chaves (Apenas Backend/Servidor) ---
// Estas variáveis são lidas do ambiente do servidor Vercel (SEM PREFIXO VITE_)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; 

// Cliente de Servidor (SERVICE_ROLE) para Débito de Crédito e Leitura Segura
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


export const generateNewsArticle = async (userId: string, theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  if (!SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
      throw new Error("Erro de Servidor: Chaves de API (Gemini/Supabase) ausentes no ambiente Vercel.");
  }
  
  // 1. VERIFICAÇÃO DE SALDO (Segurança da Transação)
  const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', userId)
      .single();

  if (profileError || !userProfile) {
      throw new Error("Erro ao buscar saldo. Tente logar novamente.");
  }

  // LÓGICA DE PAYWALL: Retorna erro se créditos <= 0
  if (userProfile.creditos_saldo <= 0) {
      // Mensagem que o Frontend deve interpretar como 402/Paywall
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos."); 
  }

  const startTime = performance.now();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    Aja como um jornalista sênior e especialista em SEO (Rank Math/Yoast).
    
    CONTEXTO TEMPORAL: Hoje é ${today}. Considere esta data para termos como "ontem", "hoje" ou "semana passada".
    TOM DE VOZ EXIGIDO: ${tone}. Adapte o vocabulário e a estrutura das frases para este estilo.

    Sua missão é escrever um artigo viral e tecnicamente perfeito para SEO.
    
    --- 1. DEFINIÇÃO DA ESTRATÉGIA (Mentalmente) ---
    Antes de escrever, defina uma "Palavra-chave de Foco" (Focus Keyword).
    
    --- 2. REGRAS OBRIGATÓRIAS DE SEO (CRÍTICO - NÃO IGNORE) ---
    A "Palavra-chave de Foco" DEVE aparecer EXATAMENTE (ipsis litteris) nos seguintes lugares:
       1. No Título H1.
       2. No Slug (URL amigável).
       3. Na Meta Description.
       4. **CRUCIAL**: Na PRIMEIRA FRASE do primeiro parágrafo do texto. O texto deve começar já abordando a palavra-chave.
       5. Em pelo menos um subtítulo (H2).
    
    --- 3. CONTEÚDO ---
    Analise o input:
    Tema: ${theme}
    ${topic ? `Tópico Específico: ${topic}` : ''}
    - Mínimo de 450 palavras.

    --- FORMATO DE RESPOSTA (JSON APENAS) ---
    Responda APENAS com este JSON válido:
    {
      "title": "H1 da Notícia",
      "body": "Conteúdo em Markdown...",
      "imagePrompt": "Detailed prompt in English...",
      "seo": {
        "focusKeyword": "A palavra-chave exata",
        "seoTitle": "Título SEO",
        "slug": "slug-com-a-palavra-chave",
        "metaDescription": "Descrição...",
        "tags": ["tag1", "tag2"]
      }
    }
  `;

  try {
    // 2. Chamada Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = response.text;
    let parsedContent: GeneratedNews;
    
    // Lógica robusta de parse JSON
    try {
        let cleanText = responseText
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
        
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        parsedContent = JSON.parse(cleanText);
    } catch (e) {
        console.error("Falha no parse JSON:", responseText);
        throw new Error("Erro ao processar resposta da IA. Tente novamente.");
    }

    // Extração de Grounding Sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter(Boolean) 
      .map((webChunk: any) => ({
          uri: webChunk.uri,
          title: webChunk.title,
      }))
      .filter((source: any, index: number, self: any[]) => 
          index === self.findIndex((s) => s.uri === source.uri)
      );

    const finalNews = {
      ...parsedContent,
      sources,
    };

    // 3. DÉBITO E HISTÓRICO (Usando o cliente ADMIN)
    const newBalance = userProfile.creditos_saldo - 1;
    
    // Débito
    const { error: updateError } = await supabaseAdmin
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', userId);

    if (updateError) console.error("Erro ao debitar crédito", updateError);

    // Histórico
    await supabaseAdmin
        .from('historico_prompts')
        .insert([{
            user_id: userId,
            prompt_text: `${theme} - ${topic} (${tone})`,
            response_json: finalNews,
            timestamp: new Date().toISOString()
        }]);
    
    return finalNews;
    
  } catch (error) {
    console.error("Erro no processo de geração:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida ao gerar notícia.");
  }
};