'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingPage() {
  const { user, loading, onboarded, refreshProfile } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (onboarded) {
      router.replace('/dashboard');
    }
  }, [user, loading, onboarded, router]);

  const handleParseUpload = async () => {
    setError('');
    setUploading(true);
    setParsed(null);
    try {
      if (!file) {
        setError('Please select a PDF or DOCX resume to upload');
        setUploading(false);
        return;
      }
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setParsed(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    // Store parsed data in sessionStorage to pass to edit page
    sessionStorage.setItem('parsedResumeData', JSON.stringify(parsed));
    router.push('/onboarding/edit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome! Let's set up your profile</h1>
        <p className="text-white/80 mb-8">Upload your resume in DOCX format. We'll parse it with Gemini AI for 100% accurate extraction.</p>

               {error && (
                 <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                   <p className="text-red-200 text-sm">{error}</p>
                 </div>
               )}

               <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                 <label className="block text-white/90 font-semibold mb-3">Upload Resume (DOCX only)</label>
                 <input
                   type="file"
                   accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                   className="w-full text-white file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white hover:file:bg-purple-700"
                 />
                 <div className="mt-3 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                   <p className="text-purple-200 text-sm">
                     <strong>🤖 AI-Powered:</strong> Using Gemini AI for 100% accurate resume parsing. DOCX files only for best results.
                   </p>
                 </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleParseUpload}
              disabled={uploading || !file}
              className="bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
                     {uploading ? 'Parsing with Gemini AI...' : 'Parse with Gemini AI'}
            </button>
            <button
              onClick={() => { setParsed(null); setFile(null); }}
              className="border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/10"
            >
              Reset
            </button>
          </div>
          {file && (
            <p className="text-white/70 text-sm mt-2">Selected: {file.name}</p>
          )}
        </div>

        {parsed && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Parsing Complete!</h2>
            <p className="text-white/80 mb-6">We've extracted the following information from your resume. Click continue to review and edit it.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-white/70">Name:</span> <span className="text-white">{parsed.fullName || 'Not found'}</span></div>
                  <div><span className="text-white/70">Email:</span> <span className="text-white">{parsed.email || 'Not found'}</span></div>
                  <div><span className="text-white/70">Phone:</span> <span className="text-white">{parsed.phone || 'Not found'}</span></div>
                  <div><span className="text-white/70">Location:</span> <span className="text-white">{parsed.location || 'Not found'}</span></div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Skills Found</h3>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills && parsed.skills.length > 0 ? (
                    parsed.skills.map((skill, index) => (
                      <span key={index} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/50 text-sm">No skills detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {parsed.summary && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                <p className="text-white/80 text-sm">{parsed.summary}</p>
              </div>
            )}

            {/* Experience */}
            {parsed.experience && parsed.experience.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Experience</h3>
                <div className="space-y-3">
                  {parsed.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-purple-500/50 pl-3">
                      <div className="text-white font-medium">{exp.role || 'Position'}</div>
                      <div className="text-white/70 text-sm">{exp.company || 'Company'}</div>
                      <div className="text-white/50 text-xs">{exp.startDate} - {exp.endDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsed.education && parsed.education.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Education</h3>
                <div className="space-y-3">
                  {parsed.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-blue-500/50 pl-3">
                      <div className="text-white font-medium">{edu.degree || 'Degree'}</div>
                      <div className="text-white/70 text-sm">{edu.institution || 'Institution'}</div>
                      <div className="text-white/50 text-xs">{edu.startDate} - {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleContinue}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Continue to Edit
              </button>
              <button
                onClick={() => { setParsed(null); setFile(null); }}
                className="border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Parse Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


