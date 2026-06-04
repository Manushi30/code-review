import { GoogleGenerativeAI } from '@google/generative-ai';

const LANGUAGE_MAP = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};

function buildPrompt(code, language, skillLevel) {
  const langName = LANGUAGE_MAP[language] || language;
  return `You are an expert programming mentor. Analyze the student's ${langName} code.
The student skill level is: ${skillLevel || 'Beginner'}.

Provide beginner-friendly feedback. Identify:
1. Logic Errors (incorrect logic, infinite loops, wrong conditions, unreachable code)
2. Syntax Issues (what/why/how to fix)
3. Code Quality (readability, naming conventions, structure, maintainability)
4. Performance (time/space complexity, optimization)
5. Best Practices (cleaner code, better names, modularization)

For each issue include: severity (High/Medium/Low), lineNumber, description, suggestedFix, aiFeedback.
Also provide learningInsights: commonMistakes (array), learningSuggestions (array), topicsToImprove (array).

Return ONLY valid JSON with this exact structure (no markdown):
{
  "overallScore": number 0-100,
  "breakdown": {
    "correctness": number 0-100,
    "readability": number 0-100,
    "efficiency": number 0-100,
    "bestPractices": number 0-100
  },
  "issues": [
    {
      "severity": "High|Medium|Low",
      "lineNumber": number,
      "category": "Logic|Syntax|Quality|Performance|Best Practices",
      "description": "string",
      "suggestedFix": "string",
      "aiFeedback": "string",
      "problem": "string",
      "explanation": "string",
      "solution": "string",
      "exampleFix": "string"
    }
  ],
  "improvedCode": "full improved code as string",
  "summary": "brief overall summary",
  "learningInsights": {
    "commonMistakes": ["string"],
    "learningSuggestions": ["string"],
    "topicsToImprove": ["string"]
  }
}

Student code:
\`\`\`${langName}
${code}
\`\`\``;
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object in Gemini response');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function analyzeCode({ code, language, skillLevel }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildPrompt(code, language, skillLevel);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJson(text);
}

export function countBugsFromAnalysis(analysis) {
  if (!analysis?.issues?.length) return 0;
  return analysis.issues.filter((i) =>
    ['High', 'Medium'].includes(i.severity)
  ).length;
}
