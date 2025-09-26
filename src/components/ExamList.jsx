import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { getAllExams, removeExam } from '../lib/firebaseService';

const ExamList = ({ onSelectExam, onCreateExam }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const examsList = await getAllExams();
      setExams(examsList);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar provas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId, examTitle) => {
    if (window.confirm(`Tem certeza que deseja excluir a prova "${examTitle}"?`)) {
      try {
        await removeExam(examId);
        await loadExams(); // Recarregar a lista
      } catch (err) {
        setError('Erro ao excluir prova: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando provas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <Button onClick={loadExams} className="mt-2" variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sistema de Gerenciamento de Provas</h1>
        <Button onClick={onCreateExam} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Prova
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-4">Nenhuma prova encontrada</div>
            <Button onClick={onCreateExam} variant="outline">
              Criar primeira prova
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{exam.title || 'Prova sem título'}</span>
                  <Badge variant="secondary">
                    {exam.associatedText ? Object.keys(exam.associatedText).length : 0} questões
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {exam.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {exam.type && (
                    <div><strong>Tipo:</strong> {exam.type}</div>
                  )}
                  {exam.duration && (
                    <div><strong>Duração:</strong> {exam.duration} minutos</div>
                  )}
                  {exam.createdAt && (
                    <div><strong>Criado em:</strong> {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => onSelectExam(exam.id, 'view')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Ver
                  </Button>
                  <Button
                    onClick={() => onSelectExam(exam.id, 'edit')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;

