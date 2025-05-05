"use client";

import { useEffect, useState } from 'react';
import JobCard from './JobCard';

const TopMatches = ({ recommendations }) => {
  const [topMatches, setTopMatches] = useState([]);
  
  useEffect(() => {
    // Filter for strong matches (>=70%) and sort by highest percentage first
    const strongMatches = recommendations
      .filter(job => job.matchScore >= 70)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Take only top 5
      
    setTopMatches(strongMatches);
  }, [recommendations]);

  if (topMatches.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-medium text-gray-700">No Strong Matches Found</h3>
        <p className="text-gray-500 mt-2">
          We couldn't find any strong matches (70%+ match score) for your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <h2 className="text-xl font-semibold text-green-800 flex items-center">
          <span className="bg-green-100 text-green-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
            {topMatches.length}
          </span>
          Top Job Matches
        </h2>
        <p className="text-green-700 mt-1">
          Showing your {topMatches.length} strongest matches (70%+ match score)
        </p>
      </div>
      
      <div className="space-y-4">
        {topMatches.map((job) => (
          <JobCard key={job.jobId} job={job} />
        ))}
      </div>
    </div>
  );
};

export default TopMatches;