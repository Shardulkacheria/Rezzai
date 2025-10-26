'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import Protected from '@/components/Protected';

export default function ApplicationsPage() {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status: newStatus, updatedAt: new Date() }
              : app
          )
        );
      } else {
        console.error('Failed to update status:', data.error);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const response = await fetch(`/api/applications?id=${applicationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setApplications(prev => prev.filter(app => app._id !== applicationId));
      } else {
        console.error('Failed to delete application:', data.error);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
      'Skipped': 'bg-gray-100 text-gray-800 border-gray-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Interview': 'bg-purple-100 text-purple-800 border-purple-200',
      'Offer': 'bg-green-100 text-green-800 border-green-200'
    };
    
    const darkColors = {
      'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Applied': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Skipped': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'Rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Interview': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Offer': 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    
    return theme === 'light' ? colors[status] || colors['Pending'] : darkColors[status] || darkColors['Pending'];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      case 'Interview': return <Briefcase className="w-4 h-4" />;
      case 'Offer': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const filteredApplications = applications.filter(app => 
    statusFilter === 'All' || app.status === statusFilter
  );

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

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
                Application Tracking
              </h1>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className={`${getCardClasses()} rounded-2xl p-3 sm:p-4 text-center`}>
                <div className={`text-lg sm:text-2xl font-bold ${textClasses.primary}`}>
                  {count}
                </div>
                <div className={`text-xs sm:text-sm ${textClasses.secondary}`}>
                  {status}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${getCardClasses()} rounded-2xl p-4 sm:p-6 mb-6`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Filter className={`w-5 h-5 ${textClasses.muted}`} />
                <span className={`text-sm sm:text-base font-medium ${textClasses.primary}`}>
                  Filter by Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm border ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <option value="All">All ({applications.length})</option>
                  <option value="Pending">Pending ({statusCounts.Pending || 0})</option>
                  <option value="Applied">Applied ({statusCounts.Applied || 0})</option>
                  <option value="Interview">Interview ({statusCounts.Interview || 0})</option>
                  <option value="Offer">Offer ({statusCounts.Offer || 0})</option>
                  <option value="Rejected">Rejected ({statusCounts.Rejected || 0})</option>
                  <option value="Skipped">Skipped ({statusCounts.Skipped || 0})</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchApplications().finally(() => setRefreshing(false));
                }}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </motion.div>

          {/* Applications List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${getCardClasses()} rounded-2xl p-4 sm:p-6`}
          >
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${textClasses.muted}`} />
                <h3 className={`text-lg font-semibold ${textClasses.primary} mb-2`}>
                  No Applications Found
                </h3>
                <p className={`${textClasses.secondary} mb-6`}>
                  {statusFilter === 'All' 
                    ? "You haven't applied to any jobs yet. Start applying from the dashboard!"
                    : `No applications with status "${statusFilter}" found.`
                  }
                </p>
                <Link
                  href="/dashboard"
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application, index) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 sm:p-6 rounded-xl border ${
                      theme === 'light' 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className={`w-5 h-5 ${textClasses.muted}`} />
                          <h3 className={`text-lg font-semibold ${textClasses.primary} truncate`}>
                            {application.jobTitle}
                          </h3>
                        </div>
                        <p className={`text-base ${textClasses.secondary} mb-2`}>
                          {application.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${textClasses.muted}`} />
                            <span className={textClasses.muted}>
                              Applied: {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className={`w-4 h-4 ${textClasses.muted}`} />
                            <span className={textClasses.muted}>
                              {application.resumeUsed}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={application.status}
                            onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs border ${
                              theme === 'light'
                                ? 'bg-white border-gray-300 text-gray-900'
                                : 'bg-white/10 border-white/20 text-white'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Skipped">Skipped</option>
                          </select>
                          
                          {application.jobUrl && (
                            <a
                              href={application.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-lg transition-all ${
                                theme === 'light'
                                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                              }`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => deleteApplication(application._id)}
                            className={`p-2 rounded-lg transition-all ${
                              theme === 'light'
                                ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Protected>
  );
}

