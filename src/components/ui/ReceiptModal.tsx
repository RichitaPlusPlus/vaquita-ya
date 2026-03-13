import React, { useState } from 'react';
import { useVaquita } from '../../contexts/VaquitaContext';
import { useVaquitaEngine } from '../../hooks/useVaquitaEngine';
import Action3DButton from './Action3DButton';
import styles from './ReceiptModal.module.css';

interface ReceiptModalProps {
  onClose: () => void;
  organizerName: string;
  externalExpenses?: number;
}

/**
 * Visual modal with receipt display and copy to clipboard functionality.
 */
const ReceiptModal: React.FC<ReceiptModalProps> = ({ onClose, organizerName, externalExpenses = 0 }) => {
  const { state } = useVaquita();
  const { generateVaquitaReceipt } = useVaquitaEngine(state);
  const [copied, setCopied] = useState(false);

  const receipt = generateVaquitaReceipt(organizerName, externalExpenses);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receipt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.content}>
        <h2>Vaquita Receipt</h2>
        <pre className={styles.receipt}>{receipt}</pre>
        <div className={styles.actions}>
          <Action3DButton label={copied ? "Copied!" : "Copy to Clipboard"} onClick={handleCopy} />
          <Action3DButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;