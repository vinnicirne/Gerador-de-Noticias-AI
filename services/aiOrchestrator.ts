import { GoogleGenAI } from '@google/genai';
import { adminService } from './adminService';
import { userService } from './userService';
import { AIConfig, AIUsageLog } from '../types';

interface OrchestratorResponse {
    text: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        cost: number;
    };
}

class AIOrchestrator {
    
    /**
     * Determina a plataforma com base no ID do modelo.
     */
    private detectPlatform(modelId: string): 'gemini' | 'openai' | 'claude' | 'unknown' {
        if (modelId.startsWith('gemini')) return 'gemini';
        if (modelId.startsWith('gpt') || modelId.startsWith('dall')) return 'openai';
        if (modelId.startsWith('claude')) return 'claude';
        return 'unknown';
    }

    /**
     * Recupera a API Key ativa para a plataforma específica do AdminService.
     */
    private getApiKeyAndConfig(platformName: 'gemini' | 'openai' | 'claude' | 'unknown') {
        const platforms = adminService.getAIPlatforms();
        // Mapeamento entre detector e nome no adminService
        const adminNameMap: Record<string, string> = {
            'gemini': 'gemini',
            'openai': 'chatgpt',
            'claude': 'claude'
        };
        
        const dbName = adminNameMap[platformName];
        const platform = platforms.find(p => p.name === dbName && p.isActive);
        
        if (platformName === 'gemini' && (!platform || !platform.apiKey)) {
            const apiKey = process.env.API_KEY || null;
            return { apiKey, costPerToken: 0.000001 }; // Default cost
        }

        return platform ? { apiKey: platform.apiKey, costPerToken: platform.costPerToken } : { apiKey: null, costPerToken: 0 };
    }

    /**
     * Estima tokens de forma simples (aproximação comum)
     */
    private estimateTokens(text: string): number {
        return Math.round(text.length / 4);
    }

    /**
     * Método principal de geração. Roteia, gera e loga o uso.
     */
    public async generateContent(modelId: string, prompt: string, config: AIConfig): Promise<string> {
        const platformName = this.detectPlatform(modelId);
        const { apiKey, costPerToken } = this.getApiKeyAndConfig(platformName);

        console.log(`[Orchestrator] Routing request to ${platformName.toUpperCase()} using model ${modelId}`);

        if (!apiKey) {
            console.warn(`[Orchestrator] No API Key found for ${platformName}. Using simulation mode.`);
            return this.getSimulationResponse(platformName, modelId, prompt);
        }

        let responseText = '';
        try {
            switch (platformName) {
                case 'gemini':
                    responseText = await this.generateGemini(apiKey, modelId, prompt, config);
                    break;
                case 'openai':
                    responseText = await this.generateOpenAI(apiKey, modelId, prompt, config);
                    break;
                case 'claude':
                    responseText = await this.generateClaude(apiKey, modelId, prompt, config);
                    break;
                default:
                     responseText = await this.generateGemini(process.env.API_KEY || '', 'gemini-2.5-flash', prompt, config);
                     break;
            }
            
            // LOG AI USAGE (simula AIUsage.objects.create)
            const inputTokens = this.estimateTokens(prompt);
            const outputTokens = this.estimateTokens(responseText);
            const totalTokens = inputTokens + outputTokens;
            const cost = totalTokens * costPerToken;

            adminService.logAIUsage({
                id: `usage_${Date.now()}`,
                user: userService.getUser().username,
                platform: platformName,
                model: modelId,
                inputTokens,
                outputTokens,
                totalTokens,
                cost,
                timestamp: new Date().toLocaleString()
            });

            return responseText;

        } catch (error: any) {
            console.error(`[Orchestrator Error] ${platformName}:`, error);
            throw new Error(`Erro na geração com ${platformName}: ${error.message || error}`);
        }
    }

    // --- IMPLEMENTAÇÕES DE GERAÇÃO (mantidas como antes) ---
    private async generateGemini(apiKey: string, model: string, prompt: string, config: AIConfig): Promise<string> {
        // FIX: Use new GoogleGenAI({ apiKey }) instead of new GoogleGenAI(apiKey)
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model, contents: prompt, config: { temperature: config.temperature } });
        if (!response.text) throw new Error("Resposta vazia do Gemini.");
        return response.text;
    }

    private async generateOpenAI(apiKey: string, model: string, prompt: string, config: AIConfig): Promise<string> {
         if (apiKey.startsWith('sk_test') || apiKey.length < 10) {
             return this.getSimulationResponse('openai', model, prompt);
        }
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: config.temperature })
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || 'Erro na API da OpenAI'); }
        const data = await response.json();
        return data.choices[0].message.content;
    }

    private async generateClaude(apiKey: string, model: string, prompt: string, config: AIConfig): Promise<string> {
        if (apiKey.startsWith('sk_ant') || apiKey.length < 10) {
            return this.getSimulationResponse('claude', model, prompt);
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
            body: JSON.stringify({ model, max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || 'Erro na API da Anthropic'); }
        const data = await response.json();
        return data.content[0].text;
    }
    
    // --- RESPOSTA DE SIMULAÇÃO (mantida como antes) ---
    private getSimulationResponse(platform: string, model: string, prompt: string): string {
        if (prompt.includes('INÍCIO NOTÍCIA')) {
            return `
=== INÍCIO NOTÍCIA ===
Notícia Simulada via ${platform.toUpperCase()} (${model})
Hoje - São Paulo, SP
Esta é uma resposta gerada em modo de simulação porque uma chave de API válida para ${platform} não foi encontrada. O sistema está demonstrando a capacidade de roteamento.
=== FIM NOTÍCIA ===
=== INÍCIO SEO RANK MATH ===
TÍTULO SEO: Simulação ${platform}: Notícia Gerada
DESCRIÇÃO SEO: Exemplo de metadados SEO gerados pelo orquestrador em modo de simulação.
SLUG URL: noticia-simulada-${platform}-demo
PALAVRAS-CHAVE PRIMÁRIA: simulação ia
PALAVRAS-CHAVE SECUNDÁRIAS: ${platform}, multi-ia, teste
FOCO SEO: informacional
DIFICULDADE KEYWORD: baixa
SCHEMA TYPE: NewsArticle
=== FIM SEO RANK MATH ===
`;
        }
        return `[RESPOSTA SIMULADA - ${platform.toUpperCase()}]\n\nModelo: ${model}\n\nO sistema Multi-IA funcionou corretamente, mas operou em modo de simulação. Configure uma API Key válida no painel admin para respostas reais.`;
    }
}

export const aiOrchestrator = new AIOrchestrator();