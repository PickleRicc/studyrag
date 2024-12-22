'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function FileUpload({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const { addActiveFile, setActiveFiles } = useActiveFiles();

    const uploadFiles = async (files) => {
        setError(null);
        setUploading(true);
        setProgress({ current: 0, total: files.length });

        // Clear active files when starting a new upload
        setActiveFiles([]);

        const results = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                if (!file.type.includes('pdf') && !file.type.includes('audio')) {
                    throw new Error(`${file.name} is not a PDF or audio file`);
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileType', file.type);
                formData.append('isFirstFile', i === 0 ? 'true' : 'false');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const data = await response.json();
                if (data.fileName) {
                    results.push({
                        fileName: data.fileName,
                        type: file.type
                    });
                }
                addActiveFile(file.name);
            } catch (err) {
                errors.push(`${file.name}: ${err.message}`);
            }
        }

        setUploading(false);
        
        if (errors.length > 0) {
            setError(errors.join('\n'));
        }

        if (results.length > 0 && onUploadSuccess) {
            // Pass first result since we're uploading one at a time
            onUploadSuccess(results[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: uploadFiles,
        accept: {
            'application/pdf': ['.pdf'],
            'audio/*': ['.mp3', '.wav']
        },
        multiple: true
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    w-full p-6 border-2 border-dashed rounded-xl transition-colors duration-200
                    ${isDragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400 bg-white'}
                `}
            >
                <input {...getInputProps()} />
                <div className="text-center">
                    <svg 
                        className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            {isDragActive ? (
                                "Drop your files here..."
                            ) : (
                                <>
                                    Drag & drop files here, or{' '}
                                    <span className="text-blue-500 hover:text-blue-600 cursor-pointer">browse</span>
                                </>
                            )}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Supports PDF documents and audio files (MP3, WAV)
                        </p>
                    </div>

                    {uploading && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                Uploading {progress.current} of {progress.total} files...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
