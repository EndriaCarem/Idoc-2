import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CharacterCounter } from './CharacterCounter';
import { Suggestion, FORBIDDEN_TERMS } from './types';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Undo, Redo
} from 'lucide-react';

interface AuditEditorProps {
  content: string;
  onChange: (content: string) => void;
  onTermsDetected: (terms: Suggestion[]) => void;
  suggestions: Suggestion[];
  activeSuggestionId?: string;
  placeholder?: string;
}

export function AuditEditor({
  content,
  onChange,
  onTermsDetected,
  suggestions,
  activeSuggestionId,
  placeholder = 'Digite o conteúdo do capítulo...'
}: AuditEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              event.preventDefault();
              toast.error('Imagens não são permitidas neste tipo de relatório fiscal.');
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      detectForbiddenTerms(editor.getText());
    },
  });

  const detectForbiddenTerms = useCallback((text: string) => {
    const detectedTerms: Suggestion[] = [];
    const lowerText = text.toLowerCase();

    FORBIDDEN_TERMS.forEach((term) => {
      let startIndex = 0;
      while ((startIndex = lowerText.indexOf(term.term.toLowerCase(), startIndex)) !== -1) {
        detectedTerms.push({
          id: `term-${term.term}-${startIndex}`,
          type: 'term_alert',
          originalText: term.term,
          suggestedText: term.suggestion,
          position: { from: startIndex, to: startIndex + term.term.length },
          status: 'pending',
          reason: term.reason,
          reference: term.reference,
        });
        startIndex += term.term.length;
      }
    });

    onTermsDetected(detectedTerms);
  }, [onTermsDetected]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Scroll to active suggestion
  useEffect(() => {
    if (activeSuggestionId && editor) {
      const suggestion = suggestions.find(s => s.id === activeSuggestionId);
      if (suggestion) {
        editor.commands.setTextSelection(suggestion.position);
        editor.commands.scrollIntoView();
      }
    }
  }, [activeSuggestionId, editor, suggestions]);

  if (!editor) return null;

  const characterCount = editor.storage.characterCount?.characters?.() || editor.getText().length;

  const MenuButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    tooltip 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: React.ElementType; 
    tooltip: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className={isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex-1 flex flex-col bg-card border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          tooltip="Negrito"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          tooltip="Itálico"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          tooltip="Sublinhado"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          tooltip="Tachado"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          tooltip="Alinhar à esquerda"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          tooltip="Centralizar"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          tooltip="Alinhar à direita"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={AlignJustify}
          tooltip="Justificar"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          tooltip="Lista"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          tooltip="Lista numerada"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          tooltip="Citação"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          tooltip="Desfazer"
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          tooltip="Refazer"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Character Counter */}
      <CharacterCounter count={characterCount} />
    </div>
  );
}
