import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Suggestion, CHARACTER_LIMIT } from './types';
import { SuggestionCard } from './SuggestionCard';
import { TermAlert } from './TermAlert';
import { ComplianceScore } from './ComplianceScore';
import { AlertCircle, Sparkles, RefreshCw, FileWarning } from 'lucide-react';

interface CompliancePanelProps {
  suggestions: Suggestion[];
  characterCount: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  activeSuggestionId?: string;
}

export function CompliancePanel({
  suggestions,
  characterCount,
  onAccept,
  onReject,
  onSuggestionClick,
  onAnalyze,
  isAnalyzing,
  activeSuggestionId,
}: CompliancePanelProps) {
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const termAlerts = pendingSuggestions.filter(s => s.type === 'term_alert');
  const improvements = pendingSuggestions.filter(s => s.type === 'improvement');
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  // Calculate compliance score
  const totalIssues = suggestions.length;
  const resolvedIssues = suggestions.filter(s => s.status !== 'pending').length;
  const score = totalIssues === 0 
    ? 100 
    : Math.round(85 + (resolvedIssues / totalIssues) * 15);

  return (
    <div className="w-[320px] border-l bg-muted/20 flex flex-col h-full">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Painel de Compliance
          </h2>
          <Badge variant="secondary" className="text-xs">
            {pendingSuggestions.length} alertas
          </Badge>
        </div>
        
        <Button 
          onClick={onAnalyze} 
          disabled={isAnalyzing}
          className="w-full bg-corporate-blue hover:bg-corporate-blue-light"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analisar com IA
            </>
          )}
        </Button>
      </div>

      {/* Compliance Score */}
      {totalIssues > 0 && (
        <div className="p-4 border-b">
          <ComplianceScore 
            score={score}
            totalIssues={totalIssues}
            resolvedIssues={resolvedIssues}
          />
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Character limit alert */}
          {isOverLimit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <FileWarning className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Limite de caracteres excedido</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O texto excede o limite de {CHARACTER_LIMIT.toLocaleString('pt-BR')} caracteres.
                    Considere resumir o conteúdo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Term alerts section */}
          {termAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-foreground">
                  Termos não recomendados ({termAlerts.length})
                </span>
              </div>
              {termAlerts.map((suggestion) => (
                <TermAlert
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={onAccept}
                  onReject={onReject}
                  onClick={onSuggestionClick}
                  isActive={suggestion.id === activeSuggestionId}
                />
              ))}
            </div>
          )}

          {/* Improvement suggestions section */}
          {improvements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Sugestões de melhoria ({improvements.length})
                </span>
              </div>
              {improvements.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={onAccept}
                  onReject={onReject}
                  onClick={onSuggestionClick}
                  isActive={suggestion.id === activeSuggestionId}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {pendingSuggestions.length === 0 && !isOverLimit && (
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-emerald-100 w-fit mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Tudo em conformidade!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum alerta ou sugestão pendente.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
