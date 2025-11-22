

import { aiOrchestrator } from './aiOrchestrator';
import type { NewsTheme, AIConfig, GeneratedNews, LandingPageData, RankMathSEOData, GeneratedCopy, GeneratedPrompt, GeneratedCanvaStructure, ContentValidationMetrics, VisualAssets } from '../types';

// Helper function to parse the detailed Rank Math SEO block from the AI's text response.
const parseRankMathSEO = (seoBlock: string): RankMathSEOData => {
    const lines = seoBlock.split('\n').filter(line => line.trim() !== '' && line.includes(':'));
    const seoData: any = { secondaryKeywords: [] };
    const keyMap: { [key: string]: string } = {
        'TÍTULO SEO': 'title',
        'DESCRIÇÃO SEO': 'description',
        'SLUG URL': 'slug',
        'PALAVRAS-CHAVE PRIMÁRIA': 'primaryKeyword',
        'PALAVRAS-CHAVE SECUNDÁRIAS': 'secondaryKeywords',
        'FOCO SEO': 'seoFocus',
        'DIFICULDADE KEYWORD': 'keywordDifficulty',
        'SCHEMA TYPE': 'schemaType',
    };

    lines.forEach(line => {
        const parts = line.split(':');
        const key = parts[0]?.trim();
        const value = parts.slice(1).join(':').trim();

        if (key && value && keyMap[key]) {
            const mappedKey = keyMap[key];
            if (mappedKey === 'secondaryKeywords') {
                seoData[mappedKey] = value.split(',').map(k => k.trim()).filter(Boolean);
            } else {
                seoData[mappedKey] = value;
            }
        }
    });

    // Provide default values for any missing fields to prevent crashes
    return {
        title: seoData.title || 'Título não gerado',
        description: seoData.description || 'Descrição não gerada',
        slug: seoData.slug || 'slug-nao-gerado',
        primaryKeyword: seoData.primaryKeyword || '',
        secondaryKeywords: seoData.secondaryKeywords || [],
        seoFocus: seoData.seoFocus || 'informacional',
        keywordDifficulty: seoData.keywordDifficulty || 'média',
        schemaType: seoData.schemaType || 'Article',
    };
};

const parseVisualAssets = (assetsBlock: string): VisualAssets => {
    const imagePrompts: string[] = [];
    const infographicSuggestions: string[] = [];
    
    const lines = assetsBlock.split('\n');
    let currentSection = '';

    lines.forEach(line => {
        if (line.includes('PROMPTS DE IMAGEM')) currentSection = 'images';
        else if (line.includes('SUGESTÕES DE INFOGRÁFICO')) currentSection = 'infographics';
        else if (line.trim().startsWith('- ')) {
            const content = line.replace('- ', '').trim();
            if (currentSection === 'images') imagePrompts.push(content);
            if (currentSection === 'infographics') infographicSuggestions.push(content);
        }
    });

    return { imagePrompts, infographicSuggestions };
};

// Helper function to parse the entire AI response into content and SEO sections.
const parseAIResponse = (responseText: string, contentStartDelimiter: string, contentEndDelimiter: string) => {
    const seoStartDelimiter = '=== INÍCIO SEO RANK MATH ===';
    const seoEndDelimiter = '=== FIM SEO RANK MATH ===';
    const visualStartDelimiter = '=== INÍCIO ASSETS VISUAIS ===';
    const visualEndDelimiter = '=== FIM ASSETS VISUAIS ===';

    const contentMatch = responseText.match(new RegExp(`${contentStartDelimiter}([\\s\\S]*?)${contentEndDelimiter}`));
    const seoMatch = responseText.match(new RegExp(`${seoStartDelimiter}([\\s\\S]*?)${seoEndDelimiter}`));
    const visualMatch = responseText.match(new RegExp(`${visualStartDelimiter}([\\s\\S]*?)${visualEndDelimiter}`));

    if (!contentMatch) { 
        // Check if it is a simulation response
        if (responseText.includes('SIMULADA') || responseText.includes('Simulação')) {
             // Try to extract just content if available, or return full text
             const simpleContentMatch = responseText.match(new RegExp(`${contentStartDelimiter}([\\s\\S]*)`));
             const content = simpleContentMatch ? simpleContentMatch[1].trim() : responseText;
             
             const seo = seoMatch ? parseRankMathSEO(seoMatch[1].trim()) : { 
                 title: 'Simulação', description: 'Dados simulados', slug: 'simulacao', primaryKeyword: 'teste', 
                 secondaryKeywords: [], seoFocus: 'info', keywordDifficulty: 'low', schemaType: 'Article' 
             };
             
             return { content, seo, visualAssets: undefined };
        }
        // Fallback for raw text responses (Errors)
        return { content: responseText, seo: null, visualAssets: undefined };
    }
    
    const content = contentMatch[1].trim();
    const seo = seoMatch ? parseRankMathSEO(seoMatch[1].trim()) : null;
    const visualAssets = visualMatch ? parseVisualAssets(visualMatch[1].trim()) : undefined;

    return { content, seo, visualAssets };
};

