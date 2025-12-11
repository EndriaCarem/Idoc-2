import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Lightbulb, ArrowRight } from 'lucide-react';
import { Suggestion } from './types';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClick: (suggestion: Suggestion) => void;
  isActive?: boolean;
}

export function SuggestionCard({ suggestion, onAccept, onReject, onClick, isActive }: SuggestionCardProps) {
  if (suggestion.status !== 'pending') return null;

  return (
    <Card 
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
        'border-l-4 border-l-primary',
        isActive && 'ring-2 ring-primary/50 shadow-md'
      )}
      onClick={() => onClick(suggestion)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-2">Sugestão de melhoria</p>
          
          <div className="space-y-2 mb-3">
            <div className="p-2 bg-destructive/10 rounded text-sm line-through text-muted-foreground">
              {suggestion.originalText.length > 80 
                ? suggestion.originalText.substring(0, 80) + '...' 
                : suggestion.originalText}
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-2 bg-emerald-50 rounded text-sm text-emerald-800 border border-emerald-200">
              {suggestion.suggestedText.length > 80 
                ? suggestion.suggestedText.substring(0, 80) + '...' 
                : suggestion.suggestedText}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{suggestion.reason}</p>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                onAccept(suggestion.id);
              }}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Aceitar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onReject(suggestion.id);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
