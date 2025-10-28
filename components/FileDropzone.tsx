'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  accept = '.pdf',
  maxSize = 10 * 1024 * 1024,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (!file) return;

      if (file.size > maxSize) {
        setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
        setError(`Please upload a ${accept} file`);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, accept, maxSize]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];

      if (!file) return;

      if (file.size > maxSize) {
        setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, maxSize]
  );

  return (
    <div className={cn('w-full', className)}>
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all',
          isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
            : 'border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload CV file"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF files up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
          aria-label="File upload input"
        />
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
}
