// app/api/analyze/route.js
export const dynamic = 'force-dynamic';

import { Gemini } from '../../../lib/gemini';
import { parseResume, extractKeywords } from '../../../lib/resume-parser';
import { getJobData } from '../../../lib/job-data';

export async function POST(request) {
  console.log('\n--- New API Request ---');
  
  try {
    // Input processing
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    
    let input = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      input = {
        resume: formData.get('resume'),
        skills: formData.get('skills') || ''
      };
      console.log('Form data received - resume present:', !!input.resume);
      console.log('Skills:', input.skills);
    } else {
      try {
        input = await request.json();
      } catch (e) {
        console.error('JSON Parse Error:', e);
        return Response.json(
          { success: false, error: 'Invalid JSON input' },
          { status: 400 }
        );
      }
    }
    
    // Validate input
    if (!input.resume && !input.skills) {
      return Response.json(
        { success: false, error: 'No resume or skills provided' },
        { status: 400 }
      );
    }
    
    // Process resume
    let resumeText = '';
    let keywords = [];
    
    if (input.resume) {
      if (input.resume instanceof Blob || input.resume instanceof File) {
        // Parse the resume to extract text
        resumeText = await parseResume(input.resume);
        
        // Extract keywords (if resumeText is an object, extractKeywords will handle it correctly)
        keywords = extractKeywords(resumeText);
        
        // If parseResume returned an object instead of a string, get raw text
        if (typeof resumeText === 'object' && resumeText !== null) {
          resumeText = resumeText.rawText || '';
        }
      } else {
        // Resume was provided as a string directly
        resumeText = String(input.resume);
        keywords = extractKeywords(resumeText);
      }
    }
    
    // Get job data
    const jobs = await getJobData();
    if (!jobs?.length) {
      return Response.json(
        { success: false, error: 'No job data available' },
        { status: 404 }
      );
    }
    
    // Call Gemini
    const gemini = new Gemini();
    const userInput = `${resumeText}${input.skills ? `\nSkills: ${input.skills}` : ''}`;
    console.log('User Input preview:', userInput.substring(0, 100) + '...');
    console.log('Keywords extracted:', keywords.join(', '));
    
    const analysis = await gemini.analyzeJobMatches(userInput, jobs, keywords);
    console.log('Analysis Results:', analysis.length, 'jobs found');
    
    return Response.json({
      success: true,
      recommendations: analysis
    });
  } catch (error) {
    console.error('\n!!! API ERROR !!!\n', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        })
      },
      { status: error.message.includes('404') ? 404 : 500 }
    );
  }
}