export interface Suggestion {
  id: string;
  type: 'improvement' | 'term_alert' | 'character_limit';
  originalText: string;
  suggestedText: string;
  position: { from: number; to: number };
  status: 'pending' | 'accepted' | 'rejected';
  reason: string;
  reference?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  status: 'editing' | 'review' | 'approved';
  chapters: Chapter[];
}

export const FORBIDDEN_TERMS = [
  { term: 'pesquisa básica', suggestion: 'pesquisa aplicada', reason: 'Termo não aceito pela RFB', reference: 'Art. 17 da Lei 11.196/2005' },
  { term: 'inovação incremental', suggestion: 'desenvolvimento tecnológico', reason: 'Termo não recomendado', reference: 'IN RFB 1.187/2011' },
  { term: 'melhoria de processo', suggestion: 'inovação de processo', reason: 'Termo inadequado para Lei do Bem', reference: 'Manual de Frascati' },
  { term: 'rotina', suggestion: 'atividade de P&D', reason: 'Sugere trabalho repetitivo', reference: 'Decreto 5.798/2006' },
  { term: 'manutenção', suggestion: 'aperfeiçoamento tecnológico', reason: 'Não caracteriza inovação', reference: 'Art. 2º IN RFB 1.187/2011' },
];

export const DEFAULT_CHAPTERS: Omit<Chapter, 'content'>[] = [
  { id: '1', title: 'Objetivos do Projeto', order: 1 },
  { id: '2', title: 'Metodologia', order: 2 },
  { id: '3', title: 'Resultados Esperados', order: 3 },
  { id: '4', title: 'Indicadores de Inovação', order: 4 },
  { id: '5', title: 'Conclusão', order: 5 },
];

export const CHARACTER_LIMIT = 4000;
