'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Edit3, FileText, Sparkles, CheckCircle } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose, onApply, userProfile }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState(null);

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
      setGeneratedResume(data.resume);
      setEditedResume(data.resume);
      setActiveTab('resume');
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{job.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMatchBadgeColor(getMatchLevel())}`}>
                      {getMatchLevel() === 'high' ? '🎯 High Match' : 
                       getMatchLevel() === 'medium' ? '⭐ Good Match' : '💼 Opportunity'}
                    </span>
                  </div>
                  <p className="text-purple-400 font-semibold text-lg">{job.company}</p>
                  <div className="flex items-center gap-4 text-sm text-white/80 mt-2">
                    <span>📍 {job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.salary}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'details'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Job Details
                </button>
                <button
                  onClick={() => setActiveTab('apply')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'apply'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Apply Options
                </button>
                {generatedResume && (
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'resume'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Generated Resume
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                    <p className="text-white/80 leading-relaxed">{job.description}</p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {job.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-white/80">
                            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                            <span>{req}</span>
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
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Choose Your Application Method</h3>
                    <p className="text-white/60">Select how you'd like to apply for this position</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Apply with Existing Resume */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/5 border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                      onClick={handleApplyWithExisting}
                    >
                      <div className="text-center">
                        <FileText className="mx-auto mb-4 text-purple-400" size={48} />
                        <h4 className="text-lg font-semibold text-white mb-2">Use Existing Resume</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Apply using your current resume from your profile
                        </p>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                          Apply Now
                        </button>
                      </div>
                    </motion.div>

                    {/* Generate New Resume */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/5 border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                      onClick={handleGenerateResume}
                    >
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-4 text-yellow-400" size={48} />
                        <h4 className="text-lg font-semibold text-white mb-2">Generate New Resume</h4>
                        <p className="text-white/60 text-sm mb-4">
                          Create a tailored resume using AI for this specific job
                        </p>
                        <button 
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                          {isGenerating ? 'Generating...' : 'Generate & Apply'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'resume' && generatedResume && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Generated Resume</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all"
                      >
                        <Edit3 size={16} />
                        {isEditing ? 'Preview' : 'Edit'}
                      </button>
                      <button
                        onClick={handleDownloadResume}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                      >
                        <Download size={16} />
                        Download DOCX
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <textarea
                        value={JSON.stringify(editedResume, null, 2)}
                        onChange={(e) => {
                          try {
                            setEditedResume(JSON.parse(e.target.value));
                          } catch (error) {
                            // Invalid JSON, keep current value
                          }
                        }}
                        className="w-full h-96 p-4 bg-gray-800 text-white rounded-lg border border-white/20 font-mono text-sm"
                        placeholder="Edit resume data..."
                      />
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Personal Information</h4>
                          <p className="text-white/80">{generatedResume.name}</p>
                          <p className="text-white/80">{generatedResume.email}</p>
                          <p className="text-white/80">{generatedResume.phone}</p>
                          <p className="text-white/80">{generatedResume.location}</p>
                        </div>
                        
                        {generatedResume.summary && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">Professional Summary</h4>
                            <p className="text-white/80">{generatedResume.summary}</p>
                          </div>
                        )}

                        {generatedResume.skills && generatedResume.skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {generatedResume.skills.map((skill, index) => (
                                <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {generatedResume.experience && generatedResume.experience.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">Experience</h4>
                            <div className="space-y-3">
                              {generatedResume.experience.map((exp, index) => (
                                <div key={index} className="border-l-2 border-purple-500/30 pl-4">
                                  <h5 className="font-medium text-white">{exp.title}</h5>
                                  <p className="text-purple-300">{exp.company}</p>
                                  <p className="text-white/60 text-sm">{exp.duration}</p>
                                  {exp.description && (
                                    <p className="text-white/80 text-sm mt-1">{exp.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleApplyWithGenerated}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                      Apply with Generated Resume
                    </button>
                    <button
                      onClick={handleDownloadResume}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all"
                    >
                      Download & Apply Later
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
