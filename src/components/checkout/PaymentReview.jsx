import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { API_URL } from '@/lib/constants'; 

// INICIALIZE COM SUA PUBLIC KEY
initMercadoPago('APP_USR-d1c7345d-d7e5-466d-a344-d8d28b398667', { locale: 'pt-BR' });

const PaymentReview = ({
  eventData,
  formData,
  isFree,
  totalPrice,
  processing,
  handleFreePurchase,
  setActiveStep,
  handlePaymentSuccess, 
  eventAddress // <--- Isso precisa vir do pai, mas vamos criar um fallback
}) => {

  // 1. Lógica de Segurança para o Endereço do Evento
  // Tenta pegar da prop direta, se não tiver, tenta achar dentro do objeto eventData
  const finalEventAddress = eventAddress || eventData?.event_address || eventData?.address || eventData?.id;

  if (!finalEventAddress) {
      console.error("CRÍTICO: Endereço do evento não encontrado. O pagamento irá falhar.");
  }

  // 2. Tratamento do Email (Anti-Crash do Brick)
  const rawEmail = formData['field-2'];
  const isValidEmail = rawEmail && rawEmail.includes('@') && rawEmail.includes('.');
  const payerEmail = isValidEmail ? rawEmail : undefined;

  const firstName = formData['field-1']?.split(' ')[0] || 'Visitante';
  const lastName = formData['field-1']?.split(' ').slice(1).join(' ') || 'Ticketfy';

  const onSubmit = async ({ selectedPaymentMethod, formData: mpFormData }) => {
    console.log("🚀 Botão Pagar Clicado! Processando para evento:", finalEventAddress);
    
    const installments = mpFormData.installments || 1;

    // Montar o payload
    const backendPayload = {
      amount: totalPrice,
      token: mpFormData.token, 
      paymentMethodId: mpFormData.payment_method_id,
      installments: installments,
      payer: {
        email: mpFormData.payer.email,
        firstName: mpFormData.payer.first_name || firstName,
        lastName: mpFormData.payer.last_name || lastName,
        docType: mpFormData.payer.identification?.type || 'CPF',
        docNumber: mpFormData.payer.identification?.number
      },
      ticketId: eventData.id, 
      
      // AQUI ESTAVA O ERRO: Agora garantimos que vai preenchido
      eventAddress: finalEventAddress,
      
      // Enviamos null para o backend se virar com a criação do usuário convidado
      userId: null 
    };

    try {
      const response = await fetch(`${API_URL || 'http://localhost:3001'}/api/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      const result = await response.json();

      if (response.ok) {
        return new Promise((resolve) => {
           console.log("💰 Pagamento processado no MP:", result);
           handlePaymentSuccess(result); 
           resolve();
        });
      } else {
        console.error("Erro API:", result);
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error("Erro no onSubmit:", error);
      throw error; 
    }
  };

  const onError = async (error) => {
    console.log("❌ Erro interno do Brick:", error);
  };

  const onReady = async () => {
    console.log("✅ Brick carregado e pronto.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-6">Revisar e Finalizar Compra</h2>
        
        <div className="space-y-4">
             <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="text-xl font-bold text-green-600">R$ {totalPrice.toFixed(2)}</span>
                </div>
            </div>
            {!isValidEmail && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm">
                    ⚠️ O e-mail "{rawEmail}" parece inválido. Preencha corretamente abaixo.
                </div>
            )}
        </div>
      </div>

      {!isFree ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
          <h3 className="text-xl font-semibold mb-6">Realizar Pagamento</h3>
          
          <div className="mp-brick-container">
            <Payment
              initialization={{
                amount: totalPrice,
                payer: {
                  email: payerEmail, 
                },
              }}
              customization={{
                paymentMethods: {
                  ticket: "all",
                  creditCard: "all",
                  bankTransfer: "all",
                  maxInstallments: 12
                },
                visual: {
                  style: { theme: 'bootstrap' },
                  hidePaymentButton: false 
                },
              }}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={() => setActiveStep('form_filling')}
              className="w-full text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
            >
              Voltar e editar dados
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="text-center">
             <h3 className="text-xl font-semibold mb-2">Seus ingressos são gratuitos!</h3>
             <button
                onClick={handleFreePurchase}
                disabled={processing}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl mt-4 w-full"
              >
                {processing ? 'Processando...' : 'Confirmar Ingressos'}
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReview;