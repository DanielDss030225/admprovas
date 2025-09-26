import { ref, get, set, push, remove, update } from 'firebase/database';
import { database } from './firebase';

// Função para buscar todas as provas
export const getAllExams = async () => {
  try {
    const examsRef = ref(database, 'digitalExams');
    const snapshot = await get(examsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Converter o objeto em array com IDs
      return Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar provas:', error);
    throw error;
  }
};

// Função para buscar uma prova específica
export const getExamById = async (examId) => {
  try {
    const examRef = ref(database, `digitalExams/${examId}`);
    const snapshot = await get(examRef);
    
    if (snapshot.exists()) {
      return {
        id: examId,
        ...snapshot.val()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar prova:', error);
    throw error;
  }
};

// Função para atualizar dados de uma prova
export const updateExam = async (examId, examData) => {
  try {
    const examRef = ref(database, `digitalExams/${examId}`);
    await update(examRef, examData);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar prova:', error);
    throw error;
  }
};

// Função para buscar questões de uma prova
export const getExamQuestions = async (examId) => {
  try {
    const questionsRef = ref(database, `digitalExams/${examId}/questions`);
    const snapshot = await get(questionsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Converter o objeto em array com IDs
      return Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    throw error;
  }
};

// Função para adicionar uma nova questão
export const addQuestion = async (examId, questionData) => {
  try {
    const questionsRef = ref(database, `digitalExams/${examId}/questions`);
    const newQuestionRef = push(questionsRef);
    await set(newQuestionRef, questionData);
    return newQuestionRef.key;
  } catch (error) {
    console.error('Erro ao adicionar questão:', error);
    throw error;
  }
};

// Função para atualizar uma questão
export const updateQuestion = async (examId, questionId, questionData) => {
  try {
    const questionRef = ref(database, `digitalExams/${examId}/questions/${questionId}`);
    await update(questionRef, questionData);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    throw error;
  }
};

// Função para remover uma questão
export const removeQuestion = async (examId, questionId) => {
  try {
    const questionRef = ref(database, `digitalExams/${examId}/questions/${questionId}`);
    await remove(questionRef);
    return true;
  } catch (error) {
    console.error('Erro ao remover questão:', error);
    throw error;
  }
};

// Função para criar uma nova prova
export const createExam = async (examData) => {
  try {
    const examsRef = ref(database, 'digitalExams');
    const newExamRef = push(examsRef);
    await set(newExamRef, examData);
    return newExamRef.key;
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    throw error;
  }
};

// Função para remover uma prova
export const removeExam = async (examId) => {
  try {
    const examRef = ref(database, `digitalExams/${examId}`);
    await remove(examRef);
    return true;
  } catch (error) {
    console.error('Erro ao remover prova:', error);
    throw error;
  }
};

