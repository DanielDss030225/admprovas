import { useState } from 'react';
import ExamList from './components/ExamList';
import ExamDetail from './components/ExamDetail';
import ExamForm from './components/ExamForm';
import QuestionForm from './components/QuestionForm';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewMode, setViewMode] = useState('view');

  const handleSelectExam = (examId, mode = 'view') => {
    setSelectedExamId(examId);
    setViewMode(mode);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedExamId(null);
    setSelectedQuestion(null);
  };

  const handleBackToDetail = () => {
    setCurrentView('detail');
    setSelectedQuestion(null);
  };

  const handleCreateExam = () => {
    setSelectedExamId(null);
    setCurrentView('examForm');
  };

  const handleEditExam = (exam) => {
    setSelectedExamId(exam.id);
    setCurrentView('examForm');
  };

  const handleEditQuestion = (examId, question) => {
    setSelectedExamId(examId);
    setSelectedQuestion(question);
    setCurrentView('questionForm');
  };

  const handleCreateQuestion = (examId) => {
    setSelectedExamId(examId);
    setSelectedQuestion(null);
    setCurrentView('questionForm');
  };

  const handleExamSaved = () => {
    setCurrentView('list');
    setSelectedExamId(null);
  };

  const handleQuestionSaved = () => {
    setCurrentView('detail');
    setSelectedQuestion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'list' && (
          <ExamList
            onSelectExam={handleSelectExam}
            onCreateExam={handleCreateExam}
          />
        )}
        
        {currentView === 'detail' && selectedExamId && (
          <ExamDetail
            examId={selectedExamId}
            mode={viewMode}
            onBack={handleBackToList}
            onEditExam={handleEditExam}
            onEditQuestion={handleEditQuestion}
            onCreateQuestion={handleCreateQuestion}
          />
        )}

        {currentView === 'examForm' && (
          <ExamForm
            examId={selectedExamId}
            onBack={handleBackToList}
            onSave={handleExamSaved}
          />
        )}

        {currentView === 'questionForm' && (
          <QuestionForm
            examId={selectedExamId}
            question={selectedQuestion}
            onBack={handleBackToDetail}
            onSave={handleQuestionSaved}
          />
        )}
      </div>
    </div>
  );
}

export default App;
