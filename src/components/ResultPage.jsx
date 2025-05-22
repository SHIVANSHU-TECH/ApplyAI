"use client";

import { useState, useEffect } from 'react';
import { 
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ArrowUpDown as SortAscendingIcon,
  BarChart2 as ChartBarIcon,
  Briefcase as BriefcaseIcon,
  Zap as LightningBoltIcon
} from 'lucide-react';

// Import the JobCard component
import JobCard from '../components/JobCard';
import TopMatches from '../components/TopMatches';

const ResultPage = ({ recommendations, onBack }) => {
  const jobs = recommendations || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('top'); // 'top' or 'all'
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    location: '',
    jobType: 'all',
    sortBy: 'match'
  });

  // Summary stats
  const topMatchScore = jobs?.length > 0 ? Math.max(...jobs.map(job => job.matchScore)) : 0;
  const averageMatchScore = jobs?.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / jobs.length) : 0;
  const strongMatchesCount = jobs?.filter(job => job.matchScore >= 70).length || 0;

  useEffect(() => {
    if (!jobs || !jobs.length) return;
    
    let results = [...jobs];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(job => 
        (job.title && job.title.toLowerCase().includes(term)) || 
        (job.company && job.company.toLowerCase().includes(term)) ||
        (job.description && job.description.toLowerCase().includes(term)) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(term))) ||
        (job.reasons && job.reasons.some(reason => reason.toLowerCase().includes(term)))
      );
    }
    
    // Filter by match score
    if (filters.minMatchScore > 0) {
      results = results.filter(job => job.matchScore >= filters.minMatchScore);
    }
    
    // Filter by location
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      results = results.filter(job => 
        job.location && job.location.toLowerCase().includes(locationTerm)
      );
    }
    
    // Filter by job type
    if (filters.jobType !== 'all') {
      results = results.filter(job => 
        job.employmentType && job.employmentType.toLowerCase() === filters.jobType.toLowerCase()
      );
    }
    
    // Sort results
    switch (filters.sortBy) {
      case 'match':
        results.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'date':
        results.sort((a, b) => {
          if (a.postedDate && b.postedDate) {
            return new Date(b.postedDate) - new Date(a.postedDate);
          }
          return 0;
        });
        break;
      case 'company':
        results.sort((a, b) => {
          if (a.company && b.company) {
            return a.company.localeCompare(b.company);
          }
          return 0;
        });
        break;
      default:
        results.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    setFilteredJobs(results);
  }, [jobs, searchTerm, filters]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with summary stats */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Job Matches</h1>
                <p className="text-gray-600">
                  {filteredJobs.length} matches found {strongMatchesCount > 0 && `(${strongMatchesCount} strong matches)`}
                </p>
              </div>
            </div>
            
            <div className="flex mt-4 md:mt-0 w-full md:w-auto">
              <div className="grid grid-cols-2 gap-4 w-full md:flex">
                <div className="bg-white rounded-lg border p-3 text-center">
                  <div className="text-sm text-gray-600">Top Match</div>
                  <div className="font-bold text-lg text-blue-600">{topMatchScore}%</div>
                </div>
                <div className="bg-white rounded-lg border p-3 text-center">
                  <div className="text-sm text-gray-600">Avg Match</div>
                  <div className="font-bold text-lg text-green-600">{averageMatchScore}%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* View mode toggle */}
          <div className="flex mb-4">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md ${viewMode === 'top' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                onClick={() => setViewMode('top')}
              >
                <div className="flex items-center">
                  <LightningBoltIcon className="h-4 w-4 mr-1" />
                  <span>Top Matches</span>
                </div>
              </button>
              <button
                className={`px-4 py-2 rounded-md ${viewMode === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                onClick={() => setViewMode('all')}
              >
                <div className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                  <span>All Jobs</span>
                </div>
              </button>
            </div>
          </div>
          
          {viewMode === 'all' && (
            <>
              {/* Search and filter bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search jobs by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <button
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterIcon className="h-5 w-5 mr-2" />
                  Filters
                </button>
                
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="match">Sort by Match</option>
                  <option value="date">Sort by Date</option>
                  <option value="company">Sort by Company</option>
                </select>
              </div>
              
              {/* Expanded filters */}
              {showFilters && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Filter Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Match Score
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="w-full"
                          value={filters.minMatchScore}
                          onChange={(e) => handleFilterChange('minMatchScore', parseInt(e.target.value))}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {filters.minMatchScore}%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City, state, or remote"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Type
                      </label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={filters.jobType}
                        onChange={(e) => handleFilterChange('jobType', e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Content area */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {viewMode === 'top' ? (
          <TopMatches recommendations={jobs} />
        ) : (
          <>
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job, index) => (
                  <JobCard key={job.jobId || index} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BriefcaseIcon className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No matches found</h3>
                <p className="mt-2 text-gray-600">
                  Try adjusting your filters or adding more skills to your profile.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultPage;