import React, { useState } from 'react';
import { Check } from 'lucide-react';
import styles from './SmartChecklist.module.css';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface SmartChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
}

/**
 * A 3D neubrutalist checklist with firework animation on check.
 */
const SmartChecklist: React.FC<SmartChecklistProps> = ({ items, onToggle }) => {
  const [animating, setAnimating] = useState<string | null>(null);

  const handleToggle = (id: string, checked: boolean) => {
    onToggle(id, checked);
    if (checked) {
      setAnimating(id);
      setTimeout(() => setAnimating(null), 1000);
    }
  };

  return (
    <ul className={styles.checklist}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => handleToggle(item.id, e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkmark}>
              <Check size={16} />
            </span>
            <span className={styles.text}>{item.label}</span>
          </label>
          {animating === item.id && <div className={styles.firework}></div>}
        </li>
      ))}
    </ul>
  );
};

export default SmartChecklist;