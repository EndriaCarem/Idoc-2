import { cn } from '@/lib/utils';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Chapter } from './types';
import logoGrupoMoura from '@/assets/logo-grupo-moura.png';

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

export function ChapterSidebar({ chapters, activeChapterId, onChapterSelect }: ChapterSidebarProps) {
  const getChapterProgress = (chapter: Chapter) => {
    if (!chapter.content) return 0;
    const charCount = chapter.content.replace(/<[^>]*>/g, '').length;
    return Math.min((charCount / 500) * 100, 100);
  };

  return (
    <div className="w-[200px] border-r bg-muted/30 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b flex justify-center">
        <img src={logoGrupoMoura} alt="Grupo Moura" className="h-10 object-contain" />
      </div>
      
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Capítulos
        </h2>
      </div>
      
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeChapterId;
          const progress = getChapterProgress(chapter);
          const hasContent = progress > 0;
          
          return (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group',
                'hover:bg-accent/50',
                isActive && 'bg-primary/10 text-primary border-l-2 border-primary'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {hasContent && progress >= 100 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={cn(
                  'text-sm truncate flex-1',
                  isActive ? 'font-medium' : 'text-muted-foreground'
                )}>
                  {chapter.title}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-300',
                    progress >= 100 ? 'bg-emerald-500' : 'bg-primary/60'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>{chapters.length} capítulos</span>
        </div>
      </div>
    </div>
  );
}
