import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({
  onFilesSelected,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
  },
  maxSize = 25 * 1024 * 1024, // 25MB
  multiple = true,
  label = 'Drag and drop course material, PDFs, or exam images here',
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setErrorMessage(null);
      setUploadSuccess(false);

      if (rejectedFiles && rejectedFiles.length > 0) {
        setErrorMessage('Some files were rejected. Please verify file type (PDF/Images) and size limit (< 25MB).');
      }

      if (acceptedFiles.length > 0) {
        const enrichedFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: file.type.startsWith('image') ? URL.createObjectURL(file) : null,
          })
        );
        setFiles(enrichedFiles);

        // Simulate upload progress
        setIsUploading(true);
        setUploadProgress(15);
        const timer1 = setTimeout(() => setUploadProgress(65), 400);
        const timer2 = setTimeout(() => {
          setUploadProgress(100);
          setIsUploading(false);
          setUploadSuccess(true);
          if (onFilesSelected) {
            onFilesSelected(enrichedFiles);
          }
        }, 850);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
            : 'border-amber-900/40 bg-[#14100c]/80 hover:border-amber-400/50 hover:bg-[#1a140f]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-1">
              {isDragActive ? 'Release files to upload immediately' : label}
            </p>
            <p className="text-xs text-gray-400">
              Supports PDF, PNG, JPG, JPEG (Max 25MB per file)
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-4 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-medium border border-amber-400/30 transition"
          >
            Browse from Computer
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Uploading & scanning educational content...</span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-amber-900/40">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Success indicator */}
      {uploadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Materials uploaded and verified successfully! Ready for AI question generation or lesson attachment.</span>
        </div>
      )}

      {/* Selected file preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-12 h-12 rounded-lg object-cover border border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                <p className="text-[10px] text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-gray-400 hover:text-red-400 transition p-1"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
