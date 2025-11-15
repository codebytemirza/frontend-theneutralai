// lib/api-service.ts

// ✅ Use relative URLs so requests go through Apache proxy
// This ensures all API calls go through https://theneutralai.com
const API_BASE_URL = ''; // Empty string means relative URLs

export const API_ENDPOINTS = {
  GET_PROMPT: `${API_BASE_URL}/getPrompt`,
  UPDATE_PROMPT: `${API_BASE_URL}/chngPrompt`,
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_STREAM: `${API_BASE_URL}/api/chat-stream`,
  UPLOAD_AUDIO: `${API_BASE_URL}/upload-audio`,
  UPLOAD_DOCX: `${API_BASE_URL}/upload-docx`,
  UPLOAD_RECORDED_AUDIO: `${API_BASE_URL}/upload-recorded-audio`,
  TEXT_TO_SPEECH: `${API_BASE_URL}/stream-text-to-speech`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_VERIFY: `${API_BASE_URL}/auth/verify`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_RESEND_CODE: `${API_BASE_URL}/auth/resend-code`,
  AUTH_RESET_REQUEST: `${API_BASE_URL}/auth/reset-password-request`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  GET_UPLOAD_HISTORY: `${API_BASE_URL}/get-upload-history`,
  DELETE_UPLOAD: `${API_BASE_URL}/delete-upload`,
  HEALTH: `${API_BASE_URL}/health`,
  RAG_HEALTH: `${API_BASE_URL}/rag-health`,
};

export const apiService = {
  /**
   * Get current prompt
   */
  getPrompt: async () => {
    const response = await fetch(API_ENDPOINTS.GET_PROMPT);
    if (!response.ok) throw new Error('Failed to fetch prompt');
    return response.json();
  },

  /**
   * Update prompt
   */
  updatePrompt: async (prompt: string) => {
    const response = await fetch(API_ENDPOINTS.UPDATE_PROMPT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('Failed to save prompt');
    return response.json();
  },

  /**
   * Stream chat with AI
   */
  streamChat: (query: string, userId: string) => {
    return fetch(API_ENDPOINTS.CHAT_STREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        thread_id: `user-${userId || 'guest'}`,
        use_web_search: true
      })
    });
  },

  /**
   * Text to speech
   */
  textToSpeech: (text: string, voice: string = 'coral') => {
    return fetch(API_ENDPOINTS.TEXT_TO_SPEECH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        instructions: 'Speak in a natural, conversational tone',
        response_format: 'mp3'
      })
    });
  },

  /**
   * Regular chat (non-streaming)
   */
  async chat(query: string, threadId: string, useWebSearch: boolean = true) {
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        thread_id: threadId,
        use_web_search: useWebSearch
      })
    });
    return response.json();
  },

  /**
   * User authentication - Register
   */
  async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  /**
   * User authentication - Verify email
   */
  async verify(email: string, code: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    });
    return response.json();
  },

  /**
   * User authentication - Login
   */
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  /**
   * User authentication - Resend verification code
   */
  async resendCode(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  /**
   * Password reset - Request reset code
   */
  async resetPasswordRequest(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  /**
   * Password reset - Reset with code
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        code, 
        new_password: newPassword 
      })
    });
    return response.json();
  },

  /**
   * Upload DOCX file
   */
  async uploadDocx(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-docx`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  /**
   * Upload audio file
   */
  async uploadAudio(file: File, language: string = 'en') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/upload-audio`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  /**
   * Get upload history
   */
  async getUploadHistory(limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/get-upload-history?limit=${limit}`);
    return response.json();
  },

  /**
   * Delete upload
   */
  async deleteUpload(uploadId: number) {
    const response = await fetch(`${API_BASE_URL}/delete-upload/${uploadId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  /**
   * RAG health check
   */
  async ragHealthCheck() {
    const response = await fetch(`${API_BASE_URL}/rag-health`);
    return response.json();
  }
};

export default apiService;