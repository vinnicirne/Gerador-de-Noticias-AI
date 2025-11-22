import { userService } from './userService';
import type { GenerationHistoryItem } from '../types';

/**
 * Service dedicado para gerenciar a lógica de negócio do histórico de gerações.
 * Ele atua como o controller/service layer, enquanto o userService atua como o data layer.
 */
class HistoryService {

    /**
     * Adiciona um novo item ao histórico de gerações do usuário.
     * @param item Os dados da geração a serem salvos.
     */
    public add(item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>): void {
        // Delega a persistência para o userService, que gerencia o estado.
        userService.addGenerationToHistory(item);
    }

    /**
     * Recupera o histórico de gerações completo do usuário logado.
     * @returns Um array de itens do histórico.
     */
    public get(): GenerationHistoryItem[] {
        // Delega a busca de dados para o userService.
        return userService.getGenerationHistory();
    }

    // No futuro, métodos como getRecentGenerations(days) seriam adicionados aqui.
}

export const historyService = new HistoryService();
