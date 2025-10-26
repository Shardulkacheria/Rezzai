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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

      // Enhanced Scroll-triggered animations
      
      // Features section animations
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

      // About section animations
      gsap.from(".about-content", {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      gsap.from(".about-stats", {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Statistics counter animation
      gsap.utils.toArray(".stat-number").forEach(stat => {
        const endValue = parseInt(stat.textContent.replace(/[^\d]/g, ''));
        gsap.fromTo(stat, 
          { textContent: 0 },
          {
            textContent: endValue,
            duration: 2,
            ease: "power2.out",
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: stat,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // CTA section animation
      gsap.from(".cta-section", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Navigation scroll effect with iOS-style glassmorphism
      gsap.to("nav", {
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        duration: 0.3,
        scrollTrigger: {
          trigger: "body",
          start: "100px top",
          end: "bottom top",
          toggleActions: "play none none reverse"
        }
      });

      // Text reveal animations
      gsap.utils.toArray(".reveal-text").forEach(text => {
        gsap.from(text, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        });
      });

      // Image/icon animations
      gsap.utils.toArray(".animate-icon").forEach(icon => {
        gsap.from(icon, {
          scale: 0,
          rotation: 180,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: icon,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        });
      });

      // Staggered badge animations
      gsap.from(".badge", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".badge-container",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Enhanced floating elements with scroll-based movement
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

          // Add scroll-based parallax effect to floating elements
          gsap.to(element, {
            y: -50,
            rotation: 360,
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "body",
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        }
      });

      // Text typing animation for hero title
      gsap.fromTo(".hero-title", 
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hero-title",
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Magnetic effect for buttons
      gsap.utils.toArray("button").forEach(button => {
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // Scroll progress indicator
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-white/10 z-50">
        <div className="scroll-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 origin-left scale-x-0"></div>
      </div>

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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-2xl md:text-3xl font-bold text-white hover:text-purple-400 transition-colors duration-300"
            >
              Rezz<span className="text-purple-400">AI</span>
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="text-white/90 hover:text-white transition-colors duration-300 font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                className="text-white/90 hover:text-white transition-colors duration-300 font-medium"
              >
                About
              </button>
            </div>
          {user ? (
            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="hidden md:block text-white/80 text-sm">Welcome, {user.displayName || user.email}</span>
              <button 
                onClick={() => {
                  router.push(onboarded ? '/dashboard' : '/onboarding');
                }}
                className="bg-white/10 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="text-white/80 hover:text-red-300 transition-colors px-3 py-2 md:px-4 md:py-2 rounded-xl border border-white/20 hover:border-red-300/50 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 md:space-x-3">
              <button 
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="text-white/90 hover:text-white transition-colors px-3 py-2 md:px-4 md:py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="bg-white/10 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Sign Up
              </button>
            </div>
          )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-white/90 hover:text-white transition-colors duration-300 font-medium text-left py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-white/90 hover:text-white transition-colors duration-300 font-medium text-left py-2"
                >
                  About
                </button>
                {!user && (
                  <>
                    <button 
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-white/90 hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-left"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 text-left"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-6 pt-20">
        <div className="text-center max-w-6xl mx-auto">
          <h1 
            ref={titleRef}
            className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight"
          >
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Job Automation
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Transform your job search with intelligent resume building, automated applications, 
            and smart job matching powered by cutting-edge AI technology.
          </p>
          
          <div 
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <button 
              onClick={() => {
                setAuthMode('signup');
                setAuthModalOpen(true);
              }}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
            >
              Get Started Free
            </button>
            <button className="w-full sm:w-auto border border-white/30 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section relative z-10 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-16 reveal-text">
            Why Choose <span className="text-purple-400">RezzAI</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="feature-card bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 md:mb-6 animate-icon border border-white/20">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">AI Resume Builder</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                Generate tailored resumes for each job application using advanced AI that understands job requirements and optimizes your profile.
              </p>
            </div>

            <div className="feature-card bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 md:mb-6 animate-icon border border-white/20">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Auto Apply</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                Automatically apply to relevant job postings with your permission. Save time and never miss an opportunity.
              </p>
            </div>

            <div className="feature-card bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 md:mb-6 animate-icon border border-white/20">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h6.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-6.75a1.125 1.125 0 01-1.125-1.125v-6.75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Smart Tracking</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                Track all your applications, monitor status updates, and get insights on your job search performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-16 reveal-text">
            About <span className="text-purple-400">RezzAI</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="about-content">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Revolutionizing Job Search</h3>
              <p className="text-base md:text-lg text-gray-300 mb-4 md:mb-6 leading-relaxed">
                RezzAI combines the power of artificial intelligence with job market intelligence 
                to create a seamless, automated job search experience. Our platform understands 
                your skills, preferences, and career goals to match you with the perfect opportunities.
              </p>
              <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 leading-relaxed">
                From intelligent resume parsing and generation to automated job applications, 
                we handle the tedious parts of job searching so you can focus on what matters most - 
                your career growth.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 badge-container">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 badge hover:bg-white/10 transition-all duration-300">
                  <span className="text-white font-medium text-sm md:text-base">AI-Powered</span>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 badge hover:bg-white/10 transition-all duration-300">
                  <span className="text-white font-medium text-sm md:text-base">Time-Saving</span>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 badge hover:bg-white/10 transition-all duration-300">
                  <span className="text-white font-medium text-sm md:text-base">Smart Matching</span>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 badge hover:bg-white/10 transition-all duration-300">
                  <span className="text-white font-medium text-sm md:text-base">Automated</span>
                </div>
              </div>
            </div>
            
            <div className="relative about-stats">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Our Mission</h4>
                <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                  To democratize job search by making it accessible, efficient, and successful 
                  for professionals at every level through cutting-edge AI technology.
                </p>
                
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Key Statistics</h4>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400 stat-number">95%</div>
                    <div className="text-xs md:text-sm text-gray-300">Success Rate</div>
                  </div>
                  <div className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400 stat-number">10x</div>
                    <div className="text-xs md:text-sm text-gray-300">Faster Applications</div>
                  </div>
                  <div className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400 stat-number">50k+</div>
                    <div className="text-xs md:text-sm text-gray-300">Jobs Matched</div>
                  </div>
                  <div className="text-center bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400 stat-number">24/7</div>
                    <div className="text-xs md:text-sm text-gray-300">Active Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section relative z-10 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8 reveal-text">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 reveal-text">
            Join thousands of professionals who have already automated their job search with RezzAI.
          </p>
          <button 
            onClick={() => {
              setAuthMode('signup');
              setAuthModalOpen(true);
            }}
            className="bg-white/10 backdrop-blur-md text-white px-8 py-4 md:px-12 md:py-6 rounded-2xl text-lg md:text-xl font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
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
