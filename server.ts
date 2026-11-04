import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  generateGroundedChatFallback,
  generateGroundedSummaryFallback,
  generateGroundedQuizFallback,
  generateGroundedQuestionBankFallback,
  generateGroundedExplainerFallback,
  generateGroundedStudyPlanFallback,
} from './groundedFallbacks.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configure body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer storage in memory for uploaded syllabus PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/octet-stream',
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(pdf|txt|md)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, or MD files are supported.'));
    }
  },
});

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please ensure it is set in Settings > Secrets or environment variables.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

app.get('/api/health', (req, res) => {
  res.json({
    hasKey: !!process.env.GEMINI_API_KEY,
    keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 6) + '...' : 'none',
    port: PORT,
  });
});

app.get('/api/test-gemini', async (req, res) => {
  const model = (req.query.model as string) || 'gemini-3.8-flash';
  const start = Date.now();
  try {
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model,
      contents: 'Respond with just the word OK.',
    });
    res.json({ model, text: result.text, elapsedMs: Date.now() - start });
  } catch (err: any) {
    res.status(500).json({ model, error: err.message, elapsedMs: Date.now() - start });
  }
});

// Helper to run generateContent with fast timeout and fallback
async function generateContentWithRetry(params: any): Promise<any> {
  const ai = getGeminiClient();
  const modelsToTry = [params.model || 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini] Attempting ${model}...`);
      const apiCall = ai.models.generateContent({
        ...params,
        model,
      });

      // 4.5-second timeout to avoid long hanging requests when 503 spikes occur
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4500)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);
      console.log(`[Gemini] Successfully received response from ${model}`);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      console.warn(`[Gemini] Notice with ${model}:`, errMsg.slice(0, 120));
      // Try next model immediately
    }
  }

  throw lastError || new Error('All Gemini models unavailable');
}

// PDF parsing helper using dynamic import of pdf-parse
async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<{ text: string; numpages: number; info?: any }> {
  // If plain text or markdown, decode directly
  if (
    mimetype === 'text/plain' ||
    mimetype === 'text/markdown' ||
    filename.match(/\.(txt|md)$/i)
  ) {
    const raw = buffer.toString('utf-8');
    return {
      text: raw,
      numpages: 1,
      info: { title: filename },
    };
  }

  // Parse PDF
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      numpages: data.numpages || 1,
      info: data.info || {},
    };
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    throw new Error(
      `Failed to parse PDF document: ${err.message || 'Unknown parsing error'}. Ensure the file is not password-protected or corrupt.`
    );
  }
}

// 1. API: PDF Upload and Text Extraction
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const parsed = await extractTextFromBuffer(buffer, originalname, mimetype);
    const cleanedText = parsed.text.trim();

    if (!cleanedText || cleanedText.length < 15) {
      return res.status(422).json({
        error:
          'The uploaded PDF appears to be empty or contains only scanned images without an embedded text layer. Please upload a PDF containing selectable text or syllabus text.',
        filename: originalname,
        characterCount: 0,
      });
    }

    // Identify detected units/headings roughly for UI quick chips
    const unitMatches =
      cleanedText.match(
        /(?:Unit|Module|Chapter|Week|Section)\s*[0-9IVXLCDM]+[:\s\-–—][^\n]+/gi
      ) || [];
    const uniqueUnits = Array.from(new Set(unitMatches.map((u) => u.trim()))).slice(
      0,
      12
    );

    return res.json({
      success: true,
      filename: originalname,
      fileSize: size,
      numPages: parsed.numpages,
      characterCount: cleanedText.length,
      textSnippet: cleanedText.slice(0, 400) + '...',
      extractedText: cleanedText,
      detectedUnits: uniqueUnits,
    });
  } catch (error: any) {
    console.error('Error in /api/upload-pdf:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process syllabus upload.',
    });
  }
});

// 2. API: Grounded AI Study Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, syllabusText, documentName } = req.body;

    if (!syllabusText || typeof syllabusText !== 'string') {
      return res.status(400).json({
        error:
          'No syllabus context provided. Please upload a syllabus PDF first.',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Conversation history is empty.' });
    }

    const ai = getGeminiClient();

    // Prepare system instruction strictly emphasizing academic grounding
    const systemInstruction = `You are StudyMate AI, a high-precision academic study assistant for college students.
You are assisting a student with their course syllabus: "${documentName || 'Course Syllabus'}".

CRITICAL GROUNDING RULES:
1. Your answers MUST BE STRICTLY GROUNDED in the provided syllabus text.
2. DO NOT invent, assume, extrapolate, or hallucinate dates, grading percentages, textbook editions, instructors, exam schedules, or policies that do not appear in the text.
3. IF THE ANSWER IS NOT PRESENT OR ONLY PARTIALLY PRESENT:
   - You MUST explicitly state: "This information is not specified in the uploaded syllabus for ${documentName || 'this course'}."
   - Never fabricate details. If the student asks about something external (e.g. "What is the professor's home address?" or "What date is Thanksgiving break?"), state clearly that the document does not contain this.
4. When answering academic syllabus queries:
   - Provide clear, direct, and well-structured answers (use bold headings, bullet points, and brief quotations from the text where helpful).
   - If citing units, reference the unit or module name from the syllabus.
   - Be encouraging, academic, and articulate.

SYLLABUS CONTENT:
"""
${syllabusText.slice(0, 75000)}
"""`;

    // Format chat history into contents
    // Last message is the current prompt
    const contents: any[] = [];
    const recentHistory = messages.slice(-10); // Keep last 10 messages for context

    for (let i = 0; i < recentHistory.length; i++) {
      const msg = recentHistory[i];
      const role = msg.role === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply =
      response.text ||
      'I apologize, but I could not formulate a response based on the syllabus.';

    return res.json({ reply });
  } catch (error: any) {
    console.warn('API error in /api/chat, applying grounded syllabus fallback:', error.message);
    try {
      const fallbackReply = generateGroundedChatFallback(
        req.body.messages || [],
        req.body.syllabusText || '',
        req.body.documentName || 'Course Syllabus'
      );
      return res.json({ reply: fallbackReply });
    } catch {
      return res.status(500).json({
        error: error.message || 'An error occurred while generating the response from Gemini.',
      });
    }
  }
});

// 3. API: Syllabus Summaries (Full or Unit-specific)
app.post('/api/study-tools/summary', async (req, res) => {
  try {
    const { syllabusText, documentName, scope, unitQuery } = req.body;

    if (!syllabusText) {
      return res.status(400).json({ error: 'Syllabus text is required.' });
    }

    const ai = getGeminiClient();

    let prompt = '';
    if (scope === 'unit' && unitQuery) {
      prompt = `Focus specifically on Unit / Module: "${unitQuery}".
Extract and synthesize:
1. Unit Title & Estimated Timeline/Hours (if mentioned)
2. Core Topics & Subtopics covered in this unit
3. Key Learning Objectives & Competencies
4. Essential Terminology / Formulae / Concepts to master
5. High-Yield Exam Focus Points (what professors typically test from this unit)

Ensure every item matches the syllabus text. If specific sub-points are not specified in the text, summarize what is provided accurately.`;
    } else {
      prompt = `Provide a comprehensive, high-yield academic executive summary of this complete syllabus for "${documentName || 'Course'}".
Synthesize into these structured sections:
1. Course Overview & Key Objectives
2. Grading Scheme & Assessment Breakdown (Assignments, Midterms, Finals, Weights)
3. Course Modules / Units Summary (A concise bullet breakdown of each major unit)
4. Recommended Textbooks & Required Software / Tools
5. Important Course Policies (Attendance, Late Submissions, Academic Integrity)
6. Student Success Strategy (How to get an A in this course based on the structure)`;
    }

    const systemInstruction = `You are StudyMate AI, an academic syllabus analyst.
Provide a thorough, beautifully formatted Markdown summary strictly based on the syllabus.
Do not hallucinate details not found in the syllabus.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `SYLLABUS CONTENT:\n"""\n${syllabusText.slice(0, 75000)}\n"""\n\nTASK:\n${prompt}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
      },
    });

    return res.json({
      summary: response.text || 'Unable to generate summary.',
      scope: scope || 'full',
      unitQuery: unitQuery || null,
    });
  } catch (error: any) {
    console.warn('API error in /api/study-tools/summary, applying grounded summary fallback:', error.message);
    const fallbackSummary = generateGroundedSummaryFallback(
      req.body.syllabusText || '',
      req.body.documentName || 'Course Syllabus',
      req.body.scope || 'full',
      req.body.unitQuery
    );
    return res.json({
      summary: fallbackSummary,
      scope: req.body.scope || 'full',
      unitQuery: req.body.unitQuery || null,
    });
  }
});

// 4. API: Generate Interactive Practice Quiz (MCQs)
app.post('/api/study-tools/quiz', async (req, res) => {
  try {
    const { syllabusText, documentName, numQuestions = 5, difficulty = 'medium', unitFocus } = req.body;

    if (!syllabusText) {
      return res.status(400).json({ error: 'Syllabus text is required.' });
    }

    const focusText = unitFocus
      ? `Focus specifically on the topics within "${unitFocus}".`
      : 'Cover the major units and topics distributed across the entire syllabus.';

    const prompt = `Generate an interactive multiple-choice practice quiz with exactly ${numQuestions} questions based directly on the concepts, topics, and objectives outlined in the syllabus for "${documentName || 'Course'}".
Difficulty level: ${difficulty}.
${focusText}

Requirements for each question:
- question: Clear, conceptual question directly testing knowledge in the syllabus topics.
- options: Exactly 4 distinct plausible options (A, B, C, D).
- correctAnswerIndex: The 0-based index of the correct option (0, 1, 2, or 3).
- explanation: Detailed explanation of why this option is correct and why other options are incorrect.
- unitRef: The unit/topic name from the syllabus that this question tests.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `SYLLABUS CONTENT:\n"""\n${syllabusText.slice(0, 75000)}\n"""\n\nTASK:\n${prompt}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are an expert university examiner creating a practice quiz directly based on the course syllabus. Return ONLY a valid JSON object matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  unitRef: { type: Type.STRING },
                },
                required: [
                  'id',
                  'question',
                  'options',
                  'correctAnswerIndex',
                  'explanation',
                  'unitRef',
                ],
              },
            },
          },
          required: ['quizTitle', 'questions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{"questions":[]}');
    return res.json(parsedData);
  } catch (error: any) {
    console.warn('API notice in /api/study-tools/quiz, applying grounded quiz fallback:', error.message);
    const fallbackQuiz = generateGroundedQuizFallback(
      req.body.syllabusText || '',
      req.body.documentName || 'Course Syllabus',
      Number(req.body.numQuestions) || 5,
      req.body.difficulty || 'medium',
      req.body.unitFocus
    );
    return res.json(fallbackQuiz);
  }
});

// 5. API: Exam Question Bank (Short & Long Answer with Model Answers)
app.post('/api/study-tools/question-bank', async (req, res) => {
  try {
    const { syllabusText, documentName, unitFocus } = req.body;

    if (!syllabusText) {
      return res.status(400).json({ error: 'Syllabus text is required.' });
    }

    const focusText = unitFocus
      ? `Focus specifically on the topics within "${unitFocus}".`
      : 'Sample questions across all primary units found in the syllabus.';

    const prompt = `Create a university-level Exam Question Bank based on the syllabus for "${documentName || 'Course'}".
${focusText}

Provide:
1. 4 Short Answer Questions (typically 2-3 marks):
   - Definitions, distinctions, brief explanations, or core concepts.
   - Include: question, marks (e.g. "2 Marks"), expectedKeyPoints (array of key phrases or grading points), and sampleModelAnswer (concise 3-4 sentence exemplar).
2. 3 Long Answer / Analytical Questions (typically 7-10 marks):
   - Comprehensive analytical, design, derivation, scenario-based or problem-solving questions.
   - Include: question, marks (e.g. "10 Marks"), breakdownCriteria (what points earn full credit), and sampleModelAnswer (structured model answer with headings/steps).`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `SYLLABUS CONTENT:\n"""\n${syllabusText.slice(0, 75000)}\n"""\n\nTASK:\n${prompt}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are a university faculty member designing semester exam questions grounded in the syllabus topics. Return JSON according to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            shortAnswerQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  unitRef: { type: Type.STRING },
                  marks: { type: Type.STRING },
                  question: { type: Type.STRING },
                  expectedKeyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  sampleModelAnswer: { type: Type.STRING },
                },
                required: [
                  'id',
                  'unitRef',
                  'marks',
                  'question',
                  'expectedKeyPoints',
                  'sampleModelAnswer',
                ],
              },
            },
            longAnswerQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  unitRef: { type: Type.STRING },
                  marks: { type: Type.STRING },
                  question: { type: Type.STRING },
                  breakdownCriteria: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  sampleModelAnswer: { type: Type.STRING },
                },
                required: [
                  'id',
                  'unitRef',
                  'marks',
                  'question',
                  'breakdownCriteria',
                  'sampleModelAnswer',
                ],
              },
            },
          },
          required: ['title', 'shortAnswerQuestions', 'longAnswerQuestions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.warn('API notice in /api/study-tools/question-bank, applying grounded question bank fallback:', error.message);
    const fallbackBank = generateGroundedQuestionBankFallback(
      req.body.syllabusText || '',
      req.body.documentName || 'Course Syllabus',
      req.body.unitFocus
    );
    return res.json(fallbackBank);
  }
});