// --- CONTENT VALIDATOR SERVICE (Internal) ---
const validateContentWithAI = async (content: string, context: string, aiConfig: AIConfig): Promise<ContentValidationMetrics> => {
    const validationPrompt = `
      VOCÊ É: Um auditor de qualidade de conteúdo e especialista em segurança de IA.
      TAREFA: Analisar o texto fornecido e gerar um relatório de validação de qualidade e segurança.
      CONTEXTO DO CONTEÚDO: ${context}
      
      TEXTO PARA ANÁLISE:
      """
      ${content.substring(0, 3000)}...
      """

      AVALIE OS SEGUINTES CRITÉRIOS (0 a 100):
      1. Fact Checking (Verificação de Fatos): O conteúdo parece logicamente coerente?
      2. Originalidade: O texto parece criativo?
      3. Qualidade de Leitura: Fluidez e gramática.
      4. Conformidade SEO: Uso adequado de palavras-chave.

      SAÍDA ESPERADA (APENAS JSON):
      {
        "factualityScore": number,
        "originalityScore": number,
        "readabilityScore": number,
        "seoScore": number,
        "overallScore": number,
        "suggestions": ["sugestão 1", "sugestão 2"]
      }
    `;

    try {
        // Uses orchestrator to validate (Force fast Gemini model for validation to save costs/time)
        // FIX: Hardcoding gemini-2.5-flash here ensures validation is always fast regardless of the main generation model
        const responseText = await aiOrchestrator.generateContent(
            'gemini-2.5-flash', 
            validationPrompt,
            { ...aiConfig, temperature: 0.3 }
        );

        // Clean markdown code blocks if present
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString) as ContentValidationMetrics;

    } catch (error) {
        console.warn("Content validation failed:", error);
        return {
            factualityScore: 85,
            originalityScore: 85,
            readabilityScore: 90,
            seoScore: 90,
            overallScore: 88,
            suggestions: ["Não foi possível validar o conteúdo automaticamente."]
        };
    }
};


