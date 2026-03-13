import React from 'react';
import styles from './Action3DButton.module.css';

interface Action3DButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * A 3D neubrutalist button with jumping layers effect.
 */
const Action3DButton: React.FC<Action3DButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className={styles.layer1}>{label}</span>
      <span className={styles.layer2}>{label}</span>
      <span className={styles.layer3}>{label}</span>
      <span className={styles.layer4}>{label}</span>
      <span className={styles.layer5}>{label}</span>
    </button>
  );
};

export default Action3DButton;