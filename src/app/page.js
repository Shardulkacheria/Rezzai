'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const router = useRouter();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const backgroundRef = useRef(null);
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  
  // Auth context
  const { user, onboarded, logout } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Hero section animations
      const tl = gsap.timeline();
      
      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      })
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8")
      .from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6");

      // Floating elements animation
      floatingElementsRef.current.forEach((element, index) => {
        if (element) {
          gsap.to(element, {
            y: -20,
            duration: 2 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
            delay: index * 0.2
          });
        }
      });

      // Parallax background
      gsap.to(backgroundRef.current, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Scroll-triggered animations
      gsap.from(".feature-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-20"
      >
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div 
        ref={el => floatingElementsRef.current[0] = el}
        className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full opacity-60"
      ></div>
      <div 
        ref={el => floatingElementsRef.current[1] = el}
        className="absolute top-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full opacity-40"
      ></div>
      <div 
        ref={el => floatingElementsRef.current[2] = el}
        className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-400 rounded-full opacity-50"
      ></div>
      <div 
        ref={el => floatingElementsRef.current[3] = el}
        className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-pink-400 rounded-full opacity-30"
      ></div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white">
          Rezz<span className="text-purple-400">AI</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="text-white hover:text-purple-400 transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
            className="text-white hover:text-purple-400 transition-colors"
          >
            About
          </button>
          {user ? (
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-white/80">Welcome, {user.displayName || user.email}</span>
              <button 
                onClick={() => {
                  router.push(onboarded ? '/dashboard' : '/onboarding');
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="text-white hover:text-red-300 transition-colors px-4 py-2 rounded-lg border border-white/20 hover:border-red-300/50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3 ml-4">
              <button 
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="text-white hover:text-purple-400 transition-colors px-4 py-2 rounded-lg border border-white/20 hover:border-purple-400/50"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-6xl mx-auto">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
          >
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Job Automation
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your job search with intelligent resume building, automated applications, 
            and smart job matching powered by cutting-edge AI technology.
          </p>
          
          <div 
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button 
              onClick={() => {
                setAuthMode('signup');
                setAuthModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Why Choose <span className="text-purple-400">RezzAI</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Resume Builder</h3>
              <p className="text-gray-300 leading-relaxed">
                Generate tailored resumes for each job application using advanced AI that understands job requirements and optimizes your profile.
              </p>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Auto Apply</h3>
              <p className="text-gray-300 leading-relaxed">
                Automatically apply to relevant job postings with your permission. Save time and never miss an opportunity.
              </p>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Tracking</h3>
              <p className="text-gray-300 leading-relaxed">
                Track all your applications, monitor status updates, and get insights on your job search performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            About <span className="text-purple-400">RezzAI</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Revolutionizing Job Search</h3>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                RezzAI combines the power of artificial intelligence with job market intelligence 
                to create a seamless, automated job search experience. Our platform understands 
                your skills, preferences, and career goals to match you with the perfect opportunities.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                From intelligent resume parsing and generation to automated job applications, 
                we handle the tedious parts of job searching so you can focus on what matters most - 
                your career growth.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold">AI-Powered</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold">Time-Saving</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold">Smart Matching</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold">Automated</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4">Our Mission</h4>
                <p className="text-gray-300 mb-6">
                  To democratize job search by making it accessible, efficient, and successful 
                  for professionals at every level through cutting-edge AI technology.
                </p>
                
                <h4 className="text-xl font-bold text-white mb-4">Key Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">95%</div>
                    <div className="text-sm text-gray-300">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">10x</div>
                    <div className="text-sm text-gray-300">Faster Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">50k+</div>
                    <div className="text-sm text-gray-300">Jobs Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">24/7</div>
                    <div className="text-sm text-gray-300">Active Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of professionals who have already automated their job search with RezzAI.
          </p>
          <button 
            onClick={() => {
              setAuthMode('signup');
              setAuthModalOpen(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-6 rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
      />
    </div>
  );
}
