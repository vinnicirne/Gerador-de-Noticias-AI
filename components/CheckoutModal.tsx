
import React, { useState, useEffect } from 'react';
import { CreditPackage, PaymentTransaction } from '../types';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from './LoadingSpinner';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPackage: CreditPackage | null;
}

type CheckoutStep = 'select_method' | 'processing' | 'pix_payment' | 'success' | 'error';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, selectedPackage }) => {
    const [step, setStep] = useState<CheckoutStep>('select_method');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
    const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('select_method');
            setErrorMsg('');
            setTransaction(null);
        }
    }, [isOpen]);

    if (!isOpen || !selectedPackage) return null;

    const handleProcessPayment = async () => {
        setStep('processing');
        try {
            const tx = await paymentService.createPaymentIntent(selectedPackage, paymentMethod);
            setTransaction(tx);

            if (paymentMethod === 'pix') {
                setStep('pix_payment');
                // Inicia polling simulado
                startPolling(tx);
            } else {
                // Para cartão com Mercado Pago, redirecionaríamos. Aqui simulamos o sucesso direto para UX.
                // Em produção: window.location.href = tx.initPoint;
                await paymentService.getPaymentStatus(tx);
                setStep('success');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao processar pagamento');
            setStep('error');
        }
    };

    const startPolling = async (tx: PaymentTransaction) => {
        // Simula espera de 4 segundos antes de confirmar o PIX
        setTimeout(async () => {
             try {
                await paymentService.getPaymentStatus(tx);
                setStep('success');
            } catch (err: any) {
                setErrorMsg("Tempo limite excedido ou pagamento não confirmado.");
                setStep('error');
            }
        }, 4000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-[#136c0b]/30 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Checkout Seguro</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Product Summary */}
                    <div className="flex justify-between items-center mb-6 bg-gray-800/50 p-3 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-400 uppercase font-bold">Pacote</p>
                            <p className="text-white font-bold text-lg">{selectedPackage.id.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400 uppercase font-bold">Valor</p>
                            <p className="text-[#1b8a0f] font-bold text-lg">R$ {selectedPackage.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>

                    {step === 'select_method' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300 mb-2">Escolha a forma de pagamento:</p>
                            
                            <button 
                                onClick={() => setPaymentMethod('pix')}
                                className={`w-full flex items-center p-4 border rounded-lg transition-all ${paymentMethod === 'pix' ? 'border-[#1b8a0f] bg-[#1b8a0f]/10 ring-1 ring-[#1b8a0f]' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1b8a0f] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <div className="text-left">
                                    <span className="block font-bold text-white">PIX (Instantâneo)</span>
                                    <span className="text-xs text-gray-400">Liberação imediata dos créditos</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => setPaymentMethod('credit_card')}
                                className={`w-full flex items-center p-4 border rounded-lg transition-all ${paymentMethod === 'credit_card' ? 'border-[#1b8a0f] bg-[#1b8a0f]/10 ring-1 ring-[#1b8a0f]' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                <div className="text-left">
                                    <span className="block font-bold text-white">Cartão de Crédito</span>
                                    <span className="text-xs text-gray-400">Via Mercado Pago</span>
                                </div>
                            </button>

                            <button 
                                onClick={handleProcessPayment}
                                className="w-full mt-6 py-3 bg-[#1b8a0f] text-white font-bold rounded hover:bg-[#24a813] transition-colors shadow-lg shadow-green-900/20"
                            >
                                Continuar para Pagamento
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-8">
                            <LoadingSpinner className="h-12 w-12 text-[#1b8a0f] mx-auto mb-4" />
                            <p className="text-white font-bold">Criando Preferência no Mercado Pago...</p>
                            <p className="text-gray-400 text-sm">Aguarde um momento.</p>
                        </div>
                    )}

                    {step === 'pix_payment' && transaction && (
                        <div className="text-center space-y-4">
                            <div className="bg-white p-4 rounded-lg inline-block mx-auto border-4 border-[#1b8a0f]">
                                {/* QR Code Placeholder - Using an API to generate a real-looking QR */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${transaction.amount.toFixed(2).replace('.', '')}5802BR5913GDN IA System6008Sao Paulo62070503***6304`} 
                                    alt="QR Code Pix" 
                                    className="w-40 h-40"
                                />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Escaneie o QR Code</p>
                                <p className="text-gray-400 text-sm mb-4">Abra o app do seu banco e pague via PIX.</p>
                                
                                <div className="bg-gray-800 p-3 rounded border border-gray-700 flex items-center justify-between">
                                    <code className="text-xs text-gray-300 truncate max-w-[200px]">00020126360014BR.GOV.BCB.PIX...</code>
                                    <button className="text-[#1b8a0f] text-xs font-bold hover:underline">Copiar Código</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs animate-pulse">
                                <LoadingSpinner className="h-3 w-3" />
                                Verificando pagamento automaticamente...
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pagamento Aprovado!</h3>
                            <p className="text-gray-300 mb-6">
                                Seus <span className="text-[#1b8a0f] font-bold">{selectedPackage.credits} créditos</span> foram adicionados com sucesso.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-gray-800 text-white rounded hover:bg-gray-700 border border-gray-600"
                            >
                                Fechar e Usar Créditos
                            </button>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pagamento Falhou</h3>
                            <p className="text-red-400 mb-6">{errorMsg}</p>
                            <button 
                                onClick={() => setStep('select_method')}
                                className="w-full py-3 bg-gray-800 text-white rounded hover:bg-gray-700 border border-gray-600"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
