import React from 'react';
import { Check, X } from 'lucide-react';
import styles from './StatusToggle.module.css';

interface StatusToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

/**
 * A 3D neubrutalist toggle for status (paid/pending).
 */
const StatusToggle: React.FC<StatusToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className={styles.toggleContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        className={`${styles.toggle} ${checked ? styles.checked : styles.unchecked}`}
        onClick={() => onChange(!checked)}
        aria-label={checked ? 'Mark as pending' : 'Mark as paid'}
      >
        <div className={styles.icon}>
          {checked ? <Check size={24} /> : <X size={24} />}
        </div>
        <div className={styles.shadow}></div>
      </button>
    </div>
  );
};

export default StatusToggle;