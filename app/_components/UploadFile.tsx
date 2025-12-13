"use client";

import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
    } else {
      toast.error("Please drop a valid CSV file");
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    // Here you would normally upload the file to your server
    toast.success(`File "${file.name}" uploaded successfully!`);
    setFile(null);
  };

  const handleCancel = () => {
    setFile(null);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-background-700 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Upload file</h2>
          <div className="flex space-x-2">
            <button className="text-text-low hover:text-text-high transition-colors">
              Review
            </button>
            <span className="text-text-low">•</span>
            <button className="text-text-low hover:text-text-high transition-colors">
              Import
            </button>
          </div>
        </div>
        <p className="text-sm text-text-low">
          Import a list of people using a CSV file. Please make sure to follow
          our{" "}
          <a href="#" className="text-primary hover:underline">
            formatting guidelines
          </a>
          .
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-md p-6 mb-6 text-center ${
          isDragging
            ? "border-primary-500 bg-primary-500/5"
            : "border-background-500"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />

        {file ? (
          <div className="py-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText size={24} className="text-primary" />
              <span className="font-medium">{file.name}</span>
            </div>
            <p className="text-sm text-text-low">
              {(file.size / 1024).toFixed(1)} KB •{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-background-500 flex items-center justify-center">
              <Upload size={20} className="text-text-low" />
            </div>
            <p className="text-sm mb-2">
              Click to select a CSV file to upload
              <br />
              or simply drag and drop it here.
            </p>
            <button
              onClick={openFileSelector}
              className="text-primary text-sm hover:underline"
            >
              Select file
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-text-low hover:bg-background-500 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-4 py-2 rounded ${
            file
              ? "bg-primary-500 text-white hover:bg-primary-500/90"
              : "bg-background-500 text-text-low cursor-not-allowed"
          } transition-colors`}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
