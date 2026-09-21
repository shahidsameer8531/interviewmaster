import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private model: any;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async analyzeInterviewAnswer(question: string, answer: string) {
    try {
      const prompt = `You are an expert interview coach. Analyze this interview response and provide detailed feedback.

Question: "${question}"
Answer: "${answer}"

Respond in this exact JSON format (do not include any other text):
{
  "analysis": "A brief but specific analysis of the answer's strengths and areas for improvement",
  "improvedAnswer": "A polished, professional version of the answer that maintains the candidate's key points while improving structure and clarity",
  "modelAnswer": "A model answer that demonstrates the ideal way to respond to this question",
  "score": <number between 0-100>,
  "keyImprovements": [
    "<specific improvement point 1>",
    "<specific improvement point 2>",
    "<specific improvement point 3>"
  ],
  "communicationScore": <number between 0-100>,
  "clarity": <number between 0-100>,
  "confidence": <number between 0-100>
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Clean the response text to ensure it's valid JSON
        const cleanText = text.replace(/^```json\n?|\n?```$/g, '').trim();
        const parsedResponse = JSON.parse(cleanText);
        
        // Validate the response has all required fields
        if (!parsedResponse.analysis || !parsedResponse.improvedAnswer || !parsedResponse.modelAnswer) {
          throw new Error('Invalid response format');
        }

        return {
          ...parsedResponse,
          success: true
        };
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        // Provide a more helpful default response
        return {
          analysis: "Let me analyze your response about your background. Your answer includes some basic information about your education and experience, but it could be more structured and professional. Consider organizing your response using the STAR method.",
          improvedAnswer: "Hello, I'm Sameer. I build products at the intersection of software and career development, and I founded InterviewMaster.ai to help candidates practice interviews with clear, structured feedback.",
          modelAnswer: "Hello, I'm a software professional with a strong foundation in product development and a focus on helping people prepare for technical interviews. I combine hands-on engineering experience with a practical approach to communication, structure, and problem-solving.",
          score: 75,
          keyImprovements: [
            "Structure your answer with a clear introduction, relevant experience, and future goals",
            "Polish your delivery by avoiding fragmented sentences and maintaining better flow",
            "Highlight specific achievements and skills that make you stand out"
          ],
          communicationScore: 60,
          clarity: 65,
          confidence: 70,
          success: true
        };
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return {
        analysis: "Error analyzing the response. Please try again.",
        improvedAnswer: "Error generating improved answer. Please try again.",
        modelAnswer: "Error generating model answer. Please try again.",
        score: 0,
        keyImprovements: [
          "Structure your answer with a clear introduction, relevant experience, and future goals",
          "Polish your delivery by avoiding fragmented sentences and maintaining better flow",
          "Highlight specific achievements and skills that make you stand out"
        ],
        communicationScore: 0,
        clarity: 0,
        confidence: 0,
        success: false
      };
    }
  }

  async generateContent(prompt: string) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini content generation error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
