const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://66.102.139.243:5000';

export const API_ENDPOINTS = {
  GET_PROMPT: `${API_BASE_URL}/getPrompt`,
  UPDATE_PROMPT: `${API_BASE_URL}/chngPrompt`,
  CHAT: `${API_BASE_URL}/chat`,
  CHAT_STREAM: `${API_BASE_URL}/chat-stream`,
  UPLOAD_AUDIO: `${API_BASE_URL}/upload-audio`,
  UPLOAD_DOCX: `${API_BASE_URL}/upload-docx`,
  UPLOAD_RECORDED_AUDIO: `${API_BASE_URL}/upload-recorded-audio`,
  TEXT_TO_SPEECH: `${API_BASE_URL}/stream-text-to-speech`,
};

export const apiService = {
  getPrompt: async () => {
    const response = await fetch(API_ENDPOINTS.GET_PROMPT);
    if (!response.ok) throw new Error('Failed to fetch prompt');
    return response.json();
  },

  updatePrompt: async (prompt: string) => {
    const response = await fetch(API_ENDPOINTS.UPDATE_PROMPT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('Failed to save prompt');
    return response.json();
  },

  streamChat: (query: string, userId: string) => {
    return fetch(API_ENDPOINTS.CHAT_STREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        thread_id: `user-${userId || "guest"}`
      }),
    });
  },

  textToSpeech: (text: string) => {
    return fetch(API_ENDPOINTS.TEXT_TO_SPEECH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: "alloy",
        instructions: "Speak in a natural, conversational tone"
      }),
    });
  }
};
