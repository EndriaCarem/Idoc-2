import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/components/auditor/types';
import { toast } from 'sonner';

export function useAuditAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const analyzeContent = useCallback(async (content: string, chapterTitle: string) => {
    if (!content || content.trim().length < 50) {
      toast.info('Adicione mais conteúdo para análise.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-copilot', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Analise o seguinte texto de um relatório de projeto de inovação (Lei do Bem) para o capítulo "${chapterTitle}". 
              
Identifique:
1. Melhorias de redação técnica
2. Clareza e objetividade
3. Adequação à linguagem de P&D

Para cada sugestão, retorne um JSON com o formato:
{
  "suggestions": [
    {
      "originalText": "texto original problemático",
      "suggestedText": "texto sugerido melhorado",
      "reason": "motivo da sugestão"
    }
  ]
}

Texto para análise:
${content}`
            }
          ],
          documentContent: content,
        }
      });

      if (error) throw error;

      // Parse AI response
      const response = data?.response || data?.message || '';
      let parsedSuggestions: Suggestion[] = [];

      try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedSuggestions = (parsed.suggestions || []).map((s: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            type: 'improvement' as const,
            originalText: s.originalText || '',
            suggestedText: s.suggestedText || '',
            position: { from: 0, to: 0 },
            status: 'pending' as const,
            reason: s.reason || 'Melhoria sugerida pela IA',
          }));
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }

      setSuggestions(prev => {
        // Merge with existing term alerts, replace improvements
        const termAlerts = prev.filter(s => s.type === 'term_alert');
        return [...termAlerts, ...parsedSuggestions];
      });

      if (parsedSuggestions.length > 0) {
        toast.success(`${parsedSuggestions.length} sugestão(ões) encontrada(s)`);
      } else {
        toast.info('Nenhuma sugestão adicional encontrada.');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Erro ao analisar conteúdo. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const addTermAlerts = useCallback((termAlerts: Suggestion[]) => {
    setSuggestions(prev => {
      // Keep existing improvements, update term alerts
      const improvements = prev.filter(s => s.type === 'improvement');
      const existingTermIds = new Set(prev.filter(s => s.type === 'term_alert').map(s => s.id));
      const newTermAlerts = termAlerts.filter(t => !existingTermIds.has(t.id));
      return [...improvements, ...prev.filter(s => s.type === 'term_alert'), ...newTermAlerts];
    });
  }, []);

  const acceptSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'accepted' as const } : s
    ));
  }, []);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'rejected' as const } : s
    ));
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    isAnalyzing,
    suggestions,
    analyzeContent,
    addTermAlerts,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    setSuggestions,
  };
}
