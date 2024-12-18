import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const uploadFiles = async (files) => {
    setError(null);
    setUploading(true);
    setProgress({ current: 0, total: files.length });

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        // Check if file is either PDF or audio
        if (!file.type.includes('pdf') && !file.type.includes('audio')) {
          throw new Error(`${file.name} is not a PDF or audio file`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', file.type); // Send file type to backend

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        results.push({ ...data, fileName: file.name, fileType: file.type });
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
    
    if (results.length > 0) {
      onUploadSuccess?.(results);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    uploadFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: true
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          {isDragActive ? (
            <p className="text-blue-500">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop PDF or audio files here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">You can select multiple files</p>
            </div>
          )}
        </div>
      </div>
      
      {uploading && (
        <div className="mt-4 text-center text-gray-600">
          <p>Uploading file {progress.current} of {progress.total}...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-center text-red-500 whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
}
