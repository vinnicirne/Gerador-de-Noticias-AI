
import { userService } from './userService';
import { notificationService } from './notificationService';

class CreditService {
    
    /**
     * Deduz créditos do usuário e registra atividade.
     * @param amount Quantidade de créditos a deduzir.
     * @param description Descrição da operação (ex: "Gerou Notícia: Tech").
     * @returns true se sucesso, false se saldo insuficiente.
     */
    public deductCredits(amount: number, description: string): boolean {
        if (!userService.hasCredits(amount)) {
            notificationService.notify('Saldo insuficiente. Por favor, recarregue seus créditos.', 'error');
            
            // Log de tentativa falha
            userService.logActivity('Erro de Saldo', `Tentou realizar: ${description} sem saldo suficiente.`);
            return false;
        }

        try {
            // 1. Executa transação financeira
            userService.performTransaction(amount, description, 'usage');
            
            // 2. Registra atividade de auditoria (Sucesso)
            userService.logActivity('Uso de Créditos', `${description} (-${amount} créditos)`);
            
            return true;
        } catch (error) {
            console.error("Credit transaction failed", error);
            return false;
        }
    }

    /**
     * Adiciona créditos ao usuário e registra atividade.
     * @param amount Quantidade de créditos a adicionar.
     * @param description Descrição da origem (ex: "Compra Pacote Starter").
     */
    public addCredits(amount: number, description: string): void {
        // 1. Executa transação financeira
        userService.performTransaction(amount, description, 'purchase');

        // 2. Registra atividade de auditoria
        userService.logActivity('Compra de Créditos', `${description} (+${amount} créditos)`);

        notificationService.notify(`${amount} créditos adicionados com sucesso!`, 'success');
    }
}

export const creditService = new CreditService();