// 6. API: Explain Difficult Topics in Simple Language
app.post('/api/study-tools/explain', async (req, res) => {
  try {
    const { topic, syllabusText, style = 'freshman' } = req.body;

    if (!topic || !syllabusText) {
      return res.status(400).json({ error: 'Topic and syllabus text are required.' });
    }

    let styleInstruction = '';
    if (style === 'analogy') {
      styleInstruction =
        'Explain primarily using a memorable, everyday real-world analogy (e.g. cooking, sports, traffic, smartphones) before mapping it back to technical concepts.';
    } else if (style === 'eli5') {
      styleInstruction =
        'Explain in ultra-simple terms with zero unnecessary jargon, as if explaining to someone with no prior background.';
    } else {
      styleInstruction =
        'Explain like a supportive senior university mentor explaining to a first-year college student: friendly, intuitive, precise, yet devoid of confusing gatekeeping terminology.';
    }

    const prompt = `Topic to explain: "${topic}".
Syllabus Context:
"""
${syllabusText.slice(0, 75000)}
"""

Instruction:
${styleInstruction}

Structure the explanation into:
1. "The Big Picture" (1-2 sentences capturing what this is and why it exists)
2. "Real-World Analogy"
3. "Step-by-Step Breakdown" (Core mechanics / sub-concepts)
4. "Common Student Traps & Pitfalls" (Where students lose points in exams)
5. "Exam Memory Hook" (A quick mnemonic or mental trigger to remember it on the test)`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction:
          'You are an award-winning academic educator who specializes in breaking down complex college syllabus concepts into intuitive, lucid explanations.',
      },
    });

    return res.json({
      explanation: response.text || 'Unable to generate explanation.',
      topic,
      style,
    });
  } catch (error: any) {
    console.warn('API notice in /api/study-tools/explain, applying grounded explainer fallback:', error.message);
    const fallbackExp = generateGroundedExplainerFallback(
      req.body.topic || '',
      req.body.syllabusText || '',
      req.body.style || 'freshman'
    );
    return res.json({
      explanation: fallbackExp,
      topic: req.body.topic,
      style: req.body.style || 'freshman',
    });
  }
});

