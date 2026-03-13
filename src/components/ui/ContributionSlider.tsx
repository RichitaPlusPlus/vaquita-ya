import React from 'react';
import styles from './ContributionSlider.module.css';

interface ContributionSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

/**
 * A 3D neubrutalist range slider for contribution adjustment.
 */
const ContributionSlider: React.FC<ContributionSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label = 'Contribution'
}) => {
  return (
    <div className={styles.sliderContainer}>
      <label className={styles.label}>{label}: {value}%</label>
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={styles.slider}
        />
        <div className={styles.sliderTrack}></div>
        <div className={styles.sliderThumb} style={{ left: `${(value / max) * 100}%` }}></div>
      </div>
    </div>
  );
};

export default ContributionSlider;