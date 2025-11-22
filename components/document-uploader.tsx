import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, X } from 'lucide-react';

interface DocumentUploaderProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export default function DocumentUploader({ onFileUpload, disabled }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      onFileUpload(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="document-upload"
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
        disabled={disabled || isUploading}
      />
      <label htmlFor="document-upload">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-lg ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || isUploading}
        >
          <Paperclip className="h-4 w-4 text-gray-500" />
        </Button>
      </label>

      {file && (
        <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <span className="truncate max-w-[100px]">{file.name}</span>
          <button type="button" onClick={removeFile} className="text-white hover:text-gray-300">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}