// 7. API: Structured Revision Plan
app.post('/api/study-tools/study-plan', async (req, res) => {
  try {
    const { syllabusText, documentName, totalDays = 14, hoursPerDay = 3 } = req.body;

    if (!syllabusText) {
      return res.status(400).json({ error: 'Syllabus text is required.' });
    }

    const prompt = `Create an actionable, day-by-day exam preparation & revision schedule based on the topics and units in "${documentName || 'Course'}".
Total timeline: ${totalDays} days.
Daily study commitment: ${hoursPerDay} hours per day.

Make sure:
- All major units from the syllabus are distributed logically (heavier units receive more focus).
- Schedule dedicated days for active recall, practice questions, and mock revision.
- Include specific learning targets for each day.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `SYLLABUS CONTENT:\n"""\n${syllabusText.slice(0, 75000)}\n"""\n\nTASK:\n${prompt}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are an academic coach designing an optimal spaced-repetition study schedule. Output clean, structured Markdown with tables and bullet points.',
      },
    });

    return res.json({
      plan: response.text || 'Unable to generate revision plan.',
    });
  } catch (error: any) {
    console.warn('API notice in /api/study-tools/study-plan, applying grounded revision plan fallback:', error.message);
    const fallbackPlan = generateGroundedStudyPlanFallback(
      req.body.syllabusText || '',
      req.body.documentName || 'Course Syllabus',
      Number(req.body.totalDays) || 14,
      Number(req.body.hoursPerDay) || 3
    );
    return res.json({
      plan: fallbackPlan,
    });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
