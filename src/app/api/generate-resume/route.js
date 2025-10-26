import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request) {
  try {
    const { userProfile, jobDetails } = await request.json();

    if (!userProfile || !jobDetails) {
      return Response.json({ error: 'Missing user profile or job details' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) resume writer with 10+ years of experience. Generate 5 different high-scoring ATS resumes (90%+ ATS score) tailored for the specific job and company.

USER PROFILE:
- Name: ${userProfile.name || 'Not provided'}
- Email: ${userProfile.email || 'Not provided'}
- Phone: ${userProfile.phone || 'Not provided'}
- Location: ${userProfile.location || 'Not provided'}
- Skills: ${userProfile.skills ? userProfile.skills.join(', ') : 'Not provided'}
- Experience: ${userProfile.experience ? JSON.stringify(userProfile.experience) : 'Not provided'}
- Education: ${userProfile.education ? JSON.stringify(userProfile.education) : 'Not provided'}
- Projects: ${userProfile.projects ? JSON.stringify(userProfile.projects) : 'Not provided'}
- Summary: ${userProfile.summary || 'Not provided'}

JOB DETAILS:
- Title: ${jobDetails.title}
- Company: ${jobDetails.company}
- Description: ${jobDetails.description}
- Requirements: ${jobDetails.requirements ? jobDetails.requirements.join(', ') : 'Not specified'}
- Location: ${jobDetails.location}
- Type: ${jobDetails.type}
- Salary: ${jobDetails.salary}

COMPANY CONTEXT ANALYSIS:
- Analyze the company's culture, values, and mission from the job description
- Identify key technical requirements and preferred technologies
- Note specific industry terminology and buzzwords used
- Understand the role's seniority level and expectations
- Extract soft skills and personality traits they're looking for

GENERATE 5 DIFFERENT RESUME TEMPLATES:

1. REVERSE-CHRONOLOGICAL RESUME:
   - Focus on work history in reverse chronological order
   - Emphasize career progression and growth
   - Highlight most recent and relevant experience
   - Include quantifiable achievements and metrics
   - Perfect for experienced professionals with steady career growth

2. FUNCTIONAL RESUME:
   - Focus on skills and abilities rather than work history
   - Group experience by skill categories
   - Emphasize transferable skills and achievements
   - Minimize employment gaps or career changes
   - Perfect for career changers or those with gaps

3. COMBINATION RESUME:
   - Blend of chronological and functional formats
   - Start with skills summary, then chronological work history
   - Highlight both skills and career progression
   - Show how skills were applied in different roles
   - Perfect for mid-level professionals with diverse experience

4. INFOGRAPHIC RESUME:
   - Visual representation of skills and experience
   - Use charts, graphs, and visual elements
   - Emphasize creativity and design skills
   - Include visual progress indicators, skill meters, achievement charts
   - Add visual timeline for experience, project showcases with icons
   - Include visual statistics, progress bars, and infographic elements
   - Perfect for creative professionals and designers

5. TARGETED RESUME:
   - Highly customized for the specific job posting
   - Mirror the job description language exactly
   - Include specific keywords and phrases from the posting
   - Tailor every section to match job requirements
   - Perfect for highly competitive positions

ATS OPTIMIZATION REQUIREMENTS FOR ALL TEMPLATES:
1. Use standard section headers appropriate for each template type
2. Include 8-10 relevant keywords from the job description naturally
3. Use action verbs: "Developed", "Implemented", "Led", "Managed", "Optimized", "Delivered", "Collaborated"
4. Quantify achievements with numbers, percentages, and metrics
5. Match job title keywords exactly where possible
6. Use industry-standard terminology and company-specific language
7. Keep formatting simple and ATS-friendly
8. Include relevant technical skills prominently
9. Tailor professional summary to company culture and values
10. Use company-specific terminology and buzzwords

Return the resumes as a JSON object with the following structure:
{
  "resumes": {
    "reverseChronological": {
      "templateType": "Reverse-Chronological",
      "description": "Focus on work history in reverse chronological order with career progression",
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State/Country",
      "summary": "Compelling professional summary tailored to the job and company culture",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "duration": "Start Date - End Date",
          "description": "Detailed description of responsibilities and achievements with metrics"
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "year": "Graduation Year",
          "description": "Additional details if relevant"
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Project description",
          "technologies": ["Tech 1", "Tech 2"],
          "duration": "Project duration"
        }
      ],
      "certifications": [
        {
          "name": "Certification Name",
          "issuer": "Issuing Organization",
          "year": "Year obtained"
        }
      ]
    },
    "functional": {
      "templateType": "Functional",
      "description": "Focus on skills and abilities rather than work history",
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State/Country",
      "summary": "Skills-focused summary highlighting transferable abilities",
      "skillCategories": {
        "Technical Skills": ["Skill 1", "Skill 2", "Skill 3"],
        "Leadership Skills": ["Skill 1", "Skill 2"],
        "Project Management": ["Skill 1", "Skill 2"]
      },
      "achievements": [
        {
          "category": "Technical Achievements",
          "description": "Specific achievement with metrics"
        }
      ],
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "duration": "Start Date - End Date",
          "description": "Brief description focusing on relevant skills"
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "year": "Graduation Year"
        }
      ]
    },
    "combination": {
      "templateType": "Combination",
      "description": "Blend of chronological and functional formats",
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State/Country",
      "summary": "Comprehensive summary highlighting both skills and experience",
      "coreCompetencies": ["Skill 1", "Skill 2", "Skill 3"],
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "duration": "Start Date - End Date",
          "description": "Detailed description showing skill application",
          "keyAchievements": ["Achievement 1", "Achievement 2"]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "year": "Graduation Year"
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Project description",
          "technologies": ["Tech 1", "Tech 2"]
        }
      ]
    },
    "infographic": {
      "templateType": "Infographic",
      "description": "Visual representation of skills and experience",
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State/Country",
      "summary": "Creative summary highlighting visual and design skills",
      "skillLevels": {
        "JavaScript": 90,
        "React": 85,
        "Node.js": 80,
        "Python": 75
      },
      "visualStats": {
        "yearsExperience": 5,
        "projectsCompleted": 25,
        "clientsServed": 15,
        "certifications": 8
      },
      "achievementChart": {
        "leadership": 85,
        "technical": 90,
        "communication": 88,
        "creativity": 92
      },
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "duration": "Start Date - End Date",
          "description": "Visual-focused description with creative elements",
          "achievements": ["Achievement 1", "Achievement 2"],
          "visualMetrics": {
            "teamSize": 8,
            "projectsLed": 12,
            "revenueGenerated": "$500K"
          }
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "year": "Graduation Year",
          "gpa": "3.8",
          "honors": ["Dean's List", "Academic Excellence"]
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Creative project description",
          "technologies": ["Tech 1", "Tech 2"],
          "visualElements": ["Chart", "Graph", "Design"],
          "impact": {
            "users": 1000,
            "rating": 4.8,
            "downloads": 5000
          }
        }
      ],
      "certifications": [
        {
          "name": "Certification Name",
          "issuer": "Issuing Organization",
          "year": "Year obtained",
          "badge": "Visual badge representation"
        }
      ]
    },
    "targeted": {
      "templateType": "Targeted",
      "description": "Highly customized for the specific job posting",
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State/Country",
      "summary": "Job-specific summary using exact keywords from the posting",
      "keyQualifications": ["Qualification 1", "Qualification 2", "Qualification 3"],
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "duration": "Start Date - End Date",
          "description": "Description using job posting language and keywords",
          "relevantAchievements": ["Achievement 1", "Achievement 2"]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "year": "Graduation Year",
          "relevance": "How this education relates to the job"
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Project description using job-specific terminology",
          "technologies": ["Tech 1", "Tech 2"],
          "relevance": "How this project relates to the job requirements"
        }
      ]
    }
  }
}

