import { cn } from '@/lib/utils';
import { CHARACTER_LIMIT } from './types';

interface CharacterCounterProps {
  count: number;
  limit?: number;
}

export function CharacterCounter({ count, limit = CHARACTER_LIMIT }: CharacterCounterProps) {
  const percentage = (count / limit) * 100;
  
  const getStatusColor = () => {
    if (percentage > 100) return 'text-destructive';
    if (percentage > 87.5) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getBarColor = () => {
    if (percentage > 100) return 'bg-destructive';
    if (percentage > 87.5) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/20">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-300', getBarColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium tabular-nums', getStatusColor())}>
        {count.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')}
      </span>
    </div>
  );
}
