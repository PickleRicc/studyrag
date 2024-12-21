import FileUpload from '../components/FileUpload';
import QueryInterface from '../components/QueryInterface';
import { useState } from 'react';

export default function Home() {
  const [processedFiles, setProcessedFiles] = useState([]);

  const handleUploadSuccess = (results) => {
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
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                📚 Available Documents
              </h2>
              <div className="flex flex-wrap gap-2">
                {processedFiles.map((file, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {file.fileName}
                  </span>
                ))}
              </div>
            </div>
            
            <QueryInterface processedFiles={processedFiles} />
          </div>
        )}
      </div>
    </div>
  );
}
