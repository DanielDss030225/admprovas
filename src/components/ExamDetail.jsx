import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { getExamById, getExamQuestions, removeQuestion } from '../lib/firebaseService';

const ExamDetail = ({ examId, mode, onBack, onEditExam, onEditQuestion, onCreateQuestion }) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExamData();
  }, [examId]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const [examData, questionsData] = await Promise.all([
        getExamById(examId),
        getExamQuestions(examId)
      ]);
      
      setExam(examData);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados da prova: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId, questionText) => {
    if (window.confirm(`Tem certeza que deseja excluir esta questão?`)) {
      try {
        await removeQuestion(examId, questionId);
        await loadExamData(); // Recarregar os dados
      } catch (err) {
        setError('Erro ao excluir questão: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando dados da prova...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          <Button onClick={loadExamData} className="mt-2" variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="text-center text-gray-500">Prova não encontrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        {mode === 'edit' && (
          <Button onClick={() => onEditExam(exam)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Prova
          </Button>
        )}
      </div>

      {/* Informações da Prova */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{exam.title || 'Prova sem título'}</span>
            <Badge variant="secondary">
              {questions.length} questões
            </Badge>
          </CardTitle>
          <CardDescription>
            {exam.description || 'Sem descrição'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {exam.type
 && (
              <div><strong>Matéria:</strong> {exam.type
}</div>
            )}
            {exam.duration && (
              <div><strong>Duração:</strong> {exam.duration} minutos</div>
            )}
            {exam.totalPoints && (
              <div><strong>Pontuação Total:</strong> {exam.totalPoints} pontos</div>
            )}
            {exam.createdAt && (
              <div><strong>Criado em:</strong> {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</div>
            )}
            {exam.updatedAt && (
              <div><strong>Atualizado em:</strong> {new Date(exam.updatedAt).toLocaleDateString('pt-BR')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questões */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Questões</h2>
          {mode === 'edit' && (
            <Button onClick={() => onCreateQuestion(examId)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Questão
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-500 text-lg mb-4">Nenhuma questão encontrada</div>
              {mode === 'edit' && (
                <Button onClick={() => onCreateQuestion(examId)} variant="outline">
                  Criar primeira questão
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Questão {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {question.points && (
                        <Badge variant="outline">{question.points} pts</Badge>
                      )}
                      {question.type && (
                        <Badge variant="secondary">{question.type}</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">
                      {question.question || question.text || 'Texto da questão não disponível'}
                    </div>
                    
                    {question.options && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Opções:</div>
                        {Object.entries(question.options).map(([key, value]) => (
                          <div key={key} className="text-sm pl-4">
                            <strong>{key.toUpperCase()})</strong> {value}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.correctAnswer && (
                      <div className="text-sm">
                        <strong>Resposta Correta:</strong> {question.correctAnswer}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="text-sm">
                        <strong>Explicação:</strong> {question.explanation}
                      </div>
                    )}
                    
                    {mode === 'edit' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => onEditQuestion(examId, question)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id, question.question)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;

