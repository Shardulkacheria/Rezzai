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
You are an expert resume writer. Generate a tailored resume for the user based on their profile and the specific job they want to apply for.

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

INSTRUCTIONS:
1. Create a professional resume tailored specifically for this job
2. Highlight relevant skills and experience that match the job requirements
3. Use keywords from the job description naturally
4. Maintain a professional tone
5. Structure the resume with clear sections
6. Make the summary compelling and job-specific
7. Ensure all information is accurate and professional

Return the resume as a JSON object with the following structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "Phone Number",
  "location": "City, State/Country",
  "summary": "Compelling professional summary tailored to the job",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "description": "Detailed description of responsibilities and achievements"
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
}

Make sure the resume is specifically tailored for the ${jobDetails.title} position at ${jobDetails.company}. Focus on relevant experience and skills that match the job requirements.
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
      
      // Fallback: create a basic resume structure
      resumeData = {
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
    }

    return Response.json({ 
      success: true, 
      resume: resumeData,
      message: 'Resume generated successfully'
    });

  } catch (error) {
    console.error('Error generating resume:', error);
    return Response.json({ 
      error: 'Failed to generate resume',
      details: error.message 
    }, { status: 500 });
  }
}
