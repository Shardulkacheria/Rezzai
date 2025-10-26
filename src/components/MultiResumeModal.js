'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Eye, FileText, Star, CheckCircle, BarChart3, Target, Calendar, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function MultiResumeModal({ resumes, isOpen, onClose, jobDetails, userProfile }) {
  const { theme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState('reverseChronological');
  const [isDownloading, setIsDownloading] = useState({});

  if (!resumes || !isOpen) return null;

  const templateIcons = {
    reverseChronological: Calendar,
    functional: Users,
    combination: FileText,
    infographic: BarChart3,
    targeted: Target
  };

  const templateColors = {
    reverseChronological: theme === 'light' ? 'blue' : 'blue',
    functional: theme === 'light' ? 'green' : 'green',
    combination: theme === 'light' ? 'purple' : 'purple',
    infographic: theme === 'light' ? 'orange' : 'orange',
    targeted: theme === 'light' ? 'red' : 'red'
  };

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        background: 'bg-gradient-to-br from-sky-200 via-blue-50 to-white',
        card: 'bg-white/90 backdrop-blur-lg border border-gray-200/50 shadow-xl',
        text: {
          primary: 'text-gray-900',
          secondary: 'text-gray-600',
          muted: 'text-gray-500',
          accent: 'text-blue-600'
        }
      };
    }
    return {
      background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      card: 'bg-white/10 backdrop-blur-lg border border-white/20',
      text: {
        primary: 'text-white',
        secondary: 'text-white/80',
        muted: 'text-white/60',
        accent: 'text-purple-400'
      }
    };
  };

  const themeClasses = getThemeClasses();

  const handleDownload = async (templateKey, resume) => {
    setIsDownloading(prev => ({ ...prev, [templateKey]: true }));
    
    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resume,
          templateType: resume.templateType,
          jobTitle: jobDetails?.title,
          company: jobDetails?.company
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jobDetails?.company || 'Company'}_${jobDetails?.title || 'Position'}_${resume.templateType.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(prev => ({ ...prev, [templateKey]: false }));
    }
  };

  const renderResumeContent = (resume) => {
    const IconComponent = templateIcons[selectedTemplate] || FileText;
    const color = templateColors[selectedTemplate];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            theme === 'light' 
              ? `bg-${color}-100 text-${color}-700 border border-${color}-200`
              : `bg-${color}-500/20 text-${color}-300 border border-${color}-400/50`
          }`}>
            <IconComponent size={20} />
            <span className="font-semibold">{resume.templateType}</span>
          </div>
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}>
            {resume.name}
          </h2>
          <div className={`${themeClasses.text.secondary} space-y-1`}>
            <p>{resume.email}</p>
            <p>{resume.phone}</p>
            <p>{resume.location}</p>
          </div>
        </div>

        {/* Professional Summary */}
        {resume.summary && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <Star size={18} />
              Professional Summary
            </h3>
            <p className={`${themeClasses.text.secondary} leading-relaxed`}>
              {resume.summary}
            </p>
          </div>
        )}

        {/* Skills Section */}
        {resume.skills && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <CheckCircle size={18} />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, index) => (
                <span
                  key={`skill-${index}-${skill?.slice(0, 10) || 'empty'}`}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    theme === 'light'
                      ? `bg-${color}-100 text-${color}-700 border border-${color}-200`
                      : `bg-${color}-500/20 text-${color}-300 border border-${color}-400/50`
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skill Categories (for Functional resume) */}
        {resume.skillCategories && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <Users size={18} />
              Skill Categories
            </h3>
            <div className="space-y-4">
              {Object.entries(resume.skillCategories).map(([category, skills]) => (
                <div key={`category-${category}`}>
                  <h4 className={`font-medium ${themeClasses.text.primary} mb-2`}>{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={`cat-skill-${category}-${index}-${skill?.slice(0, 10) || 'empty'}`}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          theme === 'light'
                            ? `bg-${color}-100 text-${color}-700 border border-${color}-200`
                            : `bg-${color}-500/20 text-${color}-300 border border-${color}-400/50`
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies (for Combination resume) */}
        {resume.coreCompetencies && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <CheckCircle size={18} />
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.coreCompetencies.map((skill, index) => (
                <span
                  key={`comp-${index}-${skill?.slice(0, 10) || 'empty'}`}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    theme === 'light'
                      ? `bg-${color}-100 text-${color}-700 border border-${color}-200`
                      : `bg-${color}-500/20 text-${color}-300 border border-${color}-400/50`
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Qualifications (for Targeted resume) */}
        {resume.keyQualifications && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <Target size={18} />
              Key Qualifications
            </h3>
            <div className="space-y-2">
              {resume.keyQualifications.map((qual, index) => (
                <div key={`qual-${index}-${qual?.slice(0, 10) || 'empty'}`} className={`flex items-center gap-2 ${themeClasses.text.secondary}`}>
                  <CheckCircle size={16} className="text-green-500" />
                  <span>{qual}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Levels (for Infographic resume) */}
        {resume.skillLevels && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <BarChart3 size={18} />
              Skill Proficiency
            </h3>
            <div className="space-y-3">
              {Object.entries(resume.skillLevels).map(([skill, level]) => (
                <div key={`skill-level-${skill}-${level}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${themeClasses.text.secondary} font-medium`}>{skill}</span>
                    <span className={`${themeClasses.text.muted} text-sm`}>{level}%</span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-3 ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-white/20'
                  }`}>
                    <div
                      className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-3 rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                      style={{ width: `${level}%` }}
                    >
                      <span className="text-white text-xs font-bold">{level}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Stats (for Infographic resume) */}
        {resume.visualStats && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <BarChart3 size={18} />
              Professional Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(resume.visualStats).map(([stat, value]) => (
                <div key={`stat-${stat}`} className={`text-center p-4 rounded-lg ${
                  theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                }`}>
                  <div className={`text-2xl font-bold ${themeClasses.text.accent} mb-1`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className={`text-sm ${themeClasses.text.secondary} capitalize`}>
                    {stat.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Chart (for Infographic resume) */}
        {resume.achievementChart && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <Star size={18} />
              Core Competencies
            </h3>
            <div className="space-y-3">
              {Object.entries(resume.achievementChart).map(([competency, score]) => (
                <div key={`ach-${competency}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${themeClasses.text.secondary} font-medium capitalize`}>
                      {competency}
                    </span>
                    <span className={`${themeClasses.text.muted} text-sm`}>{score}%</span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-4 ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-white/20'
                  }`}>
                    <div
                      className={`bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                      style={{ width: `${score}%` }}
                    >
                      <span className="text-white text-xs font-bold">{score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <Calendar size={18} />
              Professional Experience
            </h3>
            <div className="space-y-4">
              {resume.experience.map((exp, index) => (
                <div key={`exp-${index}-${exp.title?.slice(0, 10) || 'empty'}`} className={`border-l-2 ${
                  theme === 'light' ? `border-${color}-300` : `border-${color}-400`
                } pl-4`}>
                  <h4 className={`font-semibold ${themeClasses.text.primary}`}>{exp.title}</h4>
                  <p className={`${themeClasses.text.accent} font-medium`}>{exp.company}</p>
                  <p className={`${themeClasses.text.muted} text-sm mb-2`}>{exp.duration}</p>
                  <p className={`${themeClasses.text.secondary} text-sm`}>{exp.description}</p>
                  
                  {/* Key Achievements */}
                  {exp.keyAchievements && (
                    <ul className="mt-2 space-y-1">
                      {exp.keyAchievements.map((achievement, idx) => (
                        <li key={`key-ach-${index}-${idx}-${achievement?.slice(0, 10) || 'empty'}`} className={`flex items-start gap-2 ${themeClasses.text.secondary} text-sm`}>
                          <span className="text-green-500 mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Relevant Achievements */}
                  {exp.relevantAchievements && (
                    <ul className="mt-2 space-y-1">
                      {exp.relevantAchievements.map((achievement, idx) => (
                        <li key={`rel-ach-${index}-${idx}-${achievement?.slice(0, 10) || 'empty'}`} className={`flex items-start gap-2 ${themeClasses.text.secondary} text-sm`}>
                          <span className="text-green-500 mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Visual Metrics (for Infographic resume) */}
                  {exp.visualMetrics && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(exp.visualMetrics).map(([metric, value]) => (
                        <div key={`metric-${index}-${metric}`} className={`text-center p-2 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${themeClasses.text.accent}`}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                          <div className={`text-xs ${themeClasses.text.muted} capitalize`}>
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <FileText size={18} />
              Education
            </h3>
            <div className="space-y-3">
              {resume.education.map((edu, index) => (
                <div key={`edu-${index}-${edu.degree?.slice(0, 10) || 'empty'}`} className={`p-4 rounded-lg ${
                  theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                }`}>
                  <h4 className={`font-semibold ${themeClasses.text.primary}`}>{edu.degree}</h4>
                  <p className={`${themeClasses.text.accent} font-medium`}>{edu.institution}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className={`${themeClasses.text.muted} text-sm`}>{edu.year}</p>
                    {edu.gpa && (
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'light' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                  {edu.honors && edu.honors.length > 0 && (
                    <div className="mt-2">
                      <div className={`text-xs ${themeClasses.text.muted} mb-1`}>Honors & Awards:</div>
                      <div className="flex flex-wrap gap-1">
                        {edu.honors.map((honor, idx) => (
                          <span key={`honor-${index}-${idx}`} className={`px-2 py-1 rounded-full text-xs ${
                            theme === 'light' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {honor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {edu.description && (
                    <p className={`${themeClasses.text.secondary} text-sm mt-2`}>{edu.description}</p>
                  )}
                  {edu.relevance && (
                    <p className={`${themeClasses.text.secondary} text-sm mt-2 italic`}>{edu.relevance}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <BarChart3 size={18} />
              Projects
            </h3>
            <div className="space-y-3">
              {resume.projects.map((project, index) => (
                <div key={`proj-${index}-${project.name?.slice(0, 10) || 'empty'}`} className={`p-4 rounded-lg ${
                  theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                }`}>
                  <h4 className={`font-semibold ${themeClasses.text.primary}`}>{project.name}</h4>
                  <p className={`${themeClasses.text.secondary} text-sm mt-1`}>{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={`proj-tech-${index}-${idx}-${tech?.slice(0, 10) || 'empty'}`}
                          className={`px-2 py-1 rounded text-xs ${
                            theme === 'light'
                              ? `bg-${color}-100 text-${color}-700`
                              : `bg-${color}-500/20 text-${color}-300`
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.relevance && (
                    <p className={`${themeClasses.text.secondary} text-sm mt-2 italic`}>{project.relevance}</p>
                  )}

                  {/* Project Impact (for Infographic resume) */}
                  {project.impact && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(project.impact).map(([metric, value]) => (
                        <div key={`impact-${index}-${metric}`} className={`text-center p-2 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${themeClasses.text.accent}`}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                          <div className={`text-xs ${themeClasses.text.muted} capitalize`}>
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (for Infographic resume) */}
        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-3 flex items-center gap-2`}>
              <CheckCircle size={18} />
              Certifications & Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.certifications.map((cert, index) => (
                <div key={`cert-${index}-${cert.name?.slice(0, 10) || 'empty'}`} className={`p-4 rounded-lg border ${
                  theme === 'light' 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      theme === 'light' 
                        ? 'bg-blue-100' 
                        : 'bg-blue-500/20'
                    }`}>
                      <CheckCircle size={24} className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${themeClasses.text.primary}`}>{cert.name}</h4>
                      <p className={`${themeClasses.text.accent} text-sm`}>{cert.issuer}</p>
                      <p className={`${themeClasses.text.muted} text-xs`}>{cert.year}</p>
                      {cert.badge && (
                        <div className={`mt-2 px-2 py-1 rounded-full text-xs ${
                          theme === 'light' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {cert.badge}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
            className={`${themeClasses.card} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                    Choose Your Resume Template
                  </h2>
                  <p className={`${themeClasses.text.secondary} mt-1`}>
                    Generated for {jobDetails?.title} at {jobDetails?.company}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Template Selector */}
              <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
                <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                  Available Templates
                </h3>
                <div className="space-y-3">
                  {Object.entries(resumes).map(([key, resume]) => {
                    const IconComponent = templateIcons[key] || FileText;
                    const color = templateColors[key];
                    const isSelected = selectedTemplate === key;

                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(key)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          isSelected
                            ? theme === 'light'
                              ? `bg-${color}-100 border-2 border-${color}-300`
                              : `bg-${color}-500/20 border-2 border-${color}-400/50`
                            : theme === 'light'
                            ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected 
                              ? theme === 'light'
                                ? `bg-${color}-200`
                                : `bg-${color}-500/30`
                              : theme === 'light'
                              ? 'bg-gray-200'
                              : 'bg-white/10'
                          }`}>
                            <IconComponent 
                              size={20} 
                              className={isSelected ? `text-${color}-700` : themeClasses.text.muted}
                            />
                          </div>
                          <div className="flex-1">
                            <span className={`font-semibold ${
                              isSelected ? `text-${color}-700` : themeClasses.text.primary
                            }`}>
                              {resume.templateType}
                            </span>
                            <div className={`text-xs ${
                              isSelected ? `text-${color}-600` : themeClasses.text.muted
                            } mt-1`}>
                              {key === 'infographic' ? '📊 Visual & Creative' : 
                               key === 'functional' ? '🎯 Skills-Focused' :
                               key === 'combination' ? '⚖️ Balanced' :
                               key === 'targeted' ? '🎯 Job-Specific' :
                               '📅 Chronological'}
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm ${
                          isSelected ? `text-${color}-600` : themeClasses.text.secondary
                        }`}>
                          {resume.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Resume Preview */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
                    Preview: {resumes[selectedTemplate]?.templateType}
                  </h3>
                  <button
                    onClick={() => handleDownload(selectedTemplate, resumes[selectedTemplate])}
                    disabled={isDownloading[selectedTemplate]}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      theme === 'light'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                        : 'bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50'
                    }`}
                  >
                    {isDownloading[selectedTemplate] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download DOCX</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`${themeClasses.card} rounded-xl p-6`}>
                  {renderResumeContent(resumes[selectedTemplate])}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