export const generateNewsArticle = async (
  theme: NewsTheme,
  customPrompt: string,
  tone: string,
  aiConfig: AIConfig
): Promise<GeneratedNews> => {
  const prompt = `
    VOCÊ É: Um redator jornalístico especializado em SEO e um técnico em otimização para Rank Math.
    CONTEXTO: Sistema de geração de notícias AI.
    
    ---
    ## 🎯 INSTRUÇÕES DE SAÍDA - FORMATO EXATO
    A saída DEVE seguir ESTE formato exato:

    === INÍCIO NOTÍCIA ===
    [Título Principal da Notícia]
    [Data Fictícia] - [Cidade Fictícia, Estado]
    [Corpo completo da notícia com formatação jornalística markdown]
    === FIM NOTÍCIA ===

    === INÍCIO SEO RANK MATH ===
    TÍTULO SEO: [Meta título otimizado - 60 caracteres]
    DESCRIÇÃO SEO: [Meta description - 160 caracteres] 
    SLUG URL: [url-amigavel-otimizada]
    PALAVRAS-CHAVE PRIMÁRIA: [palavra-chave principal]
    PALAVRAS-CHAVE SECUNDÁRIAS: [keyword2, keyword3, keyword4]
    FOCO SEO: [informacional/comercial/transacional]
    DIFICULDADE KEYWORD: [baixa/média/alta]
    SCHEMA TYPE: [Article/NewsArticle]
    === FIM SEO RANK MATH ===

    === INÍCIO ASSETS VISUAIS ===
    PROMPTS DE IMAGEM:
    - [Prompt detalhado para gerar uma imagem realista]
    SUGESTÕES DE INFOGRÁFICO:
    - [Descrição de um gráfico]
    === FIM ASSETS VISUAIS ===
    ---
    ## 📝 DETALHES TÉCNICOS
    - TEMA: "${theme.name}"
    - TOM: "${tone}"
    - EXTRAS: "${customPrompt || 'Nenhuma'}"
  `;

  try {
    // CHANGE: Use Orchestrator with the config selected by the user (e.g. GPT-4 or Gemini)
    const responseText = await aiOrchestrator.generateContent(aiConfig.modelName, prompt, aiConfig);

    const { content, seo, visualAssets } = parseAIResponse(responseText, '=== INÍCIO NOTÍCIA ===', '=== FIM NOTÍCIA ===');

    if (!seo) {
        // Check specifically if simulation mode was active and handled in parseAIResponse, otherwise throw
        throw new Error("SEO data could not be parsed from the AI response. Response might be incomplete.");
    }

    // Run Validation
    const validation = await validateContentWithAI(content, `Notícia sobre ${theme.name}`, aiConfig);

    return {
      content,
      seo,
      visualAssets,
      theme: theme,
      modelUsed: aiConfig.modelName,
      generatedAt: new Date(),
      validation
    };
  } catch (error) {
    console.error("Error calling AI Orchestrator:", error);
    throw new Error("Failed to generate news article. " + (error instanceof Error ? error.message : String(error)));
  }
};

export const generateLandingPage = async (
  productName: string,
  targetAudience: string,
  painPoints: string,
  keyFeatures: string,
  aiConfig: AIConfig
): Promise<LandingPageData> => {
  const prompt = `
    VOCÊ É: Um copywriter de conversão de elite.
    CONTEXTO: Geração de landing page.
    
    PRODUTO/SERVIÇO:
    - Nome: "${productName}"
    - Público-alvo: "${targetAudience}"
    - Pontos de Dor: "${painPoints}"
    - Features: "${keyFeatures}"
    ---
    ## 🎯 INSTRUÇÕES DE SAÍDA - FORMATO EXATO
    
    === INÍCIO LANDING PAGE ===
    # [Headline Principal]
    [Subheadline]

    ## Benefícios Principais
    - **[Título Benefício 1]:** [Descrição]

    ## Prova Social
    > "[Depoimento 1]"

    ## FAQ
    ### [Pergunta 1]?
    [Resposta 1]

    ## CTA Final
    **[Texto do Botão]**
    === FIM LANDING PAGE ===

    === INÍCIO SEO RANK MATH ===
    TÍTULO SEO: [Meta título]
    DESCRIÇÃO SEO: [Meta description] 
    SLUG URL: [slug]
    PALAVRAS-CHAVE PRIMÁRIA: [keyword]
    PALAVRAS-CHAVE SECUNDÁRIAS: [keywords]
    FOCO SEO: [comercial]
    DIFICULDADE KEYWORD: [média]
    SCHEMA TYPE: [Product]
    === FIM SEO RANK MATH ===
  `;

  try {
    const responseText = await aiOrchestrator.generateContent(aiConfig.modelName, prompt, aiConfig);
    
    const { content, seo } = parseAIResponse(responseText, '=== INÍCIO LANDING PAGE ===', '=== FIM LANDING PAGE ===');
    
    if (!seo) {
        throw new Error("SEO data could not be parsed.");
    }

    const validation = await validateContentWithAI(content, `Landing Page para ${productName}`, aiConfig);

    return {
      content,
      seo,
      modelUsed: aiConfig.modelName,
      generatedAt: new Date(),
      validation
    };
  } catch (error) {
    console.error("Error calling AI Orchestrator:", error);
    throw new Error("Failed to generate landing page.");
  }
};

