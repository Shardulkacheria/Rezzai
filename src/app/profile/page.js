'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText, 
  Calendar,
  Star,
  Eye,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Protected from '@/components/Protected';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const [generatedResumes, setGeneratedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    fetchGeneratedResumes();
  }, []);

  const fetchGeneratedResumes = async () => {
    try {
      const response = await fetch(`/api/profile/resumes?userId=${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (resume) => {
    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.jobTitle || 'Resume'}_${resume.company || 'Company'}_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await fetch(`/api/profile/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGeneratedResumes(prev => prev.filter(r => r.id !== resumeId));
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
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

  if (loading) {
    return (
      <Protected>
        <div className={getThemeClasses()}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <div className={getThemeClasses()}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Link
                href="/dashboard"
                className={`p-2 sm:p-3 rounded-xl ${theme === 'light' ? 'bg-white/50 hover:bg-white/70' : 'bg-white/10 hover:bg-white/20'} transition-all`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textClasses.primary}`}>
                My Profile
              </h1>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`${getCardClasses()} rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`p-2 sm:p-3 rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-purple-500/20'}`}>
                  <User className={`w-5 h-5 sm:w-6 sm:h-6 ${textClasses.accent}`} />
                </div>
                <h2 className={`text-lg sm:text-xl font-bold ${textClasses.primary}`}>Personal Information</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className={`w-4 h-4 ${textClasses.muted} flex-shrink-0`} />
                  <span className={`${textClasses.secondary} text-sm sm:text-base break-all`}>{profile?.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className={`w-4 h-4 ${textClasses.muted} flex-shrink-0`} />
                  <span className={`${textClasses.secondary} text-sm sm:text-base`}>{profile?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className={`w-4 h-4 ${textClasses.muted} flex-shrink-0`} />
                  <span className={`${textClasses.secondary} text-sm sm:text-base`}>{profile?.location || 'Not provided'}</span>
                </div>
              </div>

              {profile?.summary && (
                <div className="mt-4 sm:mt-6">
                  <h3 className={`font-semibold ${textClasses.primary} mb-2 text-sm sm:text-base`}>Professional Summary</h3>
                  <p className={`text-xs sm:text-sm ${textClasses.secondary} leading-relaxed`}>
                    {profile.summary}
                  </p>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className={`font-semibold ${textClasses.primary} mb-2 sm:mb-3 text-sm sm:text-base`}>Skills</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          theme === 'light' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Generated Resumes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-2"
            >
              <div className={`${getCardClasses()} rounded-2xl p-4 sm:p-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 sm:p-3 rounded-full ${theme === 'light' ? 'bg-green-100' : 'bg-green-500/20'}`}>
                      <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${textClasses.primary}`}>Generated Resumes</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    theme === 'light' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-green-500/20 text-green-300'
                  }`}>
                    {generatedResumes.length} resumes
                  </span>
                </div>

                {generatedResumes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className={`w-16 h-16 mx-auto mb-4 ${textClasses.muted}`} />
                    <h3 className={`text-lg font-semibold ${textClasses.primary} mb-2`}>
                      No Resumes Generated Yet
                    </h3>
                    <p className={`${textClasses.secondary} mb-6`}>
                      Generate your first AI-powered resume by applying to a job
                    </p>
                    <Link
                      href="/dashboard"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                        theme === 'light'
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {generatedResumes.map((resume, index) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'} rounded-xl p-4 border ${
                            theme === 'light' ? 'border-gray-200' : 'border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className={`font-semibold ${textClasses.primary}`}>
                                  {resume.jobTitle || 'Resume'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  theme === 'light' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {resume.company || 'Company'}
                                </span>
                              </div>
                              <p className={`text-sm ${textClasses.secondary} mb-3`}>
                                Generated on {new Date(resume.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className={`flex items-center gap-1 ${textClasses.muted}`}>
                                  <Calendar className="w-3 h-3" />
                                  {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown'}
                                </span>
                                {resume.atsScore && (
                                  <span className={`flex items-center gap-1 ${
                                    resume.atsScore >= 80 ? 'text-green-500' : 
                                    resume.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    <Star className="w-3 h-3" />
                                    ATS: {resume.atsScore}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedResume(resume);
                                  setShowResumeModal(true);
                                }}
                                className={`p-2 rounded-lg transition-all ${
                                  theme === 'light' 
                                    ? 'hover:bg-gray-200' 
                                    : 'hover:bg-white/10'
                                }`}
                                title="View Resume"
                              >
                                <Eye className={`w-4 h-4 ${textClasses.muted}`} />
                              </button>
                              <button
                                onClick={() => handleDownloadResume(resume)}
                                className={`p-2 rounded-lg transition-all ${
                                  theme === 'light' 
                                    ? 'hover:bg-gray-200' 
                                    : 'hover:bg-white/10'
                                }`}
                                title="Download Resume"
                              >
                                <Download className={`w-4 h-4 ${textClasses.muted}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteResume(resume.id)}
                                className={`p-2 rounded-lg transition-all ${
                                  theme === 'light' 
                                    ? 'hover:bg-red-100' 
                                    : 'hover:bg-red-500/20'
                                }`}
                                title="Delete Resume"
                              >
                                <Trash2 className={`w-4 h-4 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Resume Preview Modal */}
        <AnimatePresence>
          {showResumeModal && selectedResume && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowResumeModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`${getCardClasses()} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-bold ${textClasses.primary}`}>
                      {selectedResume.jobTitle || 'Resume Preview'}
                    </h3>
                    <button
                      onClick={() => setShowResumeModal(false)}
                      className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="space-y-6">
                    <div>
                      <h4 className={`font-semibold ${textClasses.primary} mb-2`}>Personal Information</h4>
                      <p className={textClasses.secondary}>{selectedResume.name}</p>
                      <p className={textClasses.secondary}>{selectedResume.email}</p>
                      <p className={textClasses.secondary}>{selectedResume.phone}</p>
                      <p className={textClasses.secondary}>{selectedResume.location}</p>
                    </div>
                    
                    {selectedResume.summary && (
                      <div>
                        <h4 className={`font-semibold ${textClasses.primary} mb-2`}>Professional Summary</h4>
                        <p className={`${textClasses.secondary} leading-relaxed`}>{selectedResume.summary}</p>
                      </div>
                    )}

                    {selectedResume.skills && selectedResume.skills.length > 0 && (
                      <div>
                        <h4 className={`font-semibold ${textClasses.primary} mb-2`}>Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedResume.skills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm ${
                                theme === 'light' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      theme === 'light' 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadResume(selectedResume)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    Download DOCX
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Protected>
  );
}


