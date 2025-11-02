import { useState, useCallback } from 'react';
import { FILE_UPLOAD } from '../../constants';

const SecureFileUpload = ({ 
  onFileSelect, 
  multiple = false, 
  accept = 'image/*',
  maxFiles = FILE_UPLOAD.MAX_FILES,
  maxSize = FILE_UPLOAD.MAX_SIZE,
  allowedTypes = FILE_UPLOAD.ALLOWED_TYPES,
  className = '',
  children 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Файл ${file.name}: недозволений тип файлу`);
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`Файл ${file.name}: розмір перевищує ${maxSizeMB}MB`);
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = /\.(exe|bat|cmd|scr|pif|com|js|jar|php|asp|jsp)$/i;
    if (suspiciousPatterns.test(file.name)) {
      errors.push(`Файл ${file.name}: підозрілий тип файлу`);
    }

    return errors;
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    let allErrors = [];

    // Check number of files
    if (!multiple && fileArray.length > 1) {
      allErrors.push('Можна вибрати лише один файл');
      setErrors(allErrors);
      return;
    }

    if (fileArray.length > maxFiles) {
      allErrors.push(`Максимум ${maxFiles} файлів`);
      setErrors(allErrors);
      return;
    }

    // Validate each file
    const validFiles = [];
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        allErrors = [...allErrors, ...fileErrors];
      }
    });

    setErrors(allErrors);

    if (validFiles.length > 0 && allErrors.length === 0) {
      onFileSelect(multiple ? validFiles : validFiles[0]);
    }
  }, [multiple, maxFiles, maxSize, allowedTypes, onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className={className}>
      <div
        className={`file-upload ${dragActive ? 'file-upload--active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="file-upload__input"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="file-upload__label">
          {children || (
            <div className="file-upload__content">
              <p>Перетягніть файли сюди або клікніть для вибору</p>
              <p className="file-upload__info">
                Максимум {maxFiles} файл(ів), до {(maxSize / (1024 * 1024)).toFixed(1)}MB кожен
              </p>
            </div>
          )}
        </label>
      </div>
      
      {errors.length > 0 && (
        <div className="file-upload__errors">
          {errors.map((error, index) => (
            <p key={index} className="file-upload__error">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecureFileUpload;