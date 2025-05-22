'use client';
import JobCard from './JobCard';

export default function JobList({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No job matches found. Try adjusting your skills or resume.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, index) => (
        <JobCard 
          key={index} 
          job={job} 
          className="transition-all hover:scale-[1.02] hover:shadow-lg" 
        />
      ))}
    </div>
  );
}