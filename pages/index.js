import FileUpload from '../components/FileUpload';
import { useState } from 'react';

export default function Home() {
  const [processedFiles, setProcessedFiles] = useState([]);

  const handleUploadSuccess = (results) => {
    console.log('Files uploaded:', results);
    setProcessedFiles(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">StudyRag</h1>
          <p className="text-lg text-gray-600">
            Upload your PDF documents and ask questions about them
          </p>
        </div>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {processedFiles.length > 0 && (
          <div className="mt-8 space-y-6">
            {processedFiles.map((file, fileIndex) => (
              <div key={fileIndex} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">
                    {file.fileType?.includes('pdf') ? '📄' : '🎵'}
                  </span>
                  {file.fileName}
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Type: {file.fileType?.includes('pdf') ? 'PDF Document' : 'Audio File'} | 
                      {file.fileType?.includes('pdf') ? (
                        `Pages: ${file.extracted.numPages}`
                      ) : (
                        'Audio Transcript'
                      )} | 
                      Chunks: {file.extracted.chunks?.length || 0}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {file.fileType?.includes('pdf') ? 'Content Preview' : 'Transcript Preview'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {file.extracted.text.slice(0, 500)}
                        {file.extracted.text.length > 500 && '...'}
                      </pre>
                    </div>
                  </div>

                  {file.extracted.chunks && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">
                        Sample Chunks
                      </h3>
                      <div className="space-y-2">
                        {file.extracted.chunks.slice(0, 2).map((chunk, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded border">
                            <p className="text-xs text-gray-500 mb-2">
                              Chunk {index + 1} | {chunk.metadata.fileType}
                            </p>
                            <pre className="whitespace-pre-wrap font-mono text-sm">
                              {chunk.text}
                            </pre>
                          </div>
                        ))}
                        {file.extracted.chunks.length > 2 && (
                          <p className="text-sm text-gray-500">
                            ... and {file.extracted.chunks.length - 2} more chunks
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
