import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';
import styles from './Dropzone.module.css';

interface DropzoneProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
}

/**
 * Drag-and-drop zone for image upload with compression.
 */
const Dropzone: React.FC<DropzoneProps> = ({ onImageSelect, currentImage }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file);
      onImageSelect(compressed);
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div
      className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
        id="image-upload"
      />
      <label htmlFor="image-upload" className={styles.label}>
        {isProcessing ? (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            Processing...
          </div>
        ) : currentImage ? (
          <div className={styles.preview}>
            <img src={currentImage} alt="Preview" className={styles.image} />
            <p>Click or drag to change</p>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <Upload size={48} />
            <p>Drag & drop an image here, or click to select</p>
            <small>Images will be compressed for local storage</small>
          </div>
        )}
      </label>
    </div>
  );
};

export default Dropzone;