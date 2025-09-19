import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function POST(request) {
  try {
    const { resume } = await request.json();

    if (!resume) {
      return Response.json({ error: 'No resume data provided' }, { status: 400 });
    }

    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with name and contact info
          new Paragraph({
            children: [
              new TextRun({
                text: resume.name || 'Your Name',
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          
          // Contact Information
          new Paragraph({
            children: [
              new TextRun({
                text: `${resume.email || 'your.email@example.com'} | ${resume.phone || 'Your Phone'} | ${resume.location || 'Your Location'}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Professional Summary
          resume.summary ? new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          resume.summary ? new Paragraph({
            children: [
              new TextRun({
                text: resume.summary,
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }) : null,

          // Skills
          resume.skills && resume.skills.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          resume.skills && resume.skills.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: resume.skills.join(' • '),
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }) : null,

          // Experience
          resume.experience && resume.experience.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: 'EXPERIENCE',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          // Experience entries
          ...(resume.experience || []).map(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title || 'Job Title',
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.company || 'Company'} | ${exp.duration || 'Duration'}`,
                  italics: true,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            }),
            exp.description ? new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            }) : null,
          ]).flat().filter(Boolean),

          // Education
          resume.education && resume.education.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          // Education entries
          ...(resume.education || []).map(edu => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`,
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.year || 'Year'}${edu.description ? ` | ${edu.description}` : ''}`,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]).flat().filter(Boolean),

          // Projects
          resume.projects && resume.projects.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: 'PROJECTS',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          // Project entries
          ...(resume.projects || []).map(project => [
            new Paragraph({
              children: [
                new TextRun({
                  text: project.name || 'Project Name',
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: project.description || 'Project description',
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            }),
            project.technologies && project.technologies.length > 0 ? new Paragraph({
              children: [
                new TextRun({
                  text: `Technologies: ${project.technologies.join(', ')}`,
                  italics: true,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }) : null,
          ]).flat().filter(Boolean),

          // Certifications
          resume.certifications && resume.certifications.length > 0 ? new Paragraph({
            children: [
              new TextRun({
                text: 'CERTIFICATIONS',
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }) : null,

          // Certification entries
          ...(resume.certifications || []).map(cert => new Paragraph({
            children: [
              new TextRun({
                text: `${cert.name || 'Certification'} - ${cert.issuer || 'Issuer'} (${cert.year || 'Year'})`,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })),

        ].filter(Boolean),
      }],
    });

    // Generate the DOCX buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the DOCX file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="resume.docx"',
      },
    });

  } catch (error) {
    console.error('Error generating DOCX:', error);
    return Response.json({ 
      error: 'Failed to generate DOCX file',
      details: error.message 
    }, { status: 500 });
  }
}
