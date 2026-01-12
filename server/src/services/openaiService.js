import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * Break down a goal into structured daily tasks
 * @param {string} goal - The user's goal
 * @returns {Promise<Array>} Array of task objects
 */
export const generateTasksFromGoal = async (goal) => {
  try {
    const prompt = `
      Break down the following goal into 5-7 structured, actionable daily tasks.
      Return a JSON array of tasks, each with: title, description, priority (low/medium/high), and estimatedDays.
      
      Goal: ${goal}
      
      Return only valid JSON array, no additional text.
    `;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a productivity assistant that breaks goals into actionable tasks. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const tasks = JSON.parse(jsonContent);

    return tasks;
  } catch (error) {
    console.error('Error generating tasks from goal:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('model') || error.message?.includes('does not exist')) {
      throw new Error('OpenAI model error. Please check your API key has access to gpt-4o-mini.');
    }
    throw new Error(`Failed to generate tasks from goal: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Summarize meeting transcription and extract key points
 * @param {string} transcription - Full transcription text
 * @returns {Promise<Object>} Summary object with summary and keyPoints
 */
export const summarizeMeeting = async (transcription) => {
  try {
    // Validate transcription
    if (!transcription || typeof transcription !== 'string' || transcription.trim().length === 0) {
      throw new Error('Transcription is empty or invalid');
    }

    // If transcription is very short, provide a simple summary
    if (transcription.trim().length < 50) {
      return {
        summary: `Brief meeting transcription: ${transcription}`,
        keyPoints: [transcription],
        actionItems: [],
      };
    }

    const prompt = `
      Analyze the following meeting transcription and provide:
      1. A concise summary (2-3 paragraphs)
      2. Key points as a bulleted list (array of strings)
      3. Action items mentioned (if any) as an array of strings
      
      Transcription: ${transcription.substring(0, 15000)}${transcription.length > 15000 ? '... (truncated)' : ''}
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "summary": "summary text here",
        "keyPoints": ["point 1", "point 2"],
        "actionItems": ["action 1", "action 2"]
      }
    `;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a meeting assistant that summarizes meetings and extracts key information. You MUST return only valid JSON, no additional text or markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON object if wrapped in text
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error. Content:', jsonContent.substring(0, 200));
      // Fallback: create a basic summary
      result = {
        summary: `Meeting transcription: ${transcription.substring(0, 500)}${transcription.length > 500 ? '...' : ''}`,
        keyPoints: transcription.split('.').slice(0, 5).filter(p => p.trim().length > 10).map(p => p.trim()),
        actionItems: [],
      };
    }

    // Validate and normalize result structure
    return {
      summary: result.summary || result.Summary || 'No summary available',
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : 
                 Array.isArray(result.key_points) ? result.key_points :
                 Array.isArray(result.KeyPoints) ? result.KeyPoints : [],
      actionItems: Array.isArray(result.actionItems) ? result.actionItems :
                   Array.isArray(result.action_items) ? result.action_items :
                   Array.isArray(result.ActionItems) ? result.ActionItems : [],
    };
  } catch (error) {
    console.error('Error summarizing meeting:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('model') || error.message?.includes('does not exist')) {
      throw new Error('OpenAI model error. Please check your API key has access to gpt-4o-mini.');
    }
    throw new Error(`Failed to summarize meeting: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate meeting description and agenda from title
 * @param {string} title - Meeting title
 * @param {Array} participants - Array of participant names
 * @returns {Promise<Object>} Generated meeting details
 */
export const generateMeetingDescription = async (title, participants = []) => {
  try {
    const participantsInfo = participants.length > 0 
      ? `\nParticipants: ${participants.join(', ')}` 
      : '';

    const prompt = `
      Based on the meeting title "${title}"${participantsInfo}, generate:
      1. A detailed description of what this meeting should cover (2-3 paragraphs)
      2. A list of 4-6 key agenda items or discussion points
      3. 3-5 suggested action items or outcomes for this meeting
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "summary": "detailed description text",
        "keyPoints": ["agenda item 1", "agenda item 2", "..."],
        "actionItems": ["action 1", "action 2", "..."]
      }
    `;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional meeting coordinator that creates detailed meeting descriptions, agendas, and action items based on meeting titles. You MUST return only valid JSON, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON object if wrapped in text
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error. Content:', jsonContent.substring(0, 200));
      // Fallback: create a basic description
      result = {
        summary: `Meeting to discuss: ${title}${participantsInfo}`,
        keyPoints: [
          'Review current status',
          'Discuss key challenges',
          'Plan next steps',
          'Assign responsibilities'
        ],
        actionItems: [
          'Document discussion points',
          'Follow up on action items',
          'Schedule next meeting if needed'
        ],
      };
    }

    // Validate and normalize result structure
    return {
      summary: result.summary || result.Summary || `Meeting: ${title}`,
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : 
                 Array.isArray(result.key_points) ? result.key_points :
                 Array.isArray(result.KeyPoints) ? result.KeyPoints : [],
      actionItems: Array.isArray(result.actionItems) ? result.actionItems :
                   Array.isArray(result.action_items) ? result.action_items :
                   Array.isArray(result.ActionItems) ? result.ActionItems : [],
    };
  } catch (error) {
    console.error('Error generating meeting description:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('model') || error.message?.includes('does not exist')) {
      throw new Error('OpenAI model error. Please check your API key has access to gpt-4o-mini.');
    }
    throw new Error(`Failed to generate meeting description: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Classify expense category based on description
 * @param {string} description - Expense description
 * @returns {Promise<string>} Category name
 */
export const classifyExpense = async (description) => {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expense classifier. Classify expenses into one of these categories: food, transport, entertainment, shopping, bills, healthcare, education, travel, other. Return only the category name.',
        },
        {
          role: 'user',
          content: `Classify this expense: "${description}"`,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Error classifying expense:', error.message || error);
    // Return default category instead of throwing to prevent breaking the flow
    return 'other';
  }
};

/**
 * Generate budget insights based on expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {Promise<string>} Budget insights text
 */
export const generateBudgetInsights = async (expenses) => {
  try {
    const expensesSummary = expenses.map(e => ({
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date,
    }));

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor for an Indian user. Analyze expenses and provide actionable budget insights. IMPORTANT: Always use Indian Rupee (INR) currency and the rupee symbol (₹) for every amount. Do NOT use dollars ($). Keep the tone concise and professional.',
        },
        {
          role: 'user',
          content: `Analyze these expenses (currency: INR ₹) and provide budget insights. When listing amounts, prefix with the rupee symbol (₹). Do not use $ anywhere.\n${JSON.stringify(expensesSummary, null, 2)}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating budget insights:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('model') || error.message?.includes('does not exist')) {
      throw new Error('OpenAI model error. Please check your API key has access to gpt-4o-mini.');
    }
    throw new Error(`Failed to generate budget insights: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate email reply draft
 * @param {string} originalEmail - Original email content
 * @param {string} context - Additional context if needed
 * @returns {Promise<string>} Draft reply text
 */
export const generateEmailReply = async (originalEmail, context = '') => {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an email assistant. Generate professional, concise email replies. Keep replies under 150 words unless the situation requires more detail.',
        },
        {
          role: 'user',
          content: `Generate a reply to this email:\n\n${originalEmail}\n\n${context ? `Context: ${context}` : ''}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating email reply:', error.message || error);
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.');
    }
    if (error.message?.includes('model') || error.message?.includes('does not exist')) {
      throw new Error('OpenAI model error. Please check your API key has access to gpt-4o-mini.');
    }
    throw new Error(`Failed to generate email reply: ${error.message || 'Unknown error'}`);
  }
};

