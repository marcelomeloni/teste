import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useCheckout } from '@/hooks/useCheckout';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PaymentReview from '@/components/checkout/PaymentReview';
import ConfirmationStep from '@/components/checkout/ConfirmationStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';

const CheckoutPage = () => {
  const {
    activeStep,
    eventData,
    loading,
    error,
    setActiveStep,
    setError,
    processing,
    formData,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    purchaseResult,
    isSeedPhraseConfirmed,
    setIsSeedPhraseConfirmed,
    showTechnicalDetails,
    setShowTechnicalDetails,
    ticketSummary,
    totalPrice,
    isFree,
    ticketQuantity,
    ticketType,
    totalAmount,
    handleInputChange,
    handleCheckboxGroupChange,
    handleFormSubmit,
    handleFreePurchase,
    handlePayment,
    handlePaymentSuccess, // ✅ Novo: Integração com Brick
    getCurrentStepIndex,
    downloadSeedPhrase,
    handleAddToCalendar,
    downloadTicketInfo,
    isDownloadingPdf, 
    navigate,
    eventAddress,
    platformFeeBps // ✅ Novo: Taxa da plataforma vinda do hook
  } = useCheckout();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header e Stepper */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/event/${eventAddress}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Voltar para o evento
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {activeStep === 'confirmation' ? '🎉 Pedido Confirmado!' : 'Finalizar Pedido'}
          </h1>

          <CheckoutStepper activeStep={activeStep} getCurrentStepIndex={getCurrentStepIndex} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <ErrorDisplay message={error} onClose={() => setError(null)} />
            )}

            {/* Etapa 1: Formulário de Dados */}
            {activeStep === 'form_filling' && (
              <CheckoutForm
                eventData={eventData}
                formData={formData}
                handleInputChange={handleInputChange}
                handleCheckboxGroupChange={handleCheckboxGroupChange}
                handleFormSubmit={handleFormSubmit}
                processing={processing}
                isFree={isFree}
              />
            )}

            {/* Etapa 2: Revisão e Pagamento */}
            {activeStep === 'payment_review' && (
              <PaymentReview
                eventData={eventData}
                formData={formData}
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                isFree={isFree}
                eventAddress={eventAddress}
                handlePaymentSuccess={handlePaymentSuccess} // ✅ Passando a função para o Brick
                totalPrice={totalPrice}
                processing={processing}
                handlePayment={handlePayment}
                handleFreePurchase={handleFreePurchase}
                setActiveStep={setActiveStep}
                platformFeeBps={platformFeeBps} // ✅ Passando a taxa para revisão
              />
            )}

            {/* Etapa 3: Confirmação */}
            {activeStep === 'confirmation' && purchaseResult && (
              <ConfirmationStep
                purchaseResult={purchaseResult}
                eventData={eventData}
                formData={formData}
                isFree={isFree}
                ticketQuantity={ticketQuantity}
                ticketType={ticketType}
                totalAmount={totalAmount}
                isSeedPhraseConfirmed={isSeedPhraseConfirmed}
                setIsSeedPhraseConfirmed={setIsSeedPhraseConfirmed}
                showTechnicalDetails={showTechnicalDetails}
                setShowTechnicalDetails={setShowTechnicalDetails}
                downloadSeedPhrase={downloadSeedPhrase}
                handleAddToCalendar={handleAddToCalendar}
                downloadTicketInfo={downloadTicketInfo} 
                isDownloadingPdf={isDownloadingPdf} 
                navigate={navigate}
                eventAddress={eventAddress}
              />
            )}
          </div>

          {/* Sidebar - Resumo do Pedido */}
          <div className="lg:col-span-1">
            <OrderSummary
              eventData={eventData}
              ticketSummary={ticketSummary}
              totalPrice={totalPrice}
              platformFeeBps={platformFeeBps} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;