import * as mammoth from 'mammoth';
import * as Papa from 'papaparse';
import _ from 'lodash';

/**
 * Parse resume file and extract text content based on file type
 * @param {File|Blob} file - The uploaded resume file
 * @returns {Promise<Object|string>} - Parsed resume data with structured information or raw text
 */
export async function parseResume(file) {
  try {
    // Check if running in browser or server environment
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Server-side implementation (simpler, just extract text)
      return await extractTextFromFileServer(file);
    } else {
      // Client-side implementation (full parsing)
      return await parseResumeClient(file);
    }
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Server-side file handling - simpler approach that just returns text
 * @param {File|Blob} file - The uploaded file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromFileServer(file) {
  // For server, just return file content as text
  // More advanced parsing can be done client-side
  try {
    // Check if we have a Buffer (Node.js) or a Blob/File (browser)
    if (file instanceof Buffer) {
      // Handle buffer directly
      return file.toString('utf-8');
    } else if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
      // Handle file with arrayBuffer method
      const buffer = await file.arrayBuffer();
      
      // Get file extension if available
      let fileName = file.name || '';
      const fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      
      if (fileType === 'docx') {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: buffer });
          return result.value;
        } catch (e) {
          console.error("DOCX parsing error:", e);
          return "Error extracting text from DOCX file.";
        }
      } else if (fileType === 'csv') {
        // For CSV, convert to text
        const text = new TextDecoder().decode(buffer);
        const results = Papa.parse(text, { header: false });
        return results.data
          .map(row => row.filter(cell => cell && cell.trim() !== '').join(' '))
          .filter(line => line.trim() !== '')
          .join('\n');
      } else {
        // For PDF and TXT, just get text content
        return new TextDecoder().decode(buffer);
      }
    } else if (typeof file === 'string') {
      // Already a string
      return file;
    } else {
      throw new Error("Unsupported file type or format");
    }
  } catch (error) {
    console.error("Server-side file processing error:", error);
    return "Error extracting text from file: " + error.message;
  }
}

/**
 * Client-side full resume parsing (original implementation)
 * @param {File} file - The uploaded resume file
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResumeClient(file) {
  // Get file extension to determine appropriate parser
  const fileName = file.name.toLowerCase();
  const fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
  
  // Extract raw text based on file type
  let rawText = '';
  
  if (fileType === 'pdf') {
    rawText = await extractTextFromPDF(file);
  } else if (fileType === 'docx') {
    rawText = await extractTextFromDOCX(file);
  } else if (fileType === 'txt') {
    rawText = await extractTextFromTXT(file);
  } else if (fileType === 'csv') {
    rawText = await extractTextFromCSV(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF, DOCX, TXT, or CSV file.`);
  }
  
  // Parse the raw text to extract structured information
  const parsedData = extractStructuredData(rawText);
  
  return parsedData;
}

/**
 * Extract text from PDF file
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string>} - Extracted text content
 */
