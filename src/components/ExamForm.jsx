import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { createExam, updateExam, getExamById } from '../lib/firebaseService';

const ExamForm = ({ examId, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type
: '',
    duration: '',
    totalPoints: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (examId) {
      setIsEditing(true);
      loadExamData();
    }
  }, [examId]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const exam = await getExamById(examId);
      if (exam) {
        setFormData({
          title: exam.title || '',
          description: exam.description || '',
          type: exam.type || '',
          duration: exam.duration || '',
          totalPoints: exam.totalPoints || '',
          instructions: exam.instructions || ''
        });
      }
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados da prova: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('O título da prova é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const examData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        totalPoints: formData.totalPoints ? parseInt(formData.totalPoints) : null,
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        await updateExam(examId, examData);
      } else {
        examData.createdAt = new Date().toISOString();
        const newExamId = await createExam(examData);
        examData.id = newExamId;
      }

      onSave && onSave(examData);
    } catch (err) {
      setError('Erro ao salvar prova: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando dados da prova...</div>
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
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Prova' : 'Nova Prova'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título da prova"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>

          

<select
  name="type"
  value={formData.type}
  onChange={(e) => handleInputChange('type', e.target.value)}
  className="border rounded p-2 w-full"
>
  <option value="">Selecione...</option>
  <option value="concurso">Concurso</option>
  <option value="simulado">Simulado</option>
</select>


              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Categoria</Label>
                <Input
                  id="duration"
             
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Categoria"
                 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints">Pontuação Total</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  value={formData.totalPoints}
                  onChange={(e) => handleInputChange('totalPoints', e.target.value)}
                  placeholder="Ex: 100"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição da prova"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Instruções para os alunos"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Prova'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamForm;

