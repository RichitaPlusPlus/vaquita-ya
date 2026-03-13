import React, { useEffect } from 'react';
import styles from './CompletionNotification.module.css';

interface CompletionNotificationProps {
  onClose: () => void;
}

/**
 * 3D celebratory notification for completion.
 */
const CompletionNotification: React.FC<CompletionNotificationProps> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.notification}>
      <div className={styles.content}>
        <h2>🎉 ALL PAID! 🎉</h2>
        <p>Vaquita completed successfully!</p>
        <div className={styles.confetti}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={styles.confettiPiece} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#ff0', '#f00', '#0f0', '#00f', '#f0f'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletionNotification;