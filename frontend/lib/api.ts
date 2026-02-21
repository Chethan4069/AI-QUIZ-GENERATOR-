import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-quiz-generator-bo8a.onrender.com', // Your Python Backend URL
});

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const generateQuiz = async (topic: string, difficulty: string, count: number, fileId: string) => { // <-- NEW
  const response = await api.post('/generate_quiz', {
    topic,
    difficulty,
    count,
    file_id: fileId, // <-- NEW
  });
  return response.data;
};

export default api;
export const saveQuiz = async (quizData: any) => {
  const response = await api.post('/save_quiz', quizData);
  return response.data;
};

export const getMyQuizzes = async () => {
  const response = await api.get('/my_quizzes');
  return response.data;
};

export const getQuizDetails = async (quizId: number) => {
  const response = await api.get(`/quiz/${quizId}`);
  return response.data;
};

export const submitQuizResult = async (quizId: number, score: number, total: number, answers: any) => {
  const response = await api.post('/submit_quiz', {
    quiz_id: quizId,
    score: score,
    total_questions: total,
    selected_options: answers
  });
  return response.data;
};

export const getQuizAnalytics = async (quizId: number) => {
  const response = await api.get(`/quiz/${quizId}/analytics`);
  return response.data;
};
export const deleteQuiz = async (quizId: number) => {
  const response = await api.delete(`/quiz/${quizId}`);
  return response.data;
};