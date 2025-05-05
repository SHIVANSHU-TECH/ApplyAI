// lib/job-data.js

import fs from 'fs/promises';
import path from 'path';

export async function getJobData() {
  try {
    // Read local JSON file from the public directory
    const filePath = path.join(process.cwd(), 'public', 'sample-jobs.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to fetch job data:', error);
    // Fallback to hardcoded data if file read fails
    return [
      {
        id: 'job1',
        title: 'Senior React Developer',
        company: 'Tech Innovations Inc.',
        location: 'Remote',
        description: 'Looking for an experienced React developer to lead our frontend team.',
        requirements: ['5+ years React', 'JavaScript expertise', 'Team leadership'],
        skills: ['React', 'JavaScript', 'Redux', 'CSS']
      },
      {
        id: 'job2',
        title: 'Full Stack Engineer',
        company: 'Web Solutions LLC',
        location: 'New York, NY',
        description: 'Full stack role working with modern JavaScript frameworks.',
        requirements: ['3+ years experience', 'Node.js and React', 'AWS knowledge'],
        skills: ['JavaScript', 'Node.js', 'React', 'AWS']
      }
    ];
  }
}
