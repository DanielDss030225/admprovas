import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { addQuestion, updateQuestion } from '../lib/firebaseService';

const QuestionForm = ({ examId, question, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    text: '', // Corresponde a 'question' no exemplo 01, 'text' no exemplo 02
    type: 'multiple_choice',
    points: '',
    alternatives: ['', '', '', ''], // Array de strings para as alternativas
    correctAnswer: null, // Índice da alternativa correta (0-indexed)
    explanation: '', // Corresponde a 'comment' no exemplo 02
    associatedText: '',
    category: '',
    createdBy: 'test-user-123', // Valor padrão, pode ser dinâmico depois
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

useEffect(() => {
  if (question) {
    setIsEditing(true);
    setFormData(prev => ({
      ...prev,
      text: question.question || question.text || '',
      type: question.type || 'multiple_choice',
      points: question.points || '',
      alternatives: question.options
        ? Object.values(question.options)
        : (question.alternatives || ['', '', '', '']),
      correctAnswer:
        question.correctAnswer !== undefined && question.correctAnswer !== null
          ? (typeof question.correctAnswer === 'string'
              ? question.correctAnswer.charCodeAt(0) - 97
              : question.correctAnswer)
          : null,
      explanation: question.explanation || question.comment || '',
      associatedText: question.associatedText || '',
      category: question.category || '',
      createdBy: question.createdBy || 'test-user-123',
    }));
  }
}, [question]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAlternativeChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => (i === index ? value : alt))
    }));
  };

  const addOption = () => {
    if (formData.alternatives.length < 10) { // Limite de 10 alternativas
      setFormData(prev => ({
        ...prev,
        alternatives: [...prev.alternatives, '']
      }));
    }
  };

  const removeOption = (indexToRemove) => {
    if (formData.alternatives.length > 2) { // Mínimo de 2 alternativas
      const newAlternatives = formData.alternatives.filter((_, index) => index !== indexToRemove);
      setFormData(prev => ({
        ...prev,
        alternatives: newAlternatives,
        correctAnswer: prev.correctAnswer === indexToRemove ? null : (prev.correctAnswer > indexToRemove ? prev.correctAnswer - 1 : prev.correctAnswer)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError("O texto da questão é obrigatório");
      return;
    }

    if (formData.type === 'multiple_choice') {
      const filledAlternatives = formData.alternatives.filter(alt => alt.trim());
      if (filledAlternatives.length < 2) {
        setError('É necessário pelo menos 2 alternativas para questões de múltipla escolha');
        return;
      }
      
      if (formData.correctAnswer === null || formData.correctAnswer === undefined) {
        setError('É necessário selecionar a resposta correta');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const questionData = {
        text: formData.text,
        type: formData.type,
        points: formData.points ? parseInt(formData.points) : null,
        comment: formData.explanation, // explanation se torna comment
        associatedText: formData.associatedText,
        category: formData.category,
        createdBy: formData.createdBy,
        createdAt: isEditing && question.createdAt ? question.createdAt : Date.now(), // Usar timestamp para createdAt
        updatedAt: Date.now(), // Usar timestamp para updatedAt
      };

      if (formData.type === 'multiple_choice') {
        questionData.alternatives = formData.alternatives;
        questionData.correctAnswer = formData.correctAnswer;
      }

      if (isEditing) {
        await updateQuestion(examId, question.id, questionData);
      } else {
        const newQuestionId = await addQuestion(examId, questionData);
        questionData.id = newQuestionId;
      }

      onSave && onSave(questionData);
    } catch (err) {
      setError('Erro ao salvar questão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Questão' : 'Nova Questão'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Questão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Questão</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                    <SelectItem value="essay">Dissertativa</SelectItem>
                    <SelectItem value="short_answer">Resposta Curta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Pontuação</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', e.target.value)}
                  placeholder="Ex: 10"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Texto da Questão *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                placeholder="Digite o enunciado da questão"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="associatedText">Texto Associado à Questão (Opcional)</Label>
              <Textarea
                id="associatedText"
                value={formData.associatedText}
                onChange={(e) => handleInputChange('associatedText', e.target.value)}
                placeholder="Adicione um texto associado à questão, se houver"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria (Opcional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Ex: Matemática, História, etc."
              />
            </div>

            {formData.type === 'multiple_choice' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Opções de Resposta</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="flex items-center gap-1"
                    disabled={formData.alternatives.length >= 10}
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Opção
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Label className="w-8 text-center font-bold">
                        {String.fromCharCode(65 + index)})
                      </Label>
                      <Input
                        value={alternative}
                        onChange={(e) => handleAlternativeChange(index, e.target.value)}
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                      />
                      {formData.alternatives.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Resposta Correta</Label>
                  <Select
                    value={formData.correctAnswer !== null ? String(formData.correctAnswer) : ''}
                    onValueChange={(value) => handleInputChange('correctAnswer', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a resposta correta" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.alternatives.map((alternative, index) => (
                        <SelectItem key={index} value={String(index)}>
                          {String.fromCharCode(65 + index)}) {alternative || 'Alternativa vazia'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">Comentário/Explicação (Opcional)</Label>
              <Textarea
                id="comment"
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                placeholder="Comentário ou explicação da resposta"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createdBy">Criado por (Opcional)</Label>
              <Input
                id="createdBy"
                value={formData.createdBy}
                onChange={(e) => handleInputChange('createdBy', e.target.value)}
                placeholder="Nome do criador da questão"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Questão'}
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

export default QuestionForm;

