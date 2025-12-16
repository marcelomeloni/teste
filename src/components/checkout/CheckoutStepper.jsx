import React from 'react';
import { FiUser, FiDollarSign, FiCheck } from 'react-icons/fi';

const steps = [
  { id: 'form_filling', label: 'Seus Dados', icon: FiUser },
  { id: 'payment_review', label: 'Revisar & Pagar', icon: FiDollarSign },
  { id: 'confirmation', label: 'Confirmação', icon: FiCheck }
];

const CheckoutStepper = ({ activeStep, getCurrentStepIndex }) => {
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    isCurrent ? 'border-green-500 text-green-500' : 
                    'border-gray-300 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <FiCheck className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-green-600' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-4 transition-colors duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper;