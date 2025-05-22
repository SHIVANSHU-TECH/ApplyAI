'use client';
import { useEffect, useState } from 'react';
import JobList from '../../components/JobList';
import LoadingState from '../../components/LoadingState';
import Header from '../../components/Header';

export default function Dashboard() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for results in session storage
    const storedResults = sessionStorage.getItem('jobRecommendations');
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
      setLoading(false);
    } else {
      setError('No analysis results found. Please upload your resume first.');
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Job Matches</h1>
          <p className="text-gray-600 mt-2">
            Based on your resume and skills, here are the best opportunities for you
          </p>
        </div>
        
        <JobList jobs={results} />
      </main>
    </div>
  );
}