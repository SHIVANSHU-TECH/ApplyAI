"use client";

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ResumeUpload from '../components/ResumeUpload';
import SkillInput from '../components/SkillInput';
import ResultPage from '../components/ResultPage';
import LoadingState from '../components/LoadingState';

export default function Home() {
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputMethod, setInputMethod] = useState('resume');
  const [isPDFProcessing, setIsPDFProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Finding your job matches...");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check for saved results in session storage when component mounts
    const savedResults = sessionStorage.getItem('jobRecommendations');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Error parsing saved results:", e);
        sessionStorage.removeItem('jobRecommendations');
      }
    }
  }, []);

  const handleResumeUpload = (resumeData) => {
    setResume(resumeData);
    console.log("Resume uploaded:", resumeData.name);
    console.log("Text extracted length:", resumeData.text?.length || 0);
    
    // If resume has keywords, add them to skills
    if (resumeData.keywords && Array.isArray(resumeData.keywords) && resumeData.keywords.length > 0) {
      setSkills(prev => {
        const newSkills = [...new Set([...prev, ...resumeData.keywords])];
        console.log("Updated skills with keywords:", newSkills);
        return newSkills;
      });
    }
    
    // Clear any previous errors when a new resume is uploaded
    if (error && error.includes('PDF')) {
      setError(null);
    }
  };

  const handleResumeRemove = () => {
    setResume(null);
  };

  const handleSkillsChange = (newSkills) => {
    setSkills(newSkills);
  };

  // Switch to skills input method from resume upload component
  const handleManualSkillsRequest = () => {
    setInputMethod('skills');
  };

  const handleSubmit = async () => {
    // Determine if we have enough information to proceed
    const hasResume = inputMethod === 'resume' && resume?.file;
    const hasSkills = skills.length > 0;
    const hasEnoughInfo = hasResume || hasSkills;
    
    // Validation checks with helpful messages
    if (!hasEnoughInfo) {
      if (inputMethod === 'resume') {
        setError('Please upload your resume or enter skills manually');
      } else {
        setError('Please enter at least one skill');
      }
      return;
    }

    setError(null);
    setIsProcessing(true);

    // Set loading message depending on what we're processing
    if (inputMethod === 'resume' && resume?.file && resume.file.type === 'application/pdf') {
      setLoadingMessage("Processing PDF resume...");
      setIsPDFProcessing(true);
    } else {
      setLoadingMessage("Finding your job matches...");
      setIsPDFProcessing(false);
    }
  
    try {
      const formData = new FormData();
      
      // Always include skills, even if resume is uploaded
      if (skills.length > 0) {
        formData.append('skills', skills.join(', '));
      }
      
      // Include resume file if available
      if (inputMethod === 'resume' && resume?.file) {
        formData.append('resume', resume.file);
        
        // Check if it's a PDF file and set flag
        const isPDF = resume.file.type === 'application/pdf';
        formData.append('isPDF', isPDF.toString());
      }
      
      // Add any text content extracted from resume if available
      if (resume?.text && resume.text.trim().length > 0) {
        formData.append('resumeText', resume.text);
      }
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(async () => ({ error: await response.text() }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      
      // Check if we have valid recommendations
      if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
        throw new Error('No job recommendations found. Please try different skills or resume.');
      }
      
      // Transform API response to match ResultPage expectations
      const transformedResults = {
        recommendations: data.recommendations.map(rec => ({
          jobId: rec.jobId,
          // Use title from the API response if available, fallback to ID
          title: rec.title || `Job ${rec.jobId}`,
          company: rec.company || "Company Name", // Use from API if available
          location: rec.location || "Location",
          matchScore: rec.matchScore,
          description: rec.description || rec.notes || "",
          reasons: rec.reasons || [],
          notes: rec.notes || null,
          skills: rec.skills || [],
          employmentType: rec.employmentType || "Full-time"
        }))
      };
      
      setResults(transformedResults);
      sessionStorage.setItem('jobRecommendations', JSON.stringify(transformedResults));
  
    } catch (err) {
      console.error("Analysis error:", err);
      
      let userMessage = err.message;
      if (err.message.includes('404')) userMessage = 'Service unavailable. Please try again later.';
      else if (err.message.includes('network')) userMessage = 'Network error. Check your connection.';
      
      // More helpful PDF-specific error messages
      if (err.message.includes('PDF') && retryCount < 1) {
        userMessage = 'There was an issue processing your PDF. Would you like to try again with just your skills?';
        // Automatically switch to skills input method after PDF failure
        setInputMethod('skills');
        setRetryCount(prev => prev + 1);
      }
      
      setError(userMessage);
    } finally {
      setIsProcessing(false);
      setIsPDFProcessing(false);
      setLoadingMessage("Finding your job matches..."); // Reset loading message
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  const useDemoData = () => {
    setIsProcessing(true);
    setLoadingMessage("Loading demonstration data...");
    
    // Demo data with some strong matches to display
   
    
    setTimeout(() => {
      setResults(demoResults);
      setIsProcessing(false);
    }, 3000);
  };

  if (results) {
    return (
      <ResultPage 
        recommendations={results.recommendations} 
        onBack={handleReset}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {isProcessing && <LoadingState message={isPDFProcessing ? "Processing PDF resume..." : "Finding your job matches..."} />}
      
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Job Match with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume or list your skills, and our AI will find the best matching jobs for your profile.
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex rounded-md shadow-sm bg-gray-100 p-1 max-w-md mx-auto">
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none ${
                inputMethod === 'resume' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setInputMethod('resume')}
            >
              Upload Resume
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none ${
                inputMethod === 'skills' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setInputMethod('skills')}
            >
              Enter Skills
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {inputMethod === 'resume' ? (
            <>
              <ResumeUpload onResumeUpload={handleResumeUpload} onResumeRemove={handleResumeRemove} />
              <div className="mt-2 text-sm text-gray-600">
                Supported formats: PDF, DOCX, TXT. PDFs may take longer to process.
              </div>
            </>
          ) : (
            <SkillInput onSkillsChange={handleSkillsChange} />
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              Powered by Gemini AI for accurate job matching
            </p>
            
            <div className="flex gap-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={useDemoData}
              >
                Try Demo
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                Find Matches
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {step === 1 ? 'Upload Your Resume' : 
                   step === 2 ? 'AI Analysis' : 'Get Top Matches'}
                </h3>
                <p className="text-gray-600">
                  {step === 1 ? 'Upload your resume or manually enter your skills and experience.' :
                   step === 2 ? 'Our AI analyzes your profile and compares it with available job listings.' :
                   'See your top 5 job matches with detailed compatibility insights.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}