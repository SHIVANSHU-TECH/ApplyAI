// lib/gemini.js

export class Gemini {
  constructor() {
    this.apiKey = "AIzaSyDTxZEqKVDv44sXlbEpo42g6Spez-JE5qQ";

    // Flash model for high speed and large input
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async analyzeJobMatches(userInput, jobs) {
    if (!this.apiKey) {
      console.error('API Error: Missing Gemini API key');
      throw new Error('API configuration error - check server logs');
    }

    const prompt = this.createPrompt(userInput, jobs);
    console.log('Prompt length (chars):', prompt.length);
    console.log('Approx. token count:', Math.ceil(prompt.length / 4));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // Extended to 30s timeout

    try {
      const apiUrl = `${this.baseUrl}?key=${this.apiKey}`;
      console.log('Making API request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Success - Response received');
      console.log('Raw Response:', JSON.stringify(data).substring(0, 200) + '...');

      // Check for different response structures
      let resultText = null;
      
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        resultText = data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked by Gemini API: ${data.promptFeedback.blockReason}`);
      }

      if (!resultText) {
        console.error('Unexpected API response structure:', JSON.stringify(data));
        throw new Error('No response content from Gemini API - check response structure');
      }

      return this.parseResponse(resultText);
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error('🕒 Gemini API request timed out.');
        throw new Error('Gemini API request timed out');
      }

      console.error('Full API Error:', error);
      throw new Error(`Gemini processing failed: ${error.message}`);
    }
  }

  createPrompt(userInput, jobs) {
    const trimmedInput = userInput.slice(0, 8000);
    const trimmedJobs = JSON.stringify(jobs.slice(0, 10), null, 2); // Keep the job list lean

    return `
      You are an expert career advisor analyzing job matches for a candidate.
      The candidate's resume and skills are:
      ${trimmedInput}

      Here are available job listings in JSON format:
      ${trimmedJobs}

      Analyze these jobs and return:
      1. Match score (0–100%) based on skills, experience, and requirements
      2. 3 key reasons why it's a good match
      3. Any important notes about the match

      Return your analysis as a JSON array with objects containing:
      - jobId: The original job ID string exactly as provided (EXTREMELY IMPORTANT - must match the id field from jobs)
      - matchScore: Percentage match (just the number, no % sign)
      - reasons: Array of 3 strings explaining why this is a good match
      - notes: String or null
      - recommendation: "strong", "moderate", or "weak"

      Format your response to be directly parseable by JSON.parse().
      Only return the JSON array, no other text or markdown formatting.
      
      CRITICAL: Make sure each jobId exactly matches one of the job IDs from the provided listings.
    `;
  }

  parseResponse(content) {
    try {
      // More robust parsing - handle different response formats
      let cleanContent = content.trim();
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Check if the content is wrapped in extra text
      const jsonStartIndex = cleanContent.indexOf('[');
      const jsonEndIndex = cleanContent.lastIndexOf(']');
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        cleanContent = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1);
      }
      
      // Attempt to parse
      const results = JSON.parse(cleanContent);
      
      // Process each result to ensure consistent format
      return results.map(item => {
        // Ensure proper job ID format
        const jobId = item.jobId || '';
        
        // Ensure matchScore is numeric
        let matchScore = typeof item.matchScore === 'string' 
          ? parseInt(item.matchScore.replace('%', ''), 10) 
          : item.matchScore;
        
        // Default to 0 if not a number
        if (isNaN(matchScore)) matchScore = 0;
        
        return {
          jobId: jobId,
          matchScore: matchScore,
          reasons: Array.isArray(item.reasons) ? item.reasons : [],
          notes: item.notes || null,
          recommendation: item.recommendation || 'moderate'
        };
      });
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Response content:', content);
      throw new Error('Failed to parse analysis results - check Gemini response format');
    }
  }
}