function extractTextFromPDF(file) {
  // In a production app, you would use a PDF parsing library
  // For this demo, we'll simulate reading a PDF
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate PDF text extraction
      // In a production app, you would use a proper PDF parser here
      setTimeout(() => {
        resolve("This is simulated text extracted from a PDF file.");
      }, 1000);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from DOCX file using mammoth
 * @param {File} file - The uploaded DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
function extractTextFromDOCX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(new Error(`DOCX parsing failed: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read DOCX file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from TXT file
 * @param {File} file - The uploaded TXT file
 * @returns {Promise<string>} - Extracted text content
 */
function extractTextFromTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read TXT file'));
    reader.readAsText(file);
  });
}

/**
 * Extract text from CSV file using PapaParse
 * @param {File} file - The uploaded CSV file
 * @returns {Promise<string>} - Extracted text content
 */
function extractTextFromCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }
        
        // Convert CSV data to text
        const textData = results.data
          .map(row => row.filter(cell => cell && cell.trim() !== '').join(' '))
          .filter(line => line.trim() !== '')
          .join('\n');
        
        resolve(textData);
      },
      error: (error) => reject(new Error(`CSV parsing failed: ${error.message}`)),
      skipEmptyLines: true,
    });
  });
}

/**
 * Extract structured data from raw text
 * @param {string} text - Raw text extracted from resume
 * @returns {Object} - Structured resume data
 */
function extractStructuredData(text) {
  // This is a simple pattern-matching approach
  // In a production app, you might use NLP or ML for better extraction
  
  // Clean and normalize text
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
  
  // Extract basic sections
  const sections = {
    contactInfo: extractContactInfo(cleanText),
    skills: extractSkills(cleanText),
    experience: extractExperience(cleanText),
    education: extractEducation(cleanText),
    summary: extractSummary(cleanText)
  };
  
  // Group all extracted information
  return {
    rawText: text,
    ...sections
  };
}

/**
 * Extract contact information from resume text
 * @param {string} text - Resume text
 * @returns {Object} - Contact information
 */
function extractContactInfo(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/;
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/;
  
  // Try to find name (usually at the beginning)
  const firstLines = text.split('\n').slice(0, 5);
  const nameLine = firstLines.find(line => 
    !line.match(emailRegex) && 
    !line.match(phoneRegex) && 
    line.length > 2 && 
    line.length < 50
  ) || '';
  
  return {
    name: nameLine.trim(),
    email: (text.match(emailRegex) || [''])[0],
    phone: (text.match(phoneRegex) || [''])[0],
    linkedin: (text.match(linkedinRegex) || ['',""])[1],
  };
}

/**
 * Extract skills from resume text
 * @param {string} text - Resume text
 * @returns {Array} - List of skills
 */
/**
 * Extract skills from resume text
 * @param {string} text - Resume text
 * @returns {Array} - List of skills
 */
function extractSkills(text) {
  // Look for skills section
  const skillsSection = text.match(/skills:?\s*([\s\S]*?)(?:$|education|experience|employment|certification)/i);
  
  if (skillsSection && skillsSection[1]) {
    // Clean up and split skills
    return skillsSection[1]
      .split(/[,\n•]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 50);
  }
  
  // Fallback: look for common technical skills throughout the text
  const commonSkills = [
    "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask",
    "HTML", "CSS", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "CI/CD",
    "Agile", "Scrum", "Project Management", "Communication", "Leadership"
  ];
  
  // Escape special regex characters in skills before creating the pattern
  return commonSkills.filter(skill => {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`\\b${escapedSkill}\\b`, 'i').test(text);
  });
}

/**
 * Extract work experience from resume text
 * @param {string} text - Resume text
 * @returns {Array} - List of work experiences
 */
function extractExperience(text) {
  // Look for experience section
  const experienceSection = text.match(/experience:?\s*([\s\S]*?)(?:$|education|skills|certification)/i);
  
  if (!experienceSection || !experienceSection[1]) {
    return [];
  }
  
  const experienceText = experienceSection[1];
  
  // Split by date patterns or bullets to identify different positions
  const jobEntries = experienceText.split(/\d{4}[-–—](?:\d{4}|present|current)/i);
  
  return jobEntries
    .map(entry => entry.trim())
    .filter(entry => entry.length > 10)
    .map(entry => {
      // Try to extract company and title
      const lines = entry.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) return null;
      
      const firstLine = lines[0];
      let company = '';
      let title = firstLine;
      
      // Look for "at" or similar patterns to separate title from company
      if (firstLine.includes(' at ')) {
        [title, company] = firstLine.split(' at ').map(s => s.trim());
      }
      
      // Description is everything else
      const description = lines.slice(1).join('\n');
      
      return { title, company, description };
    })
    .filter(Boolean);
}

/**
 * Extract education information from resume text
 * @param {string} text - Resume text
 * @returns {Array} - List of education entries
 */
function extractEducation(text) {
  // Look for education section
  const educationSection = text.match(/education:?\s*([\s\S]*?)(?:$|experience|skills|certification)/i);
  
  if (!educationSection || !educationSection[1]) {
    return [];
  }
  
  const educationText = educationSection[1];
  
  // Split by date patterns or bullets to identify different degrees
  const eduEntries = educationText.split(/\d{4}[-–—](?:\d{4}|present|current)/i);
  
  return eduEntries
    .map(entry => entry.trim())
    .filter(entry => entry.length > 10)
    .map(entry => {
      const lines = entry.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) return null;
      
      let degree = '';
      let institution = lines[0];
      
      // Look for common degree abbreviations
      const degreeMatch = entry.match(/\b(BS|BA|MS|MA|PhD|B\.S\.|B\.A\.|M\.S\.|M\.A\.|Ph\.D\.)\b/i);
      if (degreeMatch) {
        degree = degreeMatch[0];
      }
      
      return { degree, institution };
    })
    .filter(Boolean);
}

/**
 * Extract summary or objective from resume text
 * @param {string} text - Resume text
 * @returns {string} - Summary text
 */
function extractSummary(text) {
  // Look for summary section
  const summarySection = text.match(/(?:summary|objective|profile):?\s*([\s\S]*?)(?:$|experience|skills|education)/i);
  
  if (summarySection && summarySection[1]) {
    return summarySection[1].trim();
  }
  
  // If no explicit summary, use first paragraph that's not contact info
  const paragraphs = text.split('\n\n');
  for (const paragraph of paragraphs) {
    if (paragraph.length > 50 && !paragraph.match(/email|phone|address/i)) {
      return paragraph.trim();
    }
  }
  
  return '';
}

/**
 * Get the top keywords from a resume for job matching
 * @param {Object|string} parsedResume - Parsed resume data or raw text
 * @returns {Array} - List of top keywords
 */
export function extractKeywords(parsedResume) {
  // Handle raw text input (server-side mode)
  if (typeof parsedResume === 'string') {
    const text = parsedResume;
    // Basic keyword extraction from raw text
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    
    // Count word frequency
    const wordCounts = _.countBy(words);
    
    // Filter out common stop words
    const stopWords = ['and', 'the', 'for', 'with', 'was', 'were', 'that', 'this', 'have', 'from'];
    Object.keys(wordCounts).forEach(word => {
      if (stopWords.includes(word)) {
        delete wordCounts[word];
      }
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(entry => entry[0]);
  }
  
  // Handle structured data input (client-side mode)
  // Combine skills with key terms from experience and education
  const allText = [
    ...(parsedResume.skills || []),
    ...((parsedResume.experience || []).map(exp => `${exp.title} ${exp.company} ${exp.description}`).join(' ')),
    ...((parsedResume.education || []).map(edu => `${edu.degree} ${edu.institution}`).join(' '))
  ].join(' ');
  
  // Use basic keyword extraction
  const words = allText.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  
  // Count word frequency
  const wordCounts = _.countBy(words);
  
  // Filter out common stop words
  const stopWords = ['and', 'the', 'for', 'with', 'was', 'were', 'that', 'this', 'have', 'from'];
  Object.keys(wordCounts).forEach(word => {
    if (stopWords.includes(word)) {
      delete wordCounts[word];
    }
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);
}

/**
 * Format parsed resume data for API submission
 * @param {Object|string} parsedResume - Parsed resume data or raw text
 * @returns {Object} - Formatted data for job matching
 */
export function formatResumeForJobMatching(parsedResume) {
  // Handle raw text (server-side mode)
  if (typeof parsedResume === 'string') {
    // Extract keywords from raw text
    const keywords = extractKeywords(parsedResume);
    
    return {
      rawText: parsedResume,
      keywords: keywords
    };
  }
  
  // Handle structured data (client-side mode)
  return {
    name: parsedResume.contactInfo?.name || '',
    skills: parsedResume.skills || [],
    keywords: extractKeywords(parsedResume),
    experience: (parsedResume.experience || []).map(exp => ({
      title: exp.title,
      company: exp.company,
      highlights: exp.description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
    })),
    education: parsedResume.education || [],
    summary: parsedResume.summary || ''
  };
}