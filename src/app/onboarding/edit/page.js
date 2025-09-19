'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfilePage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    
    // Load parsed data from sessionStorage
    const parsedData = sessionStorage.getItem('parsedResumeData');
    if (parsedData) {
      try {
        const data = JSON.parse(parsedData);
        setFormData(prev => ({ ...prev, ...data }));
        // Clear sessionStorage after loading
        sessionStorage.removeItem('parsedResumeData');
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
  }, [user, loading, router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, newItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          profileData: { ...formData, onboarded: true }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle specific error types
        if (data.type === 'network_error') {
          throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
        } else if (data.type === 'database_error') {
          throw new Error('Database error occurred. Please try again in a few moments.');
        } else {
          throw new Error(data.details || data.error || 'Save failed');
        }
      }
      await refreshProfile();
      router.replace('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Review & Edit Your Profile</h1>
        <p className="text-white/80 mb-8">Please review and edit the information extracted from your resume.</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Professional Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-3 py-1 flex items-center gap-2">
                  <span className="text-white text-sm">{skill}</span>
                  <button
                    onClick={() => removeArrayItem('skills', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    addArrayItem('skills', e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Add a skill"]');
                  if (input.value.trim()) {
                    addArrayItem('skills', input.value.trim());
                    input.value = '';
                  }
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Work Experience</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleArrayChange('experience', index, { ...exp, company: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Role</label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => handleArrayChange('experience', index, { ...exp, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => handleArrayChange('experience', index, { ...exp, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate || ''}
                      onChange={(e) => handleArrayChange('experience', index, { ...exp, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-white/80 text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) => handleArrayChange('experience', index, { ...exp, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={() => removeArrayItem('experience', index)}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove Experience
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}
              className="bg-purple-500/20 border border-purple-400/50 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Add Experience
            </button>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => handleArrayChange('education', index, { ...edu, institution: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayChange('education', index, { ...edu, degree: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => handleArrayChange('education', index, { ...edu, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => handleArrayChange('education', index, { ...edu, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeArrayItem('education', index)}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove Education
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('education', { institution: '', degree: '', startDate: '', endDate: '' })}
              className="bg-purple-500/20 border border-purple-400/50 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Add Education
            </button>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Projects</h3>
            {formData.projects.map((project, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Project Name</label>
                    <input
                      type="text"
                      value={project.name || ''}
                      onChange={(e) => handleArrayChange('projects', index, { ...project, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1">Technologies</label>
                    <input
                      type="text"
                      value={project.technologies || ''}
                      onChange={(e) => handleArrayChange('projects', index, { ...project, technologies: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-white/80 text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => handleArrayChange('projects', index, { ...project, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={() => removeArrayItem('projects', index)}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove Project
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('projects', { name: '', description: '', technologies: '' })}
              className="bg-purple-500/20 border border-purple-400/50 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Add Project
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-white/20">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              {saving ? 'Saving...' : 'Save & Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
