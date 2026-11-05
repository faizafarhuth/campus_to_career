import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '20mb' }));

  // API endpoint for Gemini resume skill-parser with PDF & model fallback support
  app.post('/api/parse-resume', async (req, res) => {
    try {
      const { resumeText, pdfBase64, selectedModel } = req.body;

      if (!resumeText?.trim() && !pdfBase64) {
        return res.status(400).json({ error: 'Please enter resume text or upload a PDF resume.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in the environment. Please check Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert technical talent assessor and Training & Placement (T&P) officer for engineering colleges in Visakhapatnam (Vizag), Andhra Pradesh, India.
Your mission is to parse unformatted student resumes (text or PDF) and standardize them into structured talent profiles for local Visakhapatnam SMEs (IT Corridor, Autonagar, Port area, Duvvada, Gajuwaka).
Extract the candidate's actual name, college, degree, and skills accurately from the provided resume text or PDF document. Reply in simple, professional English.`;

      const userPrompt = `Student Resume Content:
${resumeText ? `"""\n${resumeText.trim()}\n"""` : '[See attached PDF document]'}

Extract the student's technical qualifications and standardize the output strictly following this JSON schema:
- hard_skills: list of standardized technical skills & frameworks (e.g. ["Python", "SQL", "HTML", "React", "AutoCAD"])
- projects: list of objects with title and domain (e.g. [{"title": "Inventory App", "domain": "Retail/SME"}])
- readiness_score: one of "High", "Medium", or "Developing" based on project depth and skill relevance
- student_name: extracted or inferred student name (default to "Vizag Student Candidate" if not found)
- college: college name in Vizag (e.g., GVPCE, AU College of Engineering, ANITS, Gayatri, GITAM, MVGR, Raghu, or "Visakhapatnam Engineering College")
- branch: degree/branch (e.g., "B.Tech Computer Science", "B.Tech Mechanical", "B.Tech ECE")
- cgpa: academic score if mentioned (e.g. "8.2 CGPA" or "Not specified")
- summary: concise 1-2 sentence professional overview for SME recruiters
- recommended_vizag_roles: 2-3 suitable internship role titles in Vizag`;

      // Candidate models for high availability:
      // Priority 1: gemini-3.1-flash-lite (high throughput, low latency, not congested)
      // Priority 2: gemini-flash-latest (stable flash alias)
      // Priority 3: gemini-3.8-flash (original flash)
      const requestedModel = selectedModel || 'gemini-3.1-flash-lite';
      const fallbackModels = [
        requestedModel,
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      let lastError: any = null;
      let responseText: string | undefined;
      let successfulModel = requestedModel;

      // Prepare contents array
      const contentsParts: any[] = [];
      if (pdfBase64) {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        });
      }
      contentsParts.push({ text: systemPrompt + '\n\n' + userPrompt });

      // Try candidate models with fallback
      for (const modelName of fallbackModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsParts,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  hard_skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Clean list of technical skills',
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        domain: { type: Type.STRING },
                      },
                      required: ['title', 'domain'],
                    },
                    description: 'Key academic or personal projects',
                  },
                  readiness_score: {
                    type: Type.STRING,
                    description: 'High, Medium, or Developing',
                  },
                  student_name: {
                    type: Type.STRING,
                    description: 'Full name of candidate',
                  },
                  college: {
                    type: Type.STRING,
                    description: 'College institution name in Vizag',
                  },
                  branch: {
                    type: Type.STRING,
                    description: 'Academic branch or major',
                  },
                  cgpa: {
                    type: Type.STRING,
                    description: 'CGPA or academic percentage',
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Short 1-2 sentence professional summary',
                  },
                  recommended_vizag_roles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Recommended local internship roles in Vizag',
                  },
                },
                required: ['hard_skills', 'projects', 'readiness_score'],
              },
            },
          });

          responseText = response.text;
          if (responseText) {
            successfulModel = modelName;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} busy or failed:`, err?.message || err);
          lastError = err;
          // Short pause before trying next fallback model
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (!responseText) {
        let msg = lastError?.message || 'Gemini model is currently busy. Please try again.';
        try {
          const parsedErr = JSON.parse(msg);
          if (parsedErr?.error?.message) {
            msg = parsedErr.error.message;
          }
        } catch (_) {}
        throw new Error(msg);
      }

      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed, modelUsed: successfulModel });
    } catch (err: any) {
      console.error('Server resume parse error:', err.message);
      return res.status(500).json({
        error: err.message || 'Failed to process resume with Gemini AI.',
      });
    }
  });

  // API endpoint for SME to verify student's uploaded PDF resume with Gemini AI
  app.post('/api/verify-resume', async (req, res) => {
    try {
      const {
        candidateId,
        candidateName,
        college,
        role,
        company,
        requiredSkills,
        pdfBase64,
        resumeText,
        selectedModel,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in the environment. Please check Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert technical hiring auditor and Training & Placement verification officer for Visakhapatnam engineering colleges (GVPCE, AU College of Engineering, GITAM, ANITS, Gayatri, MVGR) and local Visakhapatnam SMEs (IT Corridor Rushikonda, Autonagar, Gajuwaka industrial belt).
Your job is to thoroughly cross-examine and verify a student's resume (PDF document or text) against the specific internship role requirements.
Verify whether the claimed skills, college credentials, and projects are authentic, credible, and properly matched to the role.
Identify verified skills (with concrete project evidence), unverified skills (skills listed without practical evidence, or required skills missing from the resume), provide authenticity notes, academic validation, and 3-4 pointed technical verification questions for the SME recruiter to ask during the interview.`;

      const reqSkillsList = Array.isArray(requiredSkills) ? requiredSkills.join(', ') : (requiredSkills || 'Standard technical skills');

      const userPrompt = `Target Internship:
- Role: ${role || 'Technical Intern'}
- Company: ${company || 'Visakhapatnam SME Partner'}
- Required Skills: ${reqSkillsList}

Candidate Info:
- Name: ${candidateName || 'Student Candidate'}
- College: ${college || 'Vizag Engineering College'}

Candidate Resume Data:
${resumeText ? `"""\n${resumeText.trim()}\n"""` : '[See attached student resume PDF document]'}

Perform a rigorous verification audit and return strictly a JSON response conforming to the schema.`;

      const requestedModel = selectedModel || 'gemini-3.1-flash-lite';
      const fallbackModels = [
        requestedModel,
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      let lastError: any = null;
      let responseText: string | undefined;
      let successfulModel = requestedModel;

      const contentsParts: any[] = [];
      if (pdfBase64) {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        });
      }
      contentsParts.push({ text: systemPrompt + '\n\n' + userPrompt });

      for (const modelName of fallbackModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsParts,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  confidenceScore: {
                    type: Type.NUMBER,
                    description: 'Verification confidence score from 0 to 100',
                  },
                  verdict: {
                    type: Type.STRING,
                    description: 'One of: "Verified Match", "Verified with Minor Gaps", "Flagged for Review"',
                  },
                  skillsVerified: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Skills with demonstrable evidence in projects or coursework',
                  },
                  skillsUnverified: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Role requirements not evidenced or unverified claims',
                  },
                  experienceAuthenticity: {
                    type: Type.STRING,
                    description: 'Evaluation of project credibility, realism, and student authorship',
                  },
                  academicValidation: {
                    type: Type.STRING,
                    description: 'Validation of degree, branch, and college background',
                  },
                  suggestedInterviewQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3-4 tailored technical verification questions to ask this candidate',
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Executive verification summary for the SME hiring manager',
                  },
                },
                required: [
                  'confidenceScore',
                  'verdict',
                  'skillsVerified',
                  'skillsUnverified',
                  'experienceAuthenticity',
                  'academicValidation',
                  'suggestedInterviewQuestions',
                  'summary',
                ],
              },
            },
          });

          responseText = response.text;
          if (responseText) {
            successfulModel = modelName;
            break;
          }
        } catch (err: any) {
          console.warn(`Verify model ${modelName} busy or failed:`, err?.message || err);
          lastError = err;
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (!responseText) {
        let msg = lastError?.message || 'Gemini model is currently busy. Please try again.';
        try {
          const parsedErr = JSON.parse(msg);
          if (parsedErr?.error?.message) {
            msg = parsedErr.error.message;
          }
        } catch (_) {}
        throw new Error(msg);
      }

      const parsed = JSON.parse(responseText);
      const report = {
        verifiedAt: new Date().toISOString(),
        verifiedBy: `Gemini AI Recruiter Auditor (${successfulModel})`,
        confidenceScore: Math.round(Number(parsed.confidenceScore) || 85),
        verdict: parsed.verdict || 'Verified Match',
        skillsVerified: Array.isArray(parsed.skillsVerified) ? parsed.skillsVerified : [],
        skillsUnverified: Array.isArray(parsed.skillsUnverified) ? parsed.skillsUnverified : [],
        experienceAuthenticity: parsed.experienceAuthenticity || 'Projects demonstrate practical student implementation.',
        academicValidation: parsed.academicValidation || 'Academic credentials consistent with Andhra Pradesh engineering curriculum.',
        suggestedInterviewQuestions: Array.isArray(parsed.suggestedInterviewQuestions) ? parsed.suggestedInterviewQuestions : [],
        summary: parsed.summary || 'Candidate verified against role specifications.',
        modelUsed: successfulModel,
      };

      return res.json({ success: true, report, modelUsed: successfulModel });
    } catch (err: any) {
      console.error('Server resume verification error:', err.message);
      return res.status(500).json({
        error: err.message || 'Failed to verify resume with Gemini AI.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dev server or static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Campus to Career server active at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
