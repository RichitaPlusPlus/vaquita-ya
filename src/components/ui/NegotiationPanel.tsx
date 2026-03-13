import React, { useState } from 'react';
import { useVaquita } from '../../contexts/VaquitaContext';
import { useVaquitaEngine } from '../../hooks/useVaquitaEngine';
import { DebtEntry } from '../../types';
import Action3DButton from './Action3DButton';
import NeubrutalistForm from './NeubrutalistForm';
import styles from './NegotiationPanel.module.css';

interface NegotiationPanelProps {
  onClose: () => void;
}

/**
 * UI panel for debt negotiation with interest/debt agreement.
 */
const NegotiationPanel: React.FC<NegotiationPanelProps> = ({ onClose }) => {
  const { state, dispatch } = useVaquita();
  const { processDebtNegotiation } = useVaquitaEngine(state);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [negotiatedAmount, setNegotiatedAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [interestNote, setInterestNote] = useState('');

  const handleConfirm = () => {
    if (!selectedParticipant || !originalAmount || !negotiatedAmount || !dueDate) return;

    const debt: DebtEntry = {
      id: Date.now().toString(),
      originalAmount: parseFloat(originalAmount),
      negotiatedAmount: parseFloat(negotiatedAmount),
      dueDate: new Date(dueDate),
      interestNote,
      status: 'agreed',
    };

    const processedDebt = processDebtNegotiation(debt);
    dispatch({ type: 'ADD_DEBT', payload: processedDebt });

    // Reset form
    setSelectedParticipant('');
    setOriginalAmount('');
    setNegotiatedAmount('');
    setDueDate('');
    setInterestNote('');
  };

  const pendingParticipants = state.participants.filter(p => p.status === 'pending');

  return (
    <div className={styles.panel}>
      <h2>Debt Negotiation</h2>
      <p>As organizer, you have unilateral authority to confirm debts.</p>

      <div className={styles.formGroup}>
        <label>Select Participant:</label>
        <select
          value={selectedParticipant}
          onChange={(e) => setSelectedParticipant(e.target.value)}
          className={styles.select}
        >
          <option value="">Choose participant</option>
          {pendingParticipants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <NeubrutalistForm
        onSubmit={(value) => setOriginalAmount(value)}
        placeholder="Original amount"
        buttonLabel="Set Original"
      />

      <NeubrutalistForm
        onSubmit={(value) => setNegotiatedAmount(value)}
        placeholder="Negotiated amount"
        buttonLabel="Set Negotiated"
      />

      <div className={styles.formGroup}>
        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.input}
        />
      </div>

      <NeubrutalistForm
        onSubmit={(value) => setInterestNote(value)}
        placeholder="Interest/fee note"
        buttonLabel="Set Note"
      />

      {originalAmount && negotiatedAmount && (
        <div className={styles.interest}>
          Interest/Negotiation Fee: ${(parseFloat(negotiatedAmount) - parseFloat(originalAmount)).toFixed(2)}
        </div>
      )}

      <div className={styles.actions}>
        <Action3DButton label="Confirm Debt" onClick={handleConfirm} />
        <Action3DButton label="Cancel" onClick={onClose} />
      </div>
    </div>
  );
};

export default NegotiationPanel;