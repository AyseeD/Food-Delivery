import { useState } from "react";
import "../styles/PaymentProcessor.css";

export default function PaymentProcessor({ 
  amount, 
  selectedCard, 
  onSuccess, 
  onCancel
}) {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const steps = [
    { title: "Validating card", description: "Checking card details..." },
    { title: "Connecting to bank", description: "Establishing secure connection..." },
    { title: "Processing payment", description: "Authorizing transaction..." },
    { title: "Verifying funds", description: "Confirming available balance..." },
    { title: "Completing transaction", description: "Finalizing payment..." }
  ];

  const simulatePayment = async () => {
    setProcessing(true);
    
    //each step with delay
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds per step
    }
    
    //success
    setSimulationComplete(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    //call success callback
    if (onSuccess) {
      onSuccess();
    }
  };

  const formatCardNumber = (number) => {
    if (!number) return "•••• •••• •••• ••••";
    const lastFour = number.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  return (
    <div className="payment-processor">
      <div className="payment-header">
        <h3>Complete Payment</h3>
      </div>

      <div className="payment-summary">
        <div className="summary-item">
          <span>Amount to Pay:</span>
          <span className="amount">${amount.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Payment Method:</span>
          <span>{selectedCard?.card_nickname || "Credit Card"}</span>
        </div>
        <div className="summary-item">
          <span>Card Number:</span>
          <span>{formatCardNumber(selectedCard?.card_number)}</span>
        </div>
      </div>

      {!processing && !simulationComplete && (
        <div className="payment-actions">
          <button className="pay-button" onClick={simulatePayment}>
            <i className="fa-solid fa-lock"></i>
            Pay ${amount.toFixed(2)}
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {processing && (
        <div className="payment-progress">
          <h4>Processing Payment...</h4>
          
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {index < currentStep ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="processing-animation">
            <div className="spinner"></div>
            <p>Please wait while we process your payment...</p>
          </div>
        </div>
      )}

      {simulationComplete && (
        <div className="payment-success">
          <div className="success-icon">
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <h4>Payment Successful!</h4>
          <p>Your payment of ${amount.toFixed(2)} has been processed successfully.</p>
          <div className="transaction-details">
            <p><strong>Transaction ID:</strong> DEMO-{Date.now().toString(36).toUpperCase()}</p>
            <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> <span className="status-completed">Completed</span></p>
          </div>
          <button className="continue-button" onClick={onSuccess}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}