Make sure each resume template is specifically tailored for the ${jobDetails.title} position at ${jobDetails.company}. Use company-specific language, culture, and requirements for each template type.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let resumeData;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resumeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: create basic resume structures for all 5 templates
      const baseResume = {
        name: userProfile.name || 'Your Name',
        email: userProfile.email || 'your.email@example.com',
        phone: userProfile.phone || 'Your Phone',
        location: userProfile.location || 'Your Location',
        summary: `Experienced professional seeking ${jobDetails.title} position at ${jobDetails.company}. ${userProfile.summary || 'Passionate about delivering high-quality results and contributing to team success.'}`,
        skills: userProfile.skills || ['Relevant Skill 1', 'Relevant Skill 2', 'Relevant Skill 3'],
        experience: userProfile.experience || [
          {
            title: 'Your Previous Role',
            company: 'Previous Company',
            duration: 'Duration',
            description: 'Key responsibilities and achievements relevant to the target position.'
          }
        ],
        education: userProfile.education || [
          {
            degree: 'Your Degree',
            institution: 'Your Institution',
            year: 'Year',
            description: 'Relevant academic achievements'
          }
        ],
        projects: userProfile.projects || [],
        certifications: []
      };

      resumeData = {
        resumes: {
          reverseChronological: {
            templateType: "Reverse-Chronological",
            description: "Focus on work history in reverse chronological order with career progression",
            ...baseResume
          },
          functional: {
            templateType: "Functional",
            description: "Focus on skills and abilities rather than work history",
            ...baseResume,
            skillCategories: {
              "Technical Skills": baseResume.skills.slice(0, 3),
              "Leadership Skills": baseResume.skills.slice(3, 5),
              "Project Management": baseResume.skills.slice(5, 7)
            }
          },
          combination: {
            templateType: "Combination",
            description: "Blend of chronological and functional formats",
            ...baseResume,
            coreCompetencies: baseResume.skills.slice(0, 5)
          },
          infographic: {
            templateType: "Infographic",
            description: "Visual representation of skills and experience",
            ...baseResume,
            skillLevels: {
              "JavaScript": 90,
              "React": 85,
              "Node.js": 80,
              "Python": 75
            },
            visualStats: {
              yearsExperience: 3,
              projectsCompleted: 15,
              clientsServed: 8,
              certifications: 5
            },
            achievementChart: {
              leadership: 85,
              technical: 90,
              communication: 88,
              creativity: 92
            }
          },
          targeted: {
            templateType: "Targeted",
            description: "Highly customized for the specific job posting",
            ...baseResume,
            keyQualifications: baseResume.skills.slice(0, 3)
          }
        }
      };
    }

    return Response.json({ 
      success: true, 
      resumes: resumeData.resumes,
      message: '5 resume templates generated successfully'
    });

  } catch (error) {
    console.error('Error generating resume:', error);
    return Response.json({ 
      error: 'Failed to generate resume',
      details: error.message 
    }, { status: 500 });
  }
}
