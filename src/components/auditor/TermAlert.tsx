import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Check, X, ExternalLink } from 'lucide-react';
import { Suggestion } from './types';
import { cn } from '@/lib/utils';

interface TermAlertProps {
  suggestion: Suggestion;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClick: (suggestion: Suggestion) => void;
  isActive?: boolean;
}

export function TermAlert({ suggestion, onAccept, onReject, onClick, isActive }: TermAlertProps) {
  if (suggestion.status !== 'pending') return null;

  return (
    <Card 
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
        'border-l-4 border-l-amber-500 bg-amber-50/50',
        isActive && 'ring-2 ring-amber-500/50 shadow-md'
      )}
      onClick={() => onClick(suggestion)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 mb-1">Termo não recomendado</p>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-200 rounded text-sm font-medium text-amber-900">
                "{suggestion.originalText}"
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-1 bg-emerald-100 rounded text-sm font-medium text-emerald-800">
                "{suggestion.suggestedText}"
              </span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
          
          {suggestion.reference && (
            <div className="flex items-center gap-1 text-xs text-primary mb-3">
              <ExternalLink className="h-3 w-3" />
              <span>{suggestion.reference}</span>
            </div>
          )}
          
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
              Substituir
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onReject(suggestion.id);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Ignorar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
