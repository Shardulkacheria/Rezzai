'use client';

import { useState, useEffect, useCallback } from 'react';
import Protected from '@/components/Protected';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import JobDetailModal from '@/components/JobDetailModal';

// Job Card Component
function JobCard({ job, matchLevel, onApply, onJobClick }) {
  const getMatchBadgeColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'low': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

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
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer ${
        matchLevel === 'high' ? 'ring-2 ring-green-500/30' : 
        matchLevel === 'medium' ? 'ring-2 ring-yellow-500/30' : ''
      }`}
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
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMatchBadgeColor(matchLevel)}`}>
                  {matchLevel === 'high' ? '🎯 High Match' : 
                   matchLevel === 'medium' ? '⭐ Good Match' : '💼 Opportunity'}
                </span>
              </div>
              <p className="text-purple-400 font-semibold mb-2">{job.company}</p>
              
              <div className="flex items-center gap-4 text-sm text-white/80 mb-2">
                <span className="flex items-center gap-1">
                  {getLocationMatchIcon(job.locationMatch)}
                  {job.location}
                </span>
                <span>•</span>
                <span>{job.type}</span>
                <span>•</span>
                <span>{job.salary}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {getLocationMatchIcon(job.locationMatch)}
                  {getLocationMatchText(job.locationMatch)}
                </span>
                {job.locationScore > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-300">📍 Location Match: {job.locationScore}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply(job);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ml-4 ${
            matchLevel === 'high' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
              : matchLevel === 'medium'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
          }`}
        >
          Apply Now
        </button>
      </div>
      
      {job.description && (
        <p className="text-white/80 mb-4 line-clamp-2 text-sm">{job.description}</p>
      )}
      
      {job.requirements && job.requirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.requirements.slice(0, 6).map((req, index) => (
            <span key={index} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white/80 text-xs">
              {req}
            </span>
          ))}
          {job.requirements.length > 6 && (
            <span className="text-white/60 text-xs">+{job.requirements.length - 6} more</span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/10">
        <span>Job ID: {job.id}</span>
        <a 
          href={job.applicationUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          View on LinkedIn →
        </a>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { profile, logout } = useAuth();
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

  return (
    <Protected>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-white/80">Welcome back! Here are job opportunities matching your skills.</p>
            </div>
            <button
              onClick={logout}
              className="text-white hover:text-red-300 transition-colors px-4 py-2 rounded-lg border border-white/20 hover:border-red-300/50"
            >
              Logout
            </button>
          </motion.div>

          {/* Profile Summary */}
          {profile && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Basic Info</h3>
                  <p className="text-white/80">{profile.fullName || 'Not provided'}</p>
                  <p className="text-white/80">{profile.email || 'Not provided'}</p>
                  <p className="text-white/80">{profile.location || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.slice(0, 5).map((skill, index) => (
                      <span key={index} className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-2 py-1 text-purple-300 text-sm">
                        {skill}
                      </span>
                    ))}
                    {profile.skills?.length > 5 && (
                      <span className="text-white/60 text-sm">+{profile.skills.length - 5} more</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Experience</h3>
                  <p className="text-white/80">{profile.experience?.length || 0} positions</p>
                  <p className="text-white/80">{profile.education?.length || 0} education entries</p>
                  <p className="text-white/80">{profile.projects?.length || 0} projects</p>
                </div>
              </div>
            </div>
          )}

          {/* Job Postings */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Job Opportunities</h2>
              <div className="flex items-center gap-4">
                <div className="text-white/80 text-sm">
                  📍 Showing jobs near <span className="text-purple-400 font-semibold">{searchLocation || profile?.location || 'your location'}</span>
                </div>
              </div>
            </div>
            
            {/* Search Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Location:</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, NY or Mumbai"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Job Role (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g., Python Developer, Marketing Manager"
                    value={searchJobRole}
                    onChange={(e) => setSearchJobRole(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSearchLocation('');
                      setSearchJobRole('');
                    }}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setSearchLocation(profile?.location || '')}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Use My Location
                  </button>
                </div>
                {searching && (
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-white/80">Loading job opportunities...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center"
                >
                  <p className="text-red-200">{error}</p>
                </motion.div>
              ) : jobs.length === 0 ? (
                <motion.div 
                  key="no-jobs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
                >
                  <p className="text-white/80 text-lg">No job opportunities found.</p>
                  <p className="text-white/60 mt-2">Try adjusting your location or job role filters.</p>
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
                      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                        🏠 Perfect Location Match ({jobs.filter(job => job.isHighMatch).length})
                      </h3>
                      <p className="text-white/60 text-sm mb-4">Jobs in your exact city, state, or remote opportunities</p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isHighMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="high" onApply={handleApply} onJobClick={handleJobClick} />
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
                      <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                        🗺️ Good Location Match ({jobs.filter(job => job.isMediumMatch).length})
                      </h3>
                      <p className="text-white/60 text-sm mb-4">Jobs in your region or nearby areas</p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isMediumMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="medium" onApply={handleApply} onJobClick={handleJobClick} />
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
                      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                        🌍 Other Locations ({jobs.filter(job => job.isLowMatch).length})
                      </h3>
                      <p className="text-white/60 text-sm mb-4">Jobs from other locations that might interest you</p>
                      <div className="grid gap-4">
                        {jobs.filter(job => job.isLowMatch).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} matchLevel="low" onApply={handleApply} onJobClick={handleJobClick} />
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


