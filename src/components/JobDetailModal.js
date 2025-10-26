'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Edit3, FileText, Sparkles, CheckCircle } from 'lucide-react';
import MultiResumeModal from './MultiResumeModal';

export default function JobDetailModal({ job, isOpen, onClose, onApply, userProfile }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResumes, setGeneratedResumes] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState(null);
  const [showMultiResumeModal, setShowMultiResumeModal] = useState(false);

  if (!job) return null;

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          jobDetails: {
            title: job.title,
            company: job.company,
            description: job.description,
            requirements: job.requirements || [],
            location: job.location,
            type: job.type,
            salary: job.salary
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const data = await response.json();
      setGeneratedResumes(data.resumes);
      setShowMultiResumeModal(true);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!editedResume) return;

    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: editedResume }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.company}_${job.title}_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const handleApplyWithExisting = () => {
    onApply(job, 'existing');
    onClose();
  };

  const handleApplyWithGenerated = () => {
    onApply(job, 'generated', editedResume);
    onClose();
  };

  const getMatchLevel = () => {
    if (job.locationScore >= 80) return 'high';
    if (job.locationScore >= 60) return 'medium';
    return 'low';
  };

  const getMatchBadgeColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{job.title}</h2>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getMatchBadgeColor(getMatchLevel())} flex-shrink-0`}>
                      {getMatchLevel() === 'high' ? '🎯 High Match' : 
                       getMatchLevel() === 'medium' ? '⭐ Good Match' : '💼 Opportunity'}
                    </span>
                  </div>
                  <p className="text-purple-400 font-semibold text-base sm:text-lg">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/80 mt-2">
                    <span>📍 {job.location}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{job.type}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{job.salary}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 flex-shrink-0"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
              <div className="flex gap-2 sm:gap-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'details'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Job Details
                </button>
                <button
                  onClick={() => setActiveTab('apply')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'apply'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Apply Options
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'details' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Job Description</h3>
                    <p className="text-white/80 leading-relaxed text-sm sm:text-base">{job.description}</p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Requirements</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {job.requirements.map((req, index) => (
                          <div key={`req-${index}-${req?.slice(0, 10) || 'empty'}`} className="flex items-center gap-2 text-white/80">
                            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Job Information</h3>
                      <div className="space-y-2 text-white/80">
                        <div><span className="font-medium">Job ID:</span> {job.id}</div>
                        <div><span className="font-medium">Posted:</span> {new Date(job.postedDate).toLocaleDateString()}</div>
                        <div><span className="font-medium">Location Match:</span> {job.locationScore}%</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Company</h3>
                      <div className="space-y-2 text-white/80">
                        <div><span className="font-medium">Company:</span> {job.company}</div>
                        <div><span className="font-medium">Type:</span> {job.type}</div>
                        <div><span className="font-medium">Salary:</span> {job.salary}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'apply' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Choose Your Application Method</h3>
                    <p className="text-white/60 text-sm sm:text-base">Select how you'd like to apply for this position</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Apply with Existing Resume */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-white/10 transition-all"
                      onClick={handleApplyWithExisting}
                    >
                      <div className="text-center">
                        <FileText className="mx-auto mb-3 sm:mb-4 text-purple-400" size={40} />
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Use Existing Resume</h4>
                        <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
                          Apply using your current resume from your profile
                        </p>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base">
                          Apply Now
                        </button>
                      </div>
                    </motion.div>

                    {/* Generate New Resume */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-white/10 transition-all"
                      onClick={handleGenerateResume}
                    >
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-3 sm:mb-4 text-yellow-400" size={40} />
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Generate Resume Templates</h4>
                        <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
                          Create 5 different tailored resume templates using AI for this specific job
                        </p>
                        <button 
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base"
                        >
                          {isGenerating ? 'Generating 5 Templates...' : 'Generate 5 Templates'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Multi Resume Modal */}
      <MultiResumeModal
        resumes={generatedResumes}
        isOpen={showMultiResumeModal}
        onClose={() => setShowMultiResumeModal(false)}
        jobDetails={job}
        userProfile={userProfile}
      />
    </AnimatePresence>
  );
}
