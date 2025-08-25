import React, { useState, useRef, ChangeEvent } from 'react';
import { FileUploadErrorType } from '../lib/fileUpload';

interface FileUploadProps {
  endpoint: string;
  onUploadSuccess: (fileData: any) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  buttonText?: string;
  csrfToken?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  fileName: string | null;
}

export default function FileUpload({
  endpoint,
  onUploadSuccess,
  onUploadError,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  className = '',
  buttonText = 'Upload File',
  csrfToken,
}: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    fileName: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert maxSizeMB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset state
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      fileName: file.name,
    });
    
    // Client-side validation
    if (file.size > maxSizeBytes) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
        fileName: file.name,
      });
      onUploadError(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
      return;
    }
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: csrfToken ? {
          'X-CSRF-Token': csrfToken,
        } : undefined,
      });
      
      // Handle response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      // Call success callback
      onUploadSuccess(data.file);
      
      // Reset state
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        fileName: file.name,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Set error state
      setUploadState({
        isUploading: false,
        progress: 0,
        error: (error as Error).message,
        fileName: file.name,
      });
      
      // Call error callback
      onUploadError((error as Error).message);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={`file-upload ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
        disabled={uploadState.isUploading}
      />
      
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploadState.isUploading}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
        >
          {uploadState.isUploading ? 'Uploading...' : buttonText}
        </button>
        
        {uploadState.fileName && !uploadState.isUploading && !uploadState.error && (
          <span className="ml-3 text-sm text-gray-500">
            {uploadState.fileName}
          </span>
        )}
        
        {uploadState.isUploading && (
          <span className="ml-3 text-sm text-gray-500">
            Uploading {uploadState.fileName}...
          </span>
        )}
        
        {!uploadState.fileName && !uploadState.isUploading && (
          <span className="ml-3 text-sm text-gray-500">
            No file chosen
          </span>
        )}
      </div>
      
      {uploadState.isUploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full"
            style={{ width: `${uploadState.progress}%` }}
          ></div>
        </div>
      )}
      
      {uploadState.error && (
        <p className="mt-2 text-sm text-red-600">{uploadState.error}</p>
      )}
    </div>
  );
}
