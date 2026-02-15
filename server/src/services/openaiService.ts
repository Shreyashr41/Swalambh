import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
const isApiKeyValid = apiKey && apiKey !== 'your-openrouter-api-key-here' && apiKey.length > 10;

const openai = isApiKeyValid
  ? new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'DermaCare AI'
      }
    })
  : null;

// Mock mode flag for development without API key
const MOCK_MODE = !isApiKeyValid;
if (MOCK_MODE) {
  console.log('⚠️  OpenRouter API key not configured. Running in MOCK MODE - AI responses will be simulated.');
} else {
  console.log('✅ OpenRouter API configured successfully');
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnalysisResponse {
  riskLevel: 'low' | 'medium' | 'high';
  urgencyScore: number;
  confidenceScore: number;
  detectedConditions: string[];
  recommendations: string[];
  followUpQuestions: string[];
  summary: string;
}

export interface ImageAnalysisResponse {
  description: string;
  detectedAbnormalities: string[];
  affectedAreas: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
  severity: 'mild' | 'moderate' | 'severe';
  possibleConditions: string[];
  recommendations: string[];
}

const SYSTEM_PROMPT = `You are DermaCare, an advanced AI-powered healthcare triage assistant. Your role is to:

1. Welcome patients warmly and ask about their symptoms
2. Ask smart, relevant follow-up questions to gather comprehensive information
3. Analyze symptoms and provide preliminary assessments
4. Guide patients on urgency and recommended next steps
5. Never provide definitive diagnoses - always recommend professional consultation

Important guidelines:
- Be empathetic and reassuring
- Ask one or two questions at a time to avoid overwhelming the patient
- Focus on dermatological conditions but can handle general health queries
- Always emphasize that this is for informational purposes only
- Flag high-risk symptoms immediately (severe pain, rapidly spreading, signs of infection, etc.)
- Suggest seeking immediate medical attention when necessary

Format your responses in a conversational, easy-to-understand manner.`;

const FOLLOW_UP_PROMPT = `Based on the patient's symptoms, generate relevant follow-up questions to better understand their condition. Focus on:
- Duration (When did this start?)
- Progression (Is it getting worse, better, or staying the same?)
- Associated symptoms (Any pain, itching, fever, etc.?)
- Triggers (What makes it worse or better?)
- Medical history relevant to the symptom
- Previous treatments tried

Return as a JSON array of questions.`;

export const chatService = {
  async startConversation(): Promise<string> {
    if (MOCK_MODE) {
      return "Hello! I'm DermaCare, your AI healthcare assistant. I'm here to help you understand your symptoms and guide you towards appropriate care. How can I help you today? Please describe what's bothering you. (Note: Running in demo mode without OpenAI API)";
    }
    const response = await openai!.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'assistant',
          content:
            "Hello! I'm DermaCare, your AI healthcare assistant. I'm here to help you understand your symptoms and guide you towards appropriate care. How can I help you today? Please describe what's bothering you, and I'll ask some questions to better understand your situation.",
        },
      ],
      max_tokens: 500,
    });

    return (
      response.choices[0]?.message?.content ||
      "Hello! I'm DermaCare. How can I help you today?"
    );
  },

  async sendMessage(
    messages: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    if (MOCK_MODE) {
      const mockResponses = [
        "Thank you for sharing that information. To better understand your symptoms, could you tell me how long you've been experiencing this?",
        "I see. Have you noticed any changes in the affected area over time? Is it getting worse, better, or staying about the same?",
        "That's helpful to know. Are you experiencing any other symptoms like pain, itching, or fever?",
        "Based on what you've described, I'd recommend monitoring these symptoms. If they persist or worsen, please consult a healthcare professional. Is there anything else you'd like to discuss?",
      ];
      return mockResponses[Math.min(messages.length, mockResponses.length - 1)];
    }

    const conversationHistory = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await openai!.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: conversationHistory,
      max_tokens: 800,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that. Could you please try again?"
    );
  },

  async generateFollowUpQuestions(symptoms: string): Promise<string[]> {
    if (MOCK_MODE) {
      return [
        'When did you first notice this symptom?',
        'Has it changed or spread over time?',
        'Are you experiencing any pain or discomfort?',
        'Have you tried any treatments?',
      ];
    }

    const response = await openai!.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: FOLLOW_UP_PROMPT },
        {
          role: 'user',
          content: `Patient symptoms: ${symptoms}\n\nGenerate 3-5 relevant follow-up questions as a JSON array.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    try {
      const content = response.choices[0]?.message?.content || '[]';
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [
        'When did you first notice this?',
        'Has it changed over time?',
        'Are you experiencing any pain or discomfort?',
      ];
    } catch {
      return [
        'When did you first notice this?',
        'Has it changed over time?',
        'Are you experiencing any pain or discomfort?',
      ];
    }
  },

  async analyzeSymptoms(
    symptoms: string,
    conversationHistory: ChatMessage[]
  ): Promise<AnalysisResponse> {
    if (MOCK_MODE) {
      return {
        riskLevel: 'low',
        urgencyScore: 25,
        confidenceScore: 75,
        detectedConditions: ['Minor skin irritation (demo)', 'Possible allergic reaction (demo)'],
        recommendations: [
          'Keep the affected area clean and dry',
          'Avoid known irritants',
          'Monitor for any changes',
          'Consult a dermatologist if symptoms persist',
        ],
        followUpQuestions: [
          'Have you been exposed to any new products recently?',
        ],
        summary: 'Based on the symptoms described, this appears to be a minor condition. (Running in demo mode)',
      };
    }

    const analysisPrompt = `Based on the following conversation and symptoms, provide a comprehensive analysis.

Conversation history:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

Current symptoms summary: ${symptoms}

Provide your analysis in the following JSON format:
{
  "riskLevel": "low" | "medium" | "high",
  "urgencyScore": number (0-100),
  "confidenceScore": number (0-100),
  "detectedConditions": ["possible condition 1", "possible condition 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "followUpQuestions": ["question 1", "question 2"],
  "summary": "Brief summary of the assessment"
}

Remember:
- This is for triage purposes only
- Be conservative with risk assessments
- Always recommend professional consultation for anything beyond mild conditions
- Flag any red flags that require immediate attention`;

    const response = await openai!.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: analysisPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    try {
      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing analysis response:', error);
    }

    return {
      riskLevel: 'medium',
      urgencyScore: 50,
      confidenceScore: 60,
      detectedConditions: ['Unable to determine specific condition'],
      recommendations: [
        'Please consult a healthcare professional for accurate diagnosis',
      ],
      followUpQuestions: [
        'Can you provide more details about your symptoms?',
      ],
      summary:
        'Based on the information provided, we recommend consulting a healthcare professional for a thorough evaluation.',
    };
  },
};

export const imageAnalysisService = {
  async analyzeImage(
    imageBase64: string,
    symptoms?: string
  ): Promise<ImageAnalysisResponse> {
    if (MOCK_MODE) {
      return {
        description: 'Demo mode: Image received and processed. In production, this would provide AI-powered analysis of the uploaded image.',
        detectedAbnormalities: ['Sample abnormality (demo mode)'],
        affectedAreas: [
          {
            x: 30,
            y: 40,
            width: 20,
            height: 15,
            label: 'Area of interest (demo)',
            confidence: 85,
          },
        ],
        severity: 'mild',
        possibleConditions: ['Minor skin condition (demo)', 'Possible irritation (demo)'],
        recommendations: [
          'This is a demo analysis - please consult a healthcare professional',
          'Add your OpenAI API key for real AI-powered image analysis',
        ],
      };
    }

    const analysisPrompt = `You are a medical image analysis assistant. Analyze this image for potential dermatological or medical concerns.

${symptoms ? `Patient-reported symptoms: ${symptoms}` : ''}

Provide your analysis in the following JSON format:
{
  "description": "Detailed description of what is visible in the image",
  "detectedAbnormalities": ["abnormality 1", "abnormality 2"],
  "affectedAreas": [
    {
      "x": percentage from left (0-100),
      "y": percentage from top (0-100),
      "width": percentage width (0-100),
      "height": percentage height (0-100),
      "label": "description of the area",
      "confidence": confidence score (0-100)
    }
  ],
  "severity": "mild" | "moderate" | "severe",
  "possibleConditions": ["condition 1", "condition 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Important:
- Be thorough but cautious in your assessment
- Do not provide definitive diagnoses
- Always recommend professional consultation
- Flag any concerning features that require immediate attention`;

    try {
      const response = await openai!.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    }

    return {
      description: 'Image analysis could not be completed',
      detectedAbnormalities: [],
      affectedAreas: [],
      severity: 'mild',
      possibleConditions: ['Unable to determine'],
      recommendations: [
        'Please consult a healthcare professional for proper evaluation',
      ],
    };
  },

  async combineAnalysis(
    imageAnalysis: ImageAnalysisResponse,
    symptomAnalysis: AnalysisResponse
  ): Promise<AnalysisResponse> {
    if (MOCK_MODE) {
      // In mock mode, just return the symptom analysis with a note
      return {
        ...symptomAnalysis,
        summary: symptomAnalysis.summary + ' (Combined with image analysis in demo mode)',
      };
    }

    // Combine image and symptom analysis for comprehensive assessment
    const combinedPrompt = `Combine the following analyses into a comprehensive assessment:

Image Analysis:
${JSON.stringify(imageAnalysis, null, 2)}

Symptom Analysis:
${JSON.stringify(symptomAnalysis, null, 2)}

Provide a combined analysis in JSON format with:
- riskLevel (consider the higher risk from both analyses)
- urgencyScore (weighted average, leaning towards higher urgency)
- confidenceScore (based on alignment between image and symptom analysis)
- detectedConditions (combined and prioritized)
- recommendations (comprehensive list)
- followUpQuestions (if any additional info needed)
- summary (brief combined assessment)`;

    try {
      const response = await openai!.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: combinedPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error combining analyses:', error);
    }

    // Fallback to symptom analysis if combination fails
    return symptomAnalysis;
  },
};

export default { chatService, imageAnalysisService };
