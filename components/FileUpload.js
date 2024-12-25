'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useActiveFiles } from '../hooks/useActiveFiles';
import { useAuth } from '../context/AuthContext';
import Progress from './Progress';

const FileUpload = ({ onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { addActiveFile, setActiveFiles } = useActiveFiles();
    const { user } = useAuth();
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
        }
    };

    const handleClick = () => {
        inputRef.current.click();
    };

    const uploadFiles = async (files) => {
        if (!user) {
            setError('Please sign in to upload files');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        // Clear active files when starting a new upload
        setActiveFiles([]);

        const results = [];
        const errors = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const currentProgress = Math.round((i / totalFiles) * 100);
            setUploadProgress(currentProgress);

            try {
                if (!file.type.includes('pdf') && 
                    !file.type.includes('audio') && 
                    !file.type.includes('mpeg') && 
                    !file.type.includes('wav') && 
                    !file.type.includes('mp3')) {
                    throw new Error(`${file.name} is not a PDF or audio file`);
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileType', file.type);
                formData.append('isFirstFile', i === 0 ? 'true' : 'false');
                formData.append('userId', user.id);

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
                        type: file.type,
                        documentId: data.documentId
                    });
                }
                addActiveFile(file.name);
            } catch (err) {
                errors.push(`${file.name}: ${err.message}`);
            }
        }

        setUploadProgress(100);
        
        // Reset after a delay to show 100% completion
        setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);

            if (errors.length > 0) {
                setError(errors.join('\n'));
            } else {
                setError(null);
                if (onUploadSuccess) {
                    onUploadSuccess(results);
                }
            }
        }, 500);
    };

    return (
        <div className="w-full">
            <div
                className={`relative p-10 border-2 border-dashed rounded-lg text-center space-y-4
                           ${dragActive 
                               ? 'border-[var(--accent-green)] bg-[var(--accent-green)] bg-opacity-5' 
                               : 'border-[var(--border)]'
                           } transition-colors duration-200`}
                onDragEnter={handleDrag}
                onDragLeave={() => setDragActive(false)}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.mp3,.wav,.m4a,.aac,.ogg,audio/*"
                    multiple
                />

                <div className="flex justify-center">
                    <svg
                        className="w-10 h-10 text-[var(--text-secondary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>

                <div>
                    <button
                        className="text-[var(--text-primary)] hover:text-[var(--accent-green)] transition-colors duration-200"
                        onClick={handleClick}
                    >
                        Click to upload
                    </button>
                    <span className="text-[var(--text-secondary)]"> or drag and drop</span>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Supports PDF and audio files (MP3, WAV, M4A, AAC, OGG)
                    </p>
                </div>

                {uploading && (
                    <div className="space-y-3">
                        <Progress progress={uploadProgress} showPulse={uploadProgress < 100} />
                        <p className="text-sm text-[var(--text-secondary)]">
                            Uploading... {uploadProgress}%
                        </p>
                    </div>
                )}

                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
