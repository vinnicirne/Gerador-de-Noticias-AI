import { GoogleGenAI } from "@google/genai";
import { supabase, isSupabaseConfigured } from './supabase';
import type { GeneratedNews } from '../types';

// Função auxiliar para obter a API Key
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.VITE_API_KEY || (import.meta as any).env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateNewsArticle = async (theme: string, topic: string, tone: string, userId: string): Promise<GeneratedNews> => {
  
  const startTime = performance.now();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    Aja como um jornalista sênior e especialista em SEO com nota 100/100 no Rank Math e Yoast.
    
    CONTEXTO TEMPORAL: Hoje é ${today}. Considere esta data para termos como "ontem", "hoje" ou "semana passada".
    TOM DE VOZ EXIGIDO: ${tone}. Adapte o vocabulário e a estrutura das frases para este estilo.

    Sua missão é escrever um artigo viral e tecnicamente PERFEITO para SEO, garantindo uma pontuação de 100/100 no Rank Math.
    
    --- 1. DEFINIÇÃO DA ESTRATÉGIA (Mentalmente) ---
    Antes de escrever, defina uma "Palavra-chave de Foco" (Focus Keyword).
    Exemplo: Se o tema é "Vitória do Flamengo", a palavra-chave pode ser "Flamengo vence".
    
    --- 2. REGRAS CRÍTICAS PARA SEO SCORE 100/100 (NÃO IGNORE NENHUMA) ---
    
    A. PALAVRA-CHAVE DE FOCO:
       A "Palavra-chave de Foco" DEVE aparecer EXATAMENTE (ipsis litteris) nos seguintes lugares:
       1. No 'title' (H1).
       2. No 'seo.slug' (URL amigável).
       3. Na 'seo.metaDescription'.
       4. **CRUCIAL**: Na PRIMEIRA FRASE do primeiro parágrafo do 'body'.
       5. Em pelo menos um subtítulo (## H2).
       6. **CRÍTICO PARA IMAGENS**: No 'seo.altText' da imagem.

    B. ESTRUTURA DO CONTEÚDO:
       1. **Links Internos**: Inclua 2-3 links internos FALSOS para outros artigos do mesmo site. Formato: \`[texto âncora relevante](/slug-do-artigo-relacionado/)\`.
       2. **Links Externos**: Inclua 1-2 links externos para fontes de ALTA AUTORIDADE (ex: Wikipedia, grandes portais de notícias). Formato: \`[texto âncora](https://...)\`.
       3. **Parágrafos**: Mantenha os parágrafos EXTREMAMENTE curtos (no máximo 3 frases) para otimizar a legibilidade em dispositivos móveis. NUNCA FAÇA PARÁGRAFOS LONGOS.
       4. **Tamanho**: O 'body' deve ter no mínimo 500 palavras.

    C. TÍTULO E META:
       1. **SEO Title**: Use 'Palavras de Poder' (Ex: Incrível, Segredo, Chocante, Guia Definitivo) e/ou números para maximizar o CTR.
       2. **Slug**: Mantenha o slug com menos de 75 caracteres.
       3. **Meta Description**: Resumo instigante de até 160 caracteres contendo a palavra-chave.

    D. VISUAL:
       1. **Image Prompt**: Crie um 'imagePrompt' em inglês detalhado para gerar uma capa realista.
       2. **Alt Text**: Crie um 'seo.altText' descritivo para a imagem que OBRIGATORIAMENTE contenha a "Palavra-chave de Foco" exata. Esta regra é inegociável para a pontuação de SEO.

    --- ANÁLISE DO INPUT ---
    Tema: ${theme}
    ${topic ? `Tópico Específico: ${topic}` : ''}
    
    --- FORMATO DE RESPOSTA (JSON APENAS) ---
    Responda APENAS com este JSON válido:
    {
      "title": "H1 da Notícia",
      "body": "Conteúdo em Markdown...",
      "imagePrompt": "Detailed prompt in English...",
      "seo": {
        "focusKeyword": "A palavra-chave exata",
        "seoTitle": "Título SEO com Power Word",
        "slug": "slug-com-a-palavra-chave",
        "metaDescription": "Descrição de até 160 caracteres...",
        "tags": ["tag1", "tag2"],
        "altText": "Texto alternativo da imagem contendo a palavra-chave"
      }
    }
  `;

  try {
    // Chamada Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = response.text;
    let parsedContent: GeneratedNews;
    
    try {
        let cleanText = responseText
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
        
        // Tenta encontrar JSON dentro do texto se houver lixo ao redor
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

    if (isSupabaseConfigured() && supabase && userId) {
      const { data: savedRecord, error: dbError } = await supabase
        .from('historico_prompts')
        .insert({
          user_id: userId,
          prompt_text: `Tema: ${theme}, Tópico: ${topic || 'Geral'}, Tom: ${tone}`,
          response_json: finalNews,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error("Erro ao salvar no histórico:", dbError);
      } else if (savedRecord) {
        const content = savedRecord.response_json as GeneratedNews;
        return {
          ...content,
          id: savedRecord.id,
          created_at: savedRecord.timestamp,
        };
      }
    }

    return {
        ...finalNews,
        created_at: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error("Erro no processo de geração:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida ao gerar notícia.");
  }
};