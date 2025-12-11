import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Send, CheckCircle2 } from 'lucide-react';

interface ProjectHeaderProps {
  title: string;
  status: 'editing' | 'review' | 'approved';
  onStatusChange: (status: 'editing' | 'review' | 'approved') => void;
  onSave: () => void;
}

const statusConfig = {
  editing: { label: 'Em Edição', variant: 'secondary' as const, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  review: { label: 'Em Revisão', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  approved: { label: 'Aprovado', variant: 'default' as const, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export function ProjectHeader({ title, status, onStatusChange, onSave }: ProjectHeaderProps) {
  const config = statusConfig[status];

  return (
    <div className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground truncate max-w-md">{title}</h1>
        <Badge className={config.color}>{config.label}</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        
        {status === 'editing' && (
          <Button 
            size="sm" 
            className="bg-corporate-blue hover:bg-corporate-blue-light"
            onClick={() => onStatusChange('review')}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar para Revisão
          </Button>
        )}
        
        {status === 'review' && (
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onStatusChange('approved')}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aprovar
          </Button>
        )}
      </div>
    </div>
  );
}
