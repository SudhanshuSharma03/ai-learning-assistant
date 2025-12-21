import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from '../config/firebase';
import { QuizQuestion, StudyRecommendation, TopicProgress } from '../types';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
const model = genAI.getGenerativeModel({ model: geminiConfig.model });

// Chat with the AI Study Buddy
export async function chatWithStudyBuddy(
  message: string,
  context?: string,
  chatHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  try {
    const systemPrompt = `You are an AI Study Buddy - a friendly, knowledgeable, and encouraging educational assistant. Your role is to:

1. Help students understand complex concepts by breaking them down into simpler parts
2. Answer questions about any academic subject with clear explanations
3. Provide examples and analogies to make learning easier
4. Encourage students and celebrate their progress
5. Suggest study techniques and tips when appropriate
6. If the student seems confused, try explaining in a different way

Guidelines:
- Be patient and supportive
- Use clear, simple language
- Provide step-by-step explanations when needed
- Include relevant examples
- Ask clarifying questions if the query is unclear
- Format responses with markdown for better readability
- If you don't know something, admit it honestly

${context ? `\nContext from study materials:\n${context}` : ''}`;

    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const prompt = chatHistory && chatHistory.length > 0 
      ? message 
      : `${systemPrompt}\n\nStudent's question: ${message}`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error chatting with Study Buddy:', error);
    throw new Error('Failed to get response from AI. Please try again.');
  }
}

// Generate a quiz from study content
export async function generateQuizFromContent(
  content: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  subject?: string
): Promise<QuizQuestion[]> {
  try {
    const prompt = `You are an expert quiz generator for educational purposes. Based on the following study content, generate ${numQuestions} multiple-choice questions at ${difficulty} difficulty level.

Study Content:
${content}

${subject ? `Subject: ${subject}` : ''}

Generate questions that test understanding, not just memorization. Include a mix of:
- Conceptual questions
- Application questions
- Analysis questions

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, just the JSON):
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "topic": "Specific topic this question covers"
  }
]

Make sure:
- Each question has exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Explanations are educational and helpful
- Topics are specific and relevant`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const questions: QuizQuestion[] = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

// Extract key concepts from study material
export async function extractKeyConcepts(content: string): Promise<string[]> {
  try {
    const prompt = `Analyze the following study material and extract the key concepts and topics covered.

Study Material:
${content}

Return ONLY a valid JSON array of strings representing the key concepts (no markdown, no code blocks):
["concept1", "concept2", "concept3", ...]

Focus on:
- Main topics and subtopics
- Important terms and definitions
- Key theories or principles
- Notable facts or formulas`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting concepts:', error);
    return [];
  }
}

// Generate study recommendations based on progress
export async function generateStudyRecommendations(
  progress: TopicProgress[],
  weakTopics: string[],
  recentTopics: string[]
): Promise<StudyRecommendation[]> {
  try {
    const prompt = `You are a personalized learning advisor. Based on the student's learning progress, generate study recommendations.

Current Progress:
${JSON.stringify(progress, null, 2)}

Weak Topics (need more practice):
${weakTopics.join(', ')}

Recently Studied Topics:
${recentTopics.join(', ')}

Generate 3-5 personalized study recommendations. Return ONLY a valid JSON array (no markdown):
[
  {
    "topic": "Topic name",
    "subject": "Subject area",
    "reason": "Why this is recommended",
    "priority": "high|medium|low",
    "suggestedResources": ["Resource 1", "Resource 2"],
    "estimatedTime": 30
  }
]

Prioritize:
1. Topics where the student is struggling
2. Topics that haven't been studied recently
3. Topics that build on what the student has already learned
4. Balance between strengthening weak areas and advancing knowledge`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// Summarize study content
export async function summarizeContent(content: string, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
  try {
    const wordCounts = { short: 100, medium: 250, long: 500 };
    
    const prompt = `Summarize the following study material in approximately ${wordCounts[length]} words. 

Study Material:
${content}

Create a clear, well-organized summary that:
- Highlights the main points
- Preserves key facts and definitions
- Uses bullet points for easy reading
- Maintains the logical flow of ideas`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw new Error('Failed to summarize content. Please try again.');
  }
}

// Explain a concept in simple terms
export async function explainConcept(concept: string, context?: string): Promise<string> {
  try {
    const prompt = `Explain the concept of "${concept}" in simple, easy-to-understand terms.

${context ? `Context: ${context}` : ''}

Your explanation should:
1. Start with a simple definition
2. Use an everyday analogy or example
3. Break down any complex parts
4. Provide a practical application
5. Include a "Key Takeaway" at the end

Format the response with clear headings and bullet points for readability.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error explaining concept:', error);
    throw new Error('Failed to explain concept. Please try again.');
  }
}

// Generate flashcards from content
export async function generateFlashcards(
  content: string,
  numCards: number = 10
): Promise<{ front: string; back: string }[]> {
  try {
    const prompt = `Create ${numCards} flashcards from the following study material.

Study Material:
${content}

Return ONLY a valid JSON array (no markdown, no code blocks):
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]

Create flashcards that:
- Cover key terms and definitions
- Include important facts and concepts
- Test understanding, not just memorization
- Are concise but complete`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
}
