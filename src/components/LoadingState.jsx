"use client";

import React from 'react';

const LoadingState = ({ message = "Analyzing your profile & finding matches..." }) => {
  const steps = [
    "Extracting key information",
    "Analyzing skills and experience",
    "Searching job database",
    "Ranking matches based on your profile",
    "Preparing personalized recommendations"
  ];
  
  const [currentStep, setCurrentStep] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          {/* Animation */}
          <div className="mb-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          
          {/* Main message */}
          <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">{message}</h2>
          
          {/* Current step */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 w-full mb-4">
            <p className="text-blue-700 text-center">
              {steps[currentStep]}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Our AI is analyzing your profile to find the best job matches. This may take a minute.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;