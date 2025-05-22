"use client";

import { useState, useRef, useEffect } from 'react';
import { XIcon, PlusCircleIcon } from '@heroicons/react/solid';

const SkillInput = ({ onSkillsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Common skills for suggestions
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS',
    'SQL', 'TypeScript', 'Docker', 'AWS', 'Git', 'Redux', 'Vue.js',
    'Angular', 'MongoDB', 'Express', 'PHP', 'Swift', 'Kotlin', 'C#',
    'C++', 'Ruby', 'Django', 'Flask', 'Spring Boot', 'GraphQL', 'REST API',
    'Azure', 'Firebase', 'Data Science', 'Machine Learning', 'AI', 'DevOps',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Product Management', 'Agile', 'Scrum'
  ];

  useEffect(() => {
    // Filter suggestions based on input
    if (inputValue.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(inputValue.toLowerCase()) && 
        !skills.includes(skill)
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, skills]);

  useEffect(() => {
    // Notify parent component when skills change
    if (onSkillsChange) {
      onSkillsChange(skills);
    }
  }, [skills, onSkillsChange]);

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const newSkills = [...skills, trimmedSkill];
      setSkills(newSkills);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addSkill(suggestion);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Enter Your Skills</h2>
      <p className="text-sm text-gray-600 mb-4">
        Add key skills to help us find matching job opportunities.
      </p>

      <div className="relative">
        <div 
          className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
          onClick={() => inputRef.current?.focus()}
        >
          {skills.map((skill, index) => (
            <div 
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
            >
              <span>{skill}</span>
              <button 
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full outline-none min-w-[120px] bg-transparent"
              placeholder={skills.length === 0 ? "Type skills and press Enter" : ""}
            />
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <PlusCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add some common skills buttons */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
        <div className="flex flex-wrap gap-2">
          {['JavaScript', 'React', 'Python', 'SQL', 'AWS']
            .filter(skill => !skills.includes(skill))
            .map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                + {skill}
              </button>
            ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Press Enter after each skill or click on suggestions.
        </p>
      </div>
    </div>
  );
};

export default SkillInput;