import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './FileUpload.module.css';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File | null) => void;
  error?: string;
  helperText?: string;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/png,image/jpeg,image/jpg',
  maxSize = 8388608, // 8MB default
  onFileSelect,
  error,
  helperText,
  preview = true,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setUploadError(null);

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      setUploadError(`File size exceeds ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Invalid file type');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Create preview for images
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || uploadError;

  return (
    <div className={styles.wrapper}>
      {!selectedFile ? (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${
            displayError ? styles.error : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload size={32} className={styles.icon} />
          <p className={styles.text}>
            Drag and drop your file here, or <span className={styles.browse}>browse</span>
          </p>
          {helperText && <p className={styles.helperText}>{helperText}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className={styles.input}
            aria-label="File upload"
          />
        </div>
      ) : (
        <div className={styles.preview}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
          ) : (
            <div className={styles.fileInfo}>
              <FileIcon size={32} />
              <span className={styles.fileName}>{selectedFile.name}</span>
            </div>
          )}
          <button
            onClick={handleRemove}
            className={styles.removeButton}
            aria-label="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {displayError && <span className={styles.errorText}>{displayError}</span>}
    </div>
  );
};

