import { NextResponse } from 'next/server';

// Gemini AI parsing function for accurate resume extraction
async function parseWithGemini(resumeText) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_API_KEY environment variable');
      throw new Error('Missing GOOGLE_API_KEY');
    }

    const prompt = `Extract structured resume data from the following text and return ONLY a valid JSON object with these exact fields:

{
  "fullName": "string",
  "email": "string", 
  "phone": "string",
  "location": "string",
  "summary": "string",
  "skills": ["string1", "string2", ...],
  "experience": [
    {
      "role": "string",
      "company": "string", 
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "startDate": "string", 
      "endDate": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": "string"
    }
  ]
}

Rules:
1. Extract the person's full name from the first few lines
2. Find email address using regex pattern
3. Find phone number in any format
4. Extract location (city, state/country)
5. Get professional summary/objective from summary/profile section
6. Extract all technical skills, programming languages, tools, frameworks
7. For experience: extract job titles, company names, dates, and job descriptions
8. For education: extract degrees, institutions, and graduation dates
9. For projects: extract project names, descriptions, and technologies used
10. Return ONLY the JSON object, no other text
11. If a field cannot be found, use empty string or empty array
12. Ensure all dates are in YYYY-MM format when possible

Resume text:
${resumeText}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the data
    return {
      fullName: parsedData.fullName || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      summary: parsedData.summary || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : []
    };

  } catch (error) {
    console.error('Gemini parsing error:', error);
    // Fallback to manual parsing if Gemini fails
    console.log('Falling back to manual parsing...');
    return parseResumeText(resumeText);
  }
}

// Manual resume parsing function (for DOCX files)
function parseResumeText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const email = text.match(emailRegex)?.[0] || '';
  
  // Extract phone number (multiple formats)
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g;
  const phone = text.match(phoneRegex)?.[0] || '';
  
  // Extract name (look for proper name patterns, not file names)
  let fullName = '';
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    // Skip if it looks like a file path or contains "PDF file"
    if (line.includes('PDF file') || line.includes('.pdf') || line.includes('\\') || line.includes('/')) {
      continue;
    }
    // Check if it looks like a name (2-4 words, starts with capital)
    const words = line.split(' ').filter(word => word.length > 0);
    if (words.length >= 2 && words.length <= 4 && /^[A-Z]/.test(words[0])) {
      fullName = line;
      break;
    }
  }
  
  // Extract location (look for city, state patterns)
  const locationRegex = /([A-Za-z\s]+),\s*([A-Za-z\s]{2,})/g;
  const location = text.match(locationRegex)?.[0] || '';
  
  // Extract skills (comprehensive tech skills list)
  const skillKeywords = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Dart', 'Julia',
    
    // Web Technologies
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Svelte', 'Ember',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Less', 'Bootstrap', 'Tailwind', 'Material-UI',
    
    // Backend Frameworks
    'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel', 'Symfony', 'Rails',
    'ASP.NET', 'NestJS', 'Koa', 'Hapi', 'Sails.js',
    
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'MariaDB',
    'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'Prisma', 'Sequelize', 'Mongoose',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Vagrant',
    
    // Tools & Version Control
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Slack',
    'Trello', 'Asana', 'Notion', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    
    // Mobile Development
    'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Cordova', 'PhoneGap', 'Android', 'iOS',
    
    // Data Science & AI
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
    'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'R Studio', 'Tableau', 'Power BI',
    
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'Microservices', 'REST API',
    'GraphQL', 'SOAP', 'WebSocket', 'OAuth', 'JWT',
    
    // Operating Systems
    'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS', 'Red Hat', 'Debian', 'Fedora',
    
    // Other Technologies
    'Blockchain', 'Web3', 'Solidity', 'Ethereum', 'Bitcoin', 'Cryptocurrency', 'NFT',
    'AR', 'VR', 'Unity', 'Unreal Engine', 'Blender', '3D Modeling'
  ];
  
  // Extract skills more accurately (look for skills section)
  let skills = [];
  const skillsKeywords = ['skills', 'technical skills', 'technologies', 'tools', 'programming languages'];
  let inSkillsSection = false;
  let skillsEndKeywords = ['experience', 'education', 'projects', 'certifications', 'awards', 'work'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if we're entering skills section
    if (skillsKeywords.some(keyword => line.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }
    
    // Check if we're leaving skills section
    if (inSkillsSection && skillsEndKeywords.some(keyword => line.includes(keyword))) {
      inSkillsSection = false;
      break;
    }
    
    if (inSkillsSection && line.length > 0) {
      // Extract skills from the skills section
      const foundSkills = skillKeywords.filter(skill => 
        line.toLowerCase().includes(skill.toLowerCase())
      );
      skills = skills.concat(foundSkills);
    }
  }
  
  // If no skills section found, fall back to searching entire text
  if (skills.length === 0) {
    skills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }
  
  // Remove duplicates
  skills = [...new Set(skills)];
  
  // Extract experience (improved logic)
  const experience = [];
  const experienceKeywords = ['experience', 'employment', 'work history', 'career', 'professional experience'];
  let inExperienceSection = false;
  let currentJob = null;
  let sectionEndKeywords = ['education', 'skills', 'projects', 'certifications', 'awards'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if we're entering experience section
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if we're leaving experience section
    if (inExperienceSection && sectionEndKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = false;
      if (currentJob) {
        experience.push(currentJob);
        currentJob = null;
      }
      continue;
    }
    
    if (inExperienceSection && line.length > 0) {
      // Look for job titles (more comprehensive patterns)
      const jobTitlePatterns = [
        'engineer', 'developer', 'manager', 'analyst', 'consultant', 'specialist',
        'director', 'lead', 'senior', 'junior', 'intern', 'coordinator', 'assistant',
        'architect', 'designer', 'programmer', 'administrator', 'supervisor'
      ];
      
      if (jobTitlePatterns.some(pattern => line.includes(pattern)) && line.length > 5) {
        if (currentJob) {
          experience.push(currentJob);
        }
        currentJob = {
          role: lines[i],
          company: '',
          startDate: '',
          endDate: '',
          description: ''
        };
      } else if (currentJob && !currentJob.company && line.length > 0 && !line.includes('20')) {
        // Company name (not a date)
        currentJob.company = lines[i];
      } else if (currentJob && line.includes('20')) {
        // Date pattern (YYYY or YYYY-YYYY)
        if (!currentJob.startDate) {
          currentJob.startDate = lines[i];
        } else if (!currentJob.endDate) {
          currentJob.endDate = lines[i];
        }
      } else if (currentJob && line.length > 15 && !line.includes('skills') && !line.includes('technologies')) {
        // Job description
        currentJob.description += lines[i] + ' ';
      }
    }
  }
  
  if (currentJob) {
    experience.push(currentJob);
  }
  
  // Extract education (improved logic)
  const education = [];
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree', 'qualification'];
  let inEducationSection = false;
  let currentEdu = null;
  let educationEndKeywords = ['experience', 'skills', 'projects', 'certifications', 'awards', 'work'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if we're entering education section
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    // Check if we're leaving education section
    if (inEducationSection && educationEndKeywords.some(keyword => line.includes(keyword))) {
      inEducationSection = false;
      if (currentEdu) {
        education.push(currentEdu);
        currentEdu = null;
      }
      continue;
    }
    
    if (inEducationSection && line.length > 0) {
      // Look for degree patterns
      const degreePatterns = [
        'bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma', 'certificate',
        'bsc', 'msc', 'mba', 'mca', 'btech', 'mtech', 'be', 'me', 'ba', 'ma'
      ];
      
      if (degreePatterns.some(pattern => line.includes(pattern)) && line.length > 5) {
        if (currentEdu) {
          education.push(currentEdu);
        }
        currentEdu = {
          degree: lines[i],
          institution: '',
          startDate: '',
          endDate: ''
        };
      } else if (currentEdu && !currentEdu.institution && line.length > 0 && !line.includes('20')) {
        // Institution name (not a date)
        currentEdu.institution = lines[i];
      } else if (currentEdu && line.includes('20')) {
        // Date pattern
        if (!currentEdu.startDate) {
          currentEdu.startDate = lines[i];
        } else if (!currentEdu.endDate) {
          currentEdu.endDate = lines[i];
        }
      }
    }
  }
  
  if (currentEdu) {
    education.push(currentEdu);
  }
  
  // Extract projects (improved logic)
  const projects = [];
  const projectKeywords = ['projects', 'portfolio', 'personal projects', 'project experience'];
  let inProjectSection = false;
  let currentProject = null;
  let projectEndKeywords = ['education', 'skills', 'experience', 'certifications', 'awards', 'work'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if we're entering projects section
    if (projectKeywords.some(keyword => line.includes(keyword))) {
      inProjectSection = true;
      continue;
    }
    
    // Check if we're leaving projects section
    if (inProjectSection && projectEndKeywords.some(keyword => line.includes(keyword))) {
      inProjectSection = false;
      if (currentProject) {
        projects.push(currentProject);
        currentProject = null;
      }
      continue;
    }
    
    if (inProjectSection && line.length > 0) {
      // Look for project names (lines that look like project titles)
      if (line.length > 5 && !line.includes('technologies') && !line.includes('description') && 
          !line.includes('skills') && !line.includes('tools') && !line.includes('20')) {
        if (currentProject) {
          projects.push(currentProject);
        }
        currentProject = {
          name: lines[i],
          description: '',
          technologies: ''
        };
      } else if (currentProject && (line.includes('technologies') || line.includes('tools') || line.includes('tech stack'))) {
        currentProject.technologies = lines[i].replace(/technologies?:?/i, '').replace(/tools?:?/i, '').replace(/tech stack:?/i, '').trim();
      } else if (currentProject && line.length > 10 && !line.includes('technologies') && !line.includes('tools')) {
        currentProject.description += lines[i] + ' ';
      }
    }
  }
  
  if (currentProject) {
    projects.push(currentProject);
  }
  
  // Extract summary (usually first paragraph or objective section)
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  let summary = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Take next few lines as summary
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].length > 10) {
          summary += lines[j] + ' ';
        }
      }
      break;
    }
  }
  
  // If no summary found, use first few lines
  if (!summary) {
    summary = lines.slice(0, 3).join(' ');
  }
  
  return {
    fullName: fullName,
    email: email,
    phone: phone,
    location: location,
    summary: summary.trim(),
    skills: skills,
    experience: experience,
    education: education,
    projects: projects
  };
}

export async function POST(request) {
  try {
    console.log('Parse API called');
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_API_KEY environment variable');
      return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 });
    }
    console.log('API key found:', apiKey ? 'Yes' : 'No');

    const contentType = request.headers.get('content-type') || '';
    let resumeText = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      resumeText = body.text || '';
    } else if (contentType.includes('text/plain')) {
      resumeText = await request.text();
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = file.name || '';
      const mime = file.type || '';

      try {
        if (mime === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          return NextResponse.json({ error: 'PDF files are not supported. Please upload a DOCX file for better parsing results.' }, { status: 415 });
        } else if (
          mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileName.toLowerCase().endsWith('.docx')
        ) {
          // DOCX: Direct parsing (no JSON conversion)
          const mammoth = (await import('mammoth')).default;
          const result = await mammoth.extractRawText({ buffer });
          resumeText = result.value || '';
        } else if (mime.startsWith('text/') || fileName.toLowerCase().endsWith('.txt')) {
          resumeText = buffer.toString('utf8');
        } else {
          return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 415 });
        }
      } catch (parseError) {
        console.error('File parsing error:', parseError);
        return NextResponse.json({ error: 'Failed to parse file', details: parseError.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 });
    }

    // Use Gemini AI for accurate DOCX parsing
    console.log('Resume text extracted:', resumeText.substring(0, 100) + '...');
    
    const parsedData = await parseWithGemini(resumeText);
    console.log('Gemini parsing successful');
    
    return NextResponse.json(parsedData);
  } catch (e) {
    console.error('Parse API error:', e);
    return NextResponse.json({ error: 'Parse failed', details: e.message }, { status: 500 });
  }
}