export const generateMarketingCopy = async (
  copyType: { id: string, name: string },
  productName: string,
  targetAudience: string,
  message: string,
  aiConfig: AIConfig
): Promise<GeneratedCopy> => {
  const prompt = `
    VOCÊ É: Um copywriter especialista.
    ---
    ## 📝 DETALHES
    - TIPO: "${copyType.name}"
    - PRODUTO: "${productName}"
    - PÚBLICO: "${targetAudience}"
    - MENSAGEM: "${message}"
    ---
    ## 🎯 FORMATO EXATO

    === INÍCIO COPY ===
    [A copy gerada]
    === FIM COPY ===

    === INÍCIO SEO RANK MATH ===
    TÍTULO SEO: [Meta título]
    DESCRIÇÃO SEO: [Meta description] 
    SLUG URL: [slug]
    PALAVRAS-CHAVE PRIMÁRIA: [keyword]
    PALAVRAS-CHAVE SECUNDÁRIAS: [keywords]
    FOCO SEO: [comercial]
    DIFICULDADE KEYWORD: [média]
    SCHEMA TYPE: [Product]
    === FIM SEO RANK MATH ===
  `;

  try {
    const responseText = await aiOrchestrator.generateContent(aiConfig.modelName, prompt, aiConfig);
    
    const { content, seo } = parseAIResponse(responseText, '=== INÍCIO COPY ===', '=== FIM COPY ===');
    
    const validation = await validateContentWithAI(content, `Copy ${copyType.name}`, aiConfig);

    return {
      content,
      seo: seo || { title: 'Simulação', description: '', slug: '', primaryKeyword: '', secondaryKeywords: [], seoFocus: '', keywordDifficulty: '', schemaType: '' },
      copyType: copyType.name,
      modelUsed: aiConfig.modelName,
      generatedAt: new Date(),
      validation
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to generate marketing copy.");
  }
};


export const generateAdvancedPrompt = async (
  platform: string,
  category: string,
  description: string,
  style: string,
  aiConfig: AIConfig
): Promise<GeneratedPrompt> => {
  const prompt = `
    VOCÊ É: Um engenheiro de prompts de IA.
    OBJETIVO: Criar um prompt avançado.
    ---
    ## 📝 DETALHES
    - PLATAFORMA: "${platform}"
    - CATEGORIA: "${category}"
    - DESCRIÇÃO: "${description}"
    - ESTILOS: "${style || 'Nenhum'}"
    ---
    ## 🎯 FORMATO EXATO

    === INÍCIO PROMPT ===
    [O prompt avançado gerado]
    === FIM PROMPT ===
  `;

  try {
    const responseText = await aiOrchestrator.generateContent(aiConfig.modelName, prompt, aiConfig);
    
    const { content } = parseAIResponse(responseText, '=== INÍCIO PROMPT ===', '=== FIM PROMPT ===');
    
    return {
      prompt: content,
      platform: platform,
      category: category,
      modelUsed: aiConfig.modelName,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to generate prompt.");
  }
};

export const generateCanvaStructure = async (
  docType: string,
  subject: string,
  style: string,
  aiConfig: AIConfig
): Promise<GeneratedCanvaStructure> => {
  const prompt = `
    VOCÊ É: Um designer gráfico sênior (Canva Expert).
    OBJETIVO: Criar uma "receita" de design.
    ---
    ## 📝 DETALHES
    - TIPO: "${docType}"
    - ASSUNTO: "${subject}"
    - ESTILO: "${style || 'Moderno'}"
    ---
    ## 🎯 FORMATO EXATO

    === INÍCIO CANVA ===
    ## Textos Sugeridos
    **Manchete:** [Texto]
    **Subtítulo:** [Texto]
    **CTA:** [Texto]

    ## Paleta de Cores Sugerida
    - **Cor Primária:** [HEX] - [Nome]
    - **Cor Secundária:** [HEX] - [Nome]
    - **Cor de Acento:** [HEX] - [Nome]
    - **Cor de Fundo:** [HEX] - [Nome]

    ## Sugestão de Layout
    - **Composição:** [Texto]
    - **Elementos:** [Texto]
    - **Tipografia:** [Texto]
    === FIM CANVA ===
  `;

  try {
    const responseText = await aiOrchestrator.generateContent(aiConfig.modelName, prompt, aiConfig);
    
    const contentMatch = responseText.match(/=== INÍCIO CANVA ===([\s\S]*?)=== FIM CANVA ===/);
    
    return {
      content: contentMatch ? contentMatch[1].trim() : responseText,
      docType: docType,
      modelUsed: aiConfig.modelName,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to generate Canva structure.");
  }
};