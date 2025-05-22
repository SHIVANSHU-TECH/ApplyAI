"use client";

import { useState, useRef } from 'react';
import { ArrowUpTrayIcon, DocumentTextIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { parseResume, extractKeywords } from '../lib/resume-parser';

const ResumeUpload = ({ onResumeUpload, onResumeRemove, onManualSkillsRequest }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingWarning, setProcessingWarning] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'csv'];
    
    // Check both MIME type and extension
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      setFileError('Please upload a PDF, DOC, DOCX, TXT, or CSV file');
      return;
    }

    setIsLoading(true);
    setFileError('');
    setProcessingWarning('');
    setFile(selectedFile);

    try {
      // Check if it's a PDF file and warn about potential issues
      if (selectedFile.type === 'application/pdf' || fileExtension === 'pdf') {
        setProcessingWarning('Note: Some PDF files might be difficult to process. If you encounter issues, enter your skills manually.');
      }

      // Client-side parsing using the resume-parser
      const result = await parseResume(selectedFile);
      
      // Handle different return formats from parseResume
      let extractedText = '';
      let parsedData = null;
      
      if (typeof result === 'string') {
        extractedText = result;
      } else if (result && typeof result === 'object') {
        extractedText = result.rawText || '';
        parsedData = result;
      }
      
      // Validate extracted text
      if (!extractedText || extractedText.trim().length < 50) {
        console.warn("Limited text extracted from resume:", extractedText);
        setProcessingWarning('Limited information extracted from file. Consider manually entering skills for better results.');
      }
      
      setResumeText(extractedText);
      setIsLoading(false);
      
      // Extract keywords for job matching
      const keywords = parsedData ? extractKeywords(parsedData) : extractKeywords(extractedText);
      
      if (onResumeUpload) {
        onResumeUpload({
          file: selectedFile,
          text: extractedText,
          parsedData: parsedData,
          name: selectedFile.name,
          keywords: keywords
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setFileError(`Error processing file: ${error.message}. Please try again or enter skills manually.`);
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResumeText('');
    setFileError('');
    setProcessingWarning('');
    if (onResumeRemove) {
      onResumeRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualEntryClick = () => {
    if (onManualSkillsRequest) {
      onManualSkillsRequest();
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Upload Your Resume</h2>
      
      {!file ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ArrowUpTrayIcon className="h-10 w-10 mx-auto text-gray-400" />
          <p className="mt-3 text-gray-700">Drop your resume here or <span className="text-blue-600 font-medium">browse</span></p>
          <p className="text-sm text-gray-500 mt-1">Supports PDF, DOC, DOCX, TXT, CSV (Max 5MB)</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              <span className="ml-2 font-medium text-gray-700">{file.name}</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
                Uploaded
              </span>
            </div>
            <button 
              onClick={removeFile}
              className="text-gray-500 hover:text-red-500"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Extracting resume content...</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-48 overflow-y-auto">
              <p className="font-medium mb-1">Extracted Content Preview:</p>
              {resumeText && resumeText.trim().length > 0 ? (
                <p className="whitespace-pre-wrap">{resumeText.substring(0, 300)}{resumeText.length > 300 ? '...' : ''}</p>
              ) : (
                <p className="italic text-orange-600">No text could be extracted from this file. Consider entering your skills manually.</p>
              )}
            </div>
          )}
          
          {processingWarning && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">{processingWarning}</p>
            </div>
          )}
        </div>
      )}
      
      {fileError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {fileError}
          <button 
            onClick={handleManualEntryClick}
            className="ml-2 text-blue-600 underline hover:text-blue-800"
          >
            Enter skills manually instead
          </button>
        </div>
      )}
      
      <div className="mt-3 text-sm text-gray-500">
        <p>Your resume will be analyzed to match you with suitable job opportunities.</p>
        {!file && (
          <p className="mt-1">
            Can't upload a resume?{" "}
            <button 
              onClick={handleManualEntryClick}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Enter skills manually instead
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;