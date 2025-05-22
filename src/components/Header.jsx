"use client";

import { useState } from 'react';
import {
    BriefcaseIcon,
    LightBulbIcon,
    Bars3Icon as MenuIcon,
    XMarkIcon as XIcon,
  } from '@heroicons/react/24/outline';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0">
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Apply<span className="text-blue-600">AI</span></span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Home
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Saved Jobs
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Profile
            </a>
          </nav>
          
          {/* Pro Badge & Mobile Menu Button */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 mr-4">
              <LightBulbIcon className="h-4 w-4 mr-1" />
              <span className="text-xs font-semibold">AI Powered</span>
            </div>
            
            <button 
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hidden md:block"
            >
              Upload Resume
            </button>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden bg-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
            {mobileMenuOpen ? (
                <XIcon className="h-6 w-6 text-gray-600" />
                ) : (
                <MenuIcon className="h-6 w-6 text-gray-600" />
                )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-50">
              Home
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">
              Dashboard
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">
              Saved Jobs
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">
              Profile
            </a>
            <div className="pt-2">
              <button 
                type="button"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;