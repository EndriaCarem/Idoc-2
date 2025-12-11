import { useState, useCallback } from 'react';
import { ProjectHeader } from '@/components/auditor/ProjectHeader';
import { ChapterSidebar } from '@/components/auditor/ChapterSidebar';
import { AuditEditor } from '@/components/auditor/AuditEditor';
import { CompliancePanel } from '@/components/auditor/CompliancePanel';
import { useAuditAnalysis } from '@/hooks/useAuditAnalysis';
import { Chapter, DEFAULT_CHAPTERS, Suggestion } from '@/components/auditor/types';
import { toast } from 'sonner';

export default function Auditor() {
  const [projectTitle] = useState('Projeto de P&D - Sistema de IA');
  const [projectStatus, setProjectStatus] = useState<'editing' | 'review' | 'approved'>('editing');
  const [activeChapterId, setActiveChapterId] = useState(DEFAULT_CHAPTERS[0].id);
  const [chapters, setChapters] = useState<Chapter[]>(
    DEFAULT_CHAPTERS.map(c => ({ ...c, content: '' }))
  );
  const [activeSuggestionId, setActiveSuggestionId] = useState<string>();

  const {
    isAnalyzing,
    suggestions,
    analyzeContent,
    addTermAlerts,
    acceptSuggestion,
    rejectSuggestion,
    setSuggestions,
  } = useAuditAnalysis();

  const activeChapter = chapters.find(c => c.id === activeChapterId)!;

  const handleContentChange = useCallback((content: string) => {
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, content } : c
    ));
  }, [activeChapterId]);

  const handleTermsDetected = useCallback((termAlerts: Suggestion[]) => {
    addTermAlerts(termAlerts);
  }, [addTermAlerts]);

  const handleAnalyze = useCallback(() => {
    const plainText = activeChapter.content.replace(/<[^>]*>/g, '');
    analyzeContent(plainText, activeChapter.title);
  }, [activeChapter, analyzeContent]);

  const handleAcceptSuggestion = useCallback((id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) return;

    // Apply the suggestion to the content
    if (suggestion.type === 'term_alert') {
      const newContent = activeChapter.content.replace(
        new RegExp(suggestion.originalText, 'gi'),
        suggestion.suggestedText
      );
      handleContentChange(newContent);
    }

    acceptSuggestion(id);
    toast.success('Sugestão aplicada!');
  }, [suggestions, activeChapter, handleContentChange, acceptSuggestion]);

  const handleRejectSuggestion = useCallback((id: string) => {
    rejectSuggestion(id);
    toast.info('Sugestão ignorada');
  }, [rejectSuggestion]);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setActiveSuggestionId(suggestion.id);
  }, []);

  const handleStatusChange = useCallback((status: 'editing' | 'review' | 'approved') => {
    setProjectStatus(status);
    const statusMessages = {
      editing: 'Projeto em edição',
      review: 'Projeto enviado para revisão',
      approved: 'Projeto aprovado!',
    };
    toast.success(statusMessages[status]);
  }, []);

  const handleSave = useCallback(() => {
    // In a real app, save to database
    toast.success('Projeto salvo com sucesso!');
  }, []);

  const characterCount = activeChapter.content.replace(/<[^>]*>/g, '').length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ProjectHeader
        title={projectTitle}
        status={projectStatus}
        onStatusChange={handleStatusChange}
        onSave={handleSave}
      />

      <div className="flex-1 flex overflow-hidden">
        <ChapterSidebar
          chapters={chapters}
          activeChapterId={activeChapterId}
          onChapterSelect={(id) => {
            setActiveChapterId(id);
            setSuggestions([]);
            setActiveSuggestionId(undefined);
          }}
        />

        <div className="flex-1 p-6 overflow-hidden">
          <AuditEditor
            content={activeChapter.content}
            onChange={handleContentChange}
            onTermsDetected={handleTermsDetected}
            suggestions={suggestions}
            activeSuggestionId={activeSuggestionId}
            placeholder={`Digite o conteúdo de "${activeChapter.title}"...`}
          />
        </div>

        <CompliancePanel
          suggestions={suggestions}
          characterCount={characterCount}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
          onSuggestionClick={handleSuggestionClick}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          activeSuggestionId={activeSuggestionId}
        />
      </div>
    </div>
  );
}
