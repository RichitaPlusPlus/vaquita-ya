import React, { useState } from 'react';
import styles from './NeubrutalistForm.module.css';

interface NeubrutalistFormProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  buttonLabel?: string;
}

/**
 * A 3D neubrutalist form with floating badge.
 */
const NeubrutalistForm: React.FC<NeubrutalistFormProps> = ({
  onSubmit,
  placeholder = 'Enter value',
  buttonLabel = 'Submit'
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <span className={`${styles.badge} ${isFocused || value ? styles.active : ''}`}>
          USERNAME
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={styles.input}
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        {buttonLabel}
      </button>
    </form>
  );
};

export default NeubrutalistForm;