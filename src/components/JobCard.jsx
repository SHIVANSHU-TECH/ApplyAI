"use client";

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const JobCard = ({ job }) => {
  const [expanded, setExpanded] = useState(false);

  // Make sure we have all the required data
  if (!job) return null;
  
  const {
    jobId,
    title = `Job ID: ${jobId || 'Unknown'}`,
    company = 'Company not specified',
    location = 'Location not specified',
    matchScore = 0,
    recommendation: initialRecommendation = 'weak',
    reasons = [],
    notes = null,
    description = '',
    skills = []
  } = job;

  // Calculate recommendation based on matchScore
  const getRecommendation = (score) => {
    if (score >= 70) return 'strong';
    if (score >= 40) return 'moderate';
    return 'weak';
  };

  // Use the calculated recommendation instead of the one from props
  const recommendation = getRecommendation(matchScore);

  // Compute score color
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Compute recommendation style
  const getRecommendationStyle = (rec) => {
    switch (rec) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              {matchScore >= 90 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1" /> Top Match
                </span>
              )}
            </div>
            <p className="text-gray-600">{company}</p>
            {location && <p className="text-gray-500 text-sm">{location}</p>}
          </div>
          <div className="flex flex-col items-end">
            <div className={`font-bold text-lg ${getScoreColor(matchScore)}`}>
              {matchScore}% Match
            </div>
            <span className={`mt-1 text-xs px-2 py-1 rounded-full ${getRecommendationStyle(recommendation)}`}>
              {recommendation.charAt(0).toUpperCase() + recommendation.slice(1)}
            </span>
          </div>
        </div>
        
        <button 
          className="mt-3 flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details
            </>
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 border-t pt-3">
          {reasons.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Why this matches:</h4>
              <ul className="space-y-1">
                {reasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {notes && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Notes:</h4>
              <div className="bg-yellow-50 border border-yellow-100 rounded p-3 text-gray-700">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                  <p>{notes}</p>
                </div>
              </div>
              </div>
          )}
          
          {skills && skills.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {description && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Description:</h4>
              <p className="text-gray-700 text-sm">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default JobCard;