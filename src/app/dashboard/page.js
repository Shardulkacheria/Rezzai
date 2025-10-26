'use client';

import { useState, useEffect, useCallback } from 'react';
import Protected from '@/components/Protected';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import JobDetailModal from '@/components/JobDetailModal';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { applyToJobWithExtension, isExtensionAvailable, testExtensionConnection } from '@/lib/extensionBridge';

// Job Card Component
function JobCard({ job, matchLevel, onApply, onJobClick, userProfile }) {
  const { theme } = useTheme();
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setExtensionAvailable(isExtensionAvailable());
  }, []);

  const handleLinkedInApply = async (e) => {
    e.stopPropagation();
    setApplying(true);
    
    try {
      const success = await applyToJobWithExtension(job, userProfile, 'default-resume.docx');
      if (success) {
        // Create application record
        await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userProfile?.userId || 'unknown',
            jobId: job.id,
            company: job.company,
            jobTitle: job.title,
            resumeUsed: 'Default Resume',
            status: 'Applied',
            jobUrl: job.applicationUrl
          }),
        });
      }
    } catch (error) {
      console.error('Error applying to LinkedIn job:', error);
    } finally {
      setApplying(false);
    }
  };
  
  const getMatchBadgeColor = (level) => {
    if (theme === 'light') {
      switch (level) {
        case 'high': return 'bg-green-100 border-green-300 text-green-700';
        case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
        case 'low': return 'bg-blue-100 border-blue-300 text-blue-700';
        default: return 'bg-gray-100 border-gray-300 text-gray-700';
      }
    } else {
      switch (level) {
        case 'high': return 'bg-green-500/20 border-green-500/50 text-green-300';
        case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
        case 'low': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
        default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      }
    }
  };

  const getCardClasses = () => {
    const baseClasses = "backdrop-blur-lg rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer";
    if (theme === 'light') {
      return `${baseClasses} bg-white/80 border border-gray-200/50 shadow-lg hover:bg-white/90 ${
        matchLevel === 'high' ? 'ring-2 ring-green-500/30' : 
        matchLevel === 'medium' ? 'ring-2 ring-yellow-500/30' : ''
      }`;
    }
    return `${baseClasses} bg-white/10 border border-white/20 hover:bg-white/15 ${
      matchLevel === 'high' ? 'ring-2 ring-green-500/30' : 
      matchLevel === 'medium' ? 'ring-2 ring-yellow-500/30' : ''
    }`;
  };

  const getTextClasses = () => {
    if (theme === 'light') {
      return {
        primary: "text-gray-900",
        secondary: "text-gray-600",
        muted: "text-gray-500",
        accent: "text-blue-600"
      };
    }
    return {
      primary: "text-white",
      secondary: "text-white/80",
      muted: "text-white/60",
      accent: "text-purple-400"
    };
  };

  const textClasses = getTextClasses();

  const getLocationMatchIcon = (locationMatch) => {
    switch (locationMatch) {
      case 'exact_city': return '🏠';
      case 'state_country': return '🗺️';
      case 'partial': return '📍';
      case 'remote': return '🏠';
      case 'same_region': return '🌎';
      default: return '🌍';
    }
  };

  const getLocationMatchText = (locationMatch) => {
    switch (locationMatch) {
      case 'exact_city': return 'Exact City Match';
      case 'state_country': return 'State/Country Match';
      case 'partial': return 'Partial Location Match';
      case 'remote': return 'Remote Work';
      case 'same_region': return 'Same Region';
      default: return 'Location Available';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={getCardClasses()}
      onClick={() => onJobClick(job)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {job.companyLogo && (
              <img 
                src={job.companyLogo} 
                alt={`${job.company} logo`}
                className="w-16 h-16 rounded-xl object-cover bg-white/10 border border-white/20"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className={`text-lg sm:text-xl font-bold ${textClasses.primary}`}>{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMatchBadgeColor(matchLevel)}`}>
                  {matchLevel === 'high' ? '🎯 High Match' : 
                   matchLevel === 'medium' ? '⭐ Good Match' : '💼 Opportunity'}
                </span>
              </div>
              <p className={`${textClasses.accent} font-semibold mb-2`}>{job.company}</p>
              
              <div className={`flex flex-wrap items-center gap-2 sm:gap-4 text-sm ${textClasses.secondary} mb-2`}>
                <span className="flex items-center gap-1">
                  {getLocationMatchIcon(job.locationMatch)}
                  {job.location}
                </span>
                <span>•</span>
                <span>{job.type}</span>
                <span>•</span>
                <span>{job.salary}</span>
              </div>
              
              <div className={`flex flex-wrap items-center gap-2 text-xs ${textClasses.muted} mb-2`}>
                <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {getLocationMatchIcon(job.locationMatch)}
                  {getLocationMatchText(job.locationMatch)}
                </span>
                {job.locationScore > 0 && (
                  <>
                    <span>•</span>
                    <span className={theme === 'light' ? 'text-green-600' : 'text-green-300'}>
                      📍 Location Match: {job.locationScore}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {extensionAvailable && (
            <button
              onClick={handleLinkedInApply}
              disabled={applying}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {applying ? 'Applying...' : 'Apply on LinkedIn'}
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
            }}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
              matchLevel === 'high' 
                ? theme === 'light'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                : matchLevel === 'medium'
                ? theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                : theme === 'light'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            Apply Now
          </button>
        </div>
      </div>
      
      {job.description && (
        <p className={`${textClasses.secondary} mb-4 line-clamp-2 text-sm`}>{job.description}</p>
      )}
      
      {job.requirements && job.requirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.requirements.slice(0, 6).map((req, index) => (
            <span 
              key={index} 
              className={`rounded-lg px-3 py-1 text-xs ${
                theme === 'light'
                  ? 'bg-gray-100 border border-gray-200 text-gray-700'
                  : 'bg-white/10 border border-white/20 text-white/80'
              }`}
            >
              {req}
            </span>
          ))}
          {job.requirements.length > 6 && (
            <span className={`${textClasses.muted} text-xs`}>+{job.requirements.length - 6} more</span>
          )}
        </div>
      )}
      
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm ${textClasses.muted} pt-4 border-t ${
        theme === 'light' ? 'border-gray-200' : 'border-white/10'
      }`}>
        <span>Job ID: {job.id}</span>
        <a 
          href={job.applicationUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${textClasses.accent} hover:opacity-80 transition-colors flex items-center gap-1`}
        >
          View on LinkedIn →
        </a>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { profile, logout } = useAuth();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJobRole, setSearchJobRole] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Debounced search function
  const debouncedFetchJobs = useCallback(
    (() => {
      let timeoutId;
      return (location, jobRole) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          setSearching(true);
          try {
            const params = new URLSearchParams({
              page: '1'
            });
            
            if (location) {
              params.append('location', location);
            }
            
            if (jobRole) {
              params.append('what', jobRole);
            }
            
            const res = await fetch(`/api/jobs?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
              setJobs(data.jobs || []);
              setError('');
            } else {
              setError(data.error || 'Failed to fetch jobs');
              setJobs([]);
            }
          } catch (e) {
            setError('Failed to fetch jobs. Please try again.');
            setJobs([]);
          } finally {
            setLoading(false);
            setSearching(false);
          }
        }, 800); // 800ms debounce
      };
    })(),
    []
  );

  useEffect(() => {
    if (profile) {
      const location = searchLocation || profile?.location || '';
      const jobRole = searchJobRole || '';
      debouncedFetchJobs(location, jobRole);
    }
  }, [profile, searchLocation, searchJobRole, debouncedFetchJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleApply = (job, method = 'existing', generatedResume = null) => {
    if (method === 'generated' && generatedResume) {
      // TODO: Implement auto-apply with generated resume
      console.log('Applying with generated resume:', generatedResume);
    }
    // For now, open the job URL
    window.open(job.applicationUrl, '_blank');
  };

  const handleCloseModal = () => {
    setIsJobModalOpen(false);
    setSelectedJob(null);
  };

  const getThemeClasses = () => {
    const baseClasses = "min-h-screen transition-all duration-300";
    if (theme === 'light') {
      return `${baseClasses} bg-gradient-to-br from-sky-200 via-blue-50 to-white`;
    }
    return `${baseClasses} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`;
  };

  const getCardClasses = () => {
    if (theme === 'light') {
      return "bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg";
    }
    return "bg-white/10 backdrop-blur-lg border border-white/20";
  };

  const getTextClasses = () => {
    if (theme === 'light') {
      return {
        primary: "text-gray-900",
        secondary: "text-gray-600",
        muted: "text-gray-500",
        accent: "text-blue-600"
      };
    }
    return {
      primary: "text-white",
      secondary: "text-white/80",
      muted: "text-white/60",
      accent: "text-purple-400"
    };
  };

  const textClasses = getTextClasses();

  return (
    <Protected>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={getThemeClasses()}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <div className="flex-1">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textClasses.primary} mb-2`}>
                Dashboard
              </h1>
              <p className={`${textClasses.secondary} text-sm sm:text-base`}>
                Welcome back! Here are job opportunities matching your skills.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/profile"
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-center text-sm sm:text-base ${
                  theme === 'light'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                My Profile
              </Link>
              <Link
                href="/dashboard/applications"
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-center text-sm sm:text-base ${
                  theme === 'light'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Applications
              </Link>
              <button
                onClick={async () => {
                  const result = await testExtensionConnection();
                  console.log('Extension test result:', result);
                  alert(`Extension test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.error || 'No errors'}`);
                }}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-center text-sm sm:text-base ${
                  theme === 'light'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Test Extension
              </button>
              <ThemeToggle />
              <button
                onClick={logout}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-center text-sm sm:text-base ${
                  theme === 'light'
                    ? 'border border-red-300 text-red-600 hover:bg-red-50'
                    : 'border border-red-300/50 text-red-300 hover:bg-red-500/20'
                }`}
              >
                Logout
              </button>
            </div>
          </motion.div>

          {/* Profile Summary */}
          {profile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${getCardClasses()} rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8`}
            >
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${textClasses.primary} mb-3 sm:mb-4`}>
                Your Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <h3 className={`text-sm sm:text-base lg:text-lg font-semibold ${textClasses.accent} mb-1 sm:mb-2`}>
                    Basic Info
                  </h3>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm`}>{profile.fullName || 'Not provided'}</p>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm break-all`}>{profile.email || 'Not provided'}</p>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm`}>{profile.location || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base lg:text-lg font-semibold ${textClasses.accent} mb-1 sm:mb-2`}>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {profile.skills?.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index} 
                        className={`px-2 py-1 rounded-lg text-xs sm:text-sm ${
                          theme === 'light'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills?.length > 5 && (
                      <span className={`text-xs sm:text-sm ${textClasses.muted}`}>
                        +{profile.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base lg:text-lg font-semibold ${textClasses.accent} mb-1 sm:mb-2`}>
                    Experience
                  </h3>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm`}>{profile.experience?.length || 0} positions</p>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm`}>{profile.education?.length || 0} education entries</p>
                  <p className={`${textClasses.secondary} text-xs sm:text-sm`}>{profile.projects?.length || 0} projects</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Job Postings */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textClasses.primary}`}>
                Job Opportunities
              </h2>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`${textClasses.secondary} text-xs sm:text-sm`}>
                  📍 Showing jobs near <span className={`${textClasses.accent} font-semibold`}>
                    {searchLocation || profile?.location || 'your location'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${getCardClasses()} rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block ${textClasses.secondary} text-xs sm:text-sm font-medium mb-1 sm:mb-2`}>
                    Location:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., New York, NY or Mumbai"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      theme === 'light'
                        ? 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none'
                        : 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block ${textClasses.secondary} text-xs sm:text-sm font-medium mb-1 sm:mb-2`}>
                    Job Role (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Python Developer, Marketing Manager"
                    value={searchJobRole}
                    onChange={(e) => setSearchJobRole(e.target.value)}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      theme === 'light'
                        ? 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none'
                        : 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none'
                    }`}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSearchLocation('');
                      setSearchJobRole('');
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      theme === 'light'
                        ? 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30'
                    }`}
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setSearchLocation(profile?.location || '')}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      theme === 'light'
                        ? 'bg-blue-100 border border-blue-300 text-blue-700 hover:bg-blue-200'
                        : 'bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30'
                    }`}
                  >
                    Use My Location
                  </button>
                </div>
                {searching && (
                  <div className={`flex items-center gap-2 ${textClasses.muted}`}>
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${textClasses.accent}`}></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${textClasses.accent} mx-auto mb-4`}></div>
                  <p className={textClasses.secondary}>Loading job opportunities...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`${
                    theme === 'light' 
                      ? 'bg-red-100 border border-red-300 text-red-700' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-200'
                  } rounded-lg p-6 text-center`}
                >
                  <p>{error}</p>
                </motion.div>
              ) : jobs.length === 0 ? (
                <motion.div 
                  key="no-jobs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`${getCardClasses()} rounded-2xl p-8 text-center`}
                >
                  <p className={`${textClasses.secondary} text-lg`}>No job opportunities found.</p>
                  <p className={`${textClasses.muted} mt-2`}>Try adjusting your location or job role filters.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* High Match Jobs - Perfect Location */}
                  {jobs.filter(job => job.isHighMatch).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className={`text-lg sm:text-xl font-bold ${
                        theme === 'light' ? 'text-green-600' : 'text-green-400'
                      } mb-4 flex items-center gap-2`}>
                        🏠 Perfect Location Match ({jobs.filter(job => job.isHighMatch).length})
                      </h3>
                      <p className={`${textClasses.muted} text-sm mb-4`}>
                        Jobs in your exact city, state, or remote opportunities
                      </p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isHighMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="high" onApply={handleApply} onJobClick={handleJobClick} userProfile={profile} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Medium Match Jobs */}
                  {jobs.filter(job => job.isMediumMatch).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className={`text-lg sm:text-xl font-bold ${
                        theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                      } mb-4 flex items-center gap-2`}>
                        🗺️ Good Location Match ({jobs.filter(job => job.isMediumMatch).length})
                      </h3>
                      <p className={`${textClasses.muted} text-sm mb-4`}>
                        Jobs in your region or nearby areas
                      </p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isMediumMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="medium" onApply={handleApply} onJobClick={handleJobClick} userProfile={profile} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Other Jobs */}
                  {jobs.filter(job => job.isLowMatch).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className={`text-lg sm:text-xl font-bold ${
                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      } mb-4 flex items-center gap-2`}>
                        🌍 Other Locations ({jobs.filter(job => job.isLowMatch).length})
                      </h3>
                      <p className={`${textClasses.muted} text-sm mb-4`}>
                        Jobs from other locations that might interest you
                      </p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isLowMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="low" onApply={handleApply} onJobClick={handleJobClick} userProfile={profile} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isJobModalOpen}
        onClose={handleCloseModal}
        onApply={handleApply}
        userProfile={profile}
      />
    </Protected>
  );
}


