import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  status: string;
  hard_lock_vigency: boolean;
}

interface TimeEntry {
  id: string;
  project_id: string;
  user_id: string;
  work_date: string;
  hours: number;
  description: string;
  activity_type: string;
  status: string;
  project?: Project;
}

interface ValidationAlert {
  id: string;
  project_id: string;
  alert_type: string;
  severity: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

const ACTIVITY_TYPES = [
  { value: 'research', label: 'Pesquisa' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'testing', label: 'Testes' },
  { value: 'documentation', label: 'Documentação' },
  { value: 'analysis', label: 'Análise' },
  { value: 'prototype', label: 'Prototipagem' }
];

export default function GestaoHoras() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    project_id: '',
    hours: '',
    description: '',
    activity_type: 'development'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadTimeEntries();
    }
  }, [currentMonth, currentUserId]);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }
      setCurrentUserId(user.id);

      const [projectsRes, alertsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('status', 'active'),
        supabase.from('time_validation_alerts').select('*').eq('resolved', false).order('created_at', { ascending: false })
      ]);

      if (projectsRes.error) throw projectsRes.error;
      setProjects(projectsRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeEntries = async () => {
    if (!currentUserId) return;
    
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, project:projects(*)')
        .eq('user_id', currentUserId)
        .gte('work_date', start)
        .lte('work_date', end)
        .order('work_date', { ascending: true });

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({ ...formData, hours: '', description: '', project_id: '', activity_type: 'development' });
    setDialogOpen(true);
  };

  const validateEntry = (projectId: string, date: Date): { valid: boolean; warning?: string } => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { valid: false, warning: 'Projeto não encontrado' };

    const startDate = parseISO(project.start_date);
    const endDate = parseISO(project.end_date);

    if (isBefore(date, startDate) || isAfter(date, endDate)) {
      if (project.hard_lock_vigency) {
        return { valid: false, warning: `Projeto fora da vigência (${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}). Lançamentos bloqueados.` };
      }
      return { valid: true, warning: `Atenção: Data fora da vigência do projeto (${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')})` };
    }

    // Check daily hours limit
    const dayEntries = timeEntries.filter(e => e.work_date === format(date, 'yyyy-MM-dd'));
    const totalHours = dayEntries.reduce((sum, e) => sum + Number(e.hours), 0);
    if (totalHours + Number(formData.hours) > 8) {
      return { valid: true, warning: `Atenção: Total de horas no dia será ${(totalHours + Number(formData.hours)).toFixed(1)}h (acima de 8h)` };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !currentUserId) return;

    const validation = validateEntry(formData.project_id, selectedDate);
    if (!validation.valid) {
      toast.error(validation.warning);
      return;
    }

    if (validation.warning) {
      const confirmed = confirm(validation.warning + '\n\nDeseja continuar?');
      if (!confirmed) return;
    }

    try {
      const { error } = await supabase.from('time_entries').insert({
        project_id: formData.project_id,
        user_id: currentUserId,
        logged_by_user_id: currentUserId,
        work_date: format(selectedDate, 'yyyy-MM-dd'),
        hours: parseFloat(formData.hours),
        description: formData.description,
        activity_type: formData.activity_type,
        status: 'draft'
      });

      if (error) throw error;
      
      toast.success('Horas registradas com sucesso');
      setDialogOpen(false);
      loadTimeEntries();
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error('Erro ao registrar horas');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return;

    try {
      const { error } = await supabase.from('time_entries').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lançamento excluído');
      loadTimeEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erro ao excluir');
    }
  };

  const getEntriesForDay = (date: Date) => {
    return timeEntries.filter(e => e.work_date === format(date, 'yyyy-MM-dd'));
  };

  const getTotalHoursForMonth = () => {
    return timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  };

  const getHoursByProject = () => {
    const byProject: Record<string, number> = {};
    timeEntries.forEach(e => {
      byProject[e.project_id] = (byProject[e.project_id] || 0) + Number(e.hours);
    });
    return byProject;
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Add padding days for calendar alignment
  const firstDayOfMonth = startOfMonth(currentMonth);
  const paddingDays = firstDayOfMonth.getDay();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Horas P&D</h1>
          <p className="text-muted-foreground">Registre e acompanhe as horas dedicadas a projetos de inovação</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas de Validação</AlertTitle>
          <AlertDescription>
            Existem {alerts.length} inconsistência(s) pendente(s) de resolução.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Horas no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHoursForMonth().toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list">
            <Clock className="h-4 w-4 mr-2" />
            Lista de Horas
          </TabsTrigger>
          <TabsTrigger value="summary">
            <Users className="h-4 w-4 mr-2" />
            Resumo por Projeto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Padding days */}
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[80px]" />
                ))}
                
                {/* Calendar days */}
                {days.map(day => {
                  const dayEntries = getEntriesForDay(day);
                  const totalHours = dayEntries.reduce((sum, e) => sum + Number(e.hours), 0);
                  const hasWarning = totalHours > 8;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                        ${isToday(day) ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}
                        ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {totalHours > 0 && (
                          <Badge variant={hasWarning ? 'destructive' : 'secondary'} className="text-xs">
                            {totalHours.toFixed(1)}h
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEntries.slice(0, 2).map(entry => (
                          <div
                            key={entry.id}
                            className="text-xs truncate px-1 py-0.5 bg-primary/10 rounded"
                            title={entry.project?.name}
                          >
                            {entry.project?.code || 'Projeto'}
                          </div>
                        ))}
                        {dayEntries.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayEntries.length - 2} mais</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos do Mês</CardTitle>
              <CardDescription>Todos os registros de horas em {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeEntries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum lançamento neste mês</p>
                ) : (
                  timeEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {format(parseISO(entry.work_date), 'dd/MM')}
                        </div>
                        <div>
                          <div className="font-medium">{entry.project?.name || 'Projeto'}</div>
                          <div className="text-sm text-muted-foreground">{entry.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {ACTIVITY_TYPES.find(t => t.value === entry.activity_type)?.label || entry.activity_type}
                        </Badge>
                        <span className="font-mono font-bold">{Number(entry.hours).toFixed(1)}h</span>
                        <Badge variant={
                          entry.status === 'approved' ? 'default' :
                          entry.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {entry.status === 'draft' ? 'Rascunho' :
                           entry.status === 'submitted' ? 'Enviado' :
                           entry.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </Badge>
                        {entry.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Projeto</CardTitle>
              <CardDescription>Distribuição de horas em {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(getHoursByProject()).map(([projectId, hours]) => {
                  const project = projects.find(p => p.id === projectId);
                  const percentage = (hours / getTotalHoursForMonth()) * 100;
                  
                  return (
                    <div key={projectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{project?.name || 'Projeto'}</span>
                          <span className="text-sm text-muted-foreground ml-2">({project?.code})</span>
                        </div>
                        <span className="font-mono font-bold">{hours.toFixed(1)}h</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(getHoursByProject()).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum lançamento neste mês</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Time Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registrar Horas - {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              Informe o projeto e as horas trabalhadas nesta data
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Projeto *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Horas *</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="2.0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_type">Tipo de Atividade</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Atividade *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as atividades realizadas..."
                rows={3}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.project_id || !formData.hours}>
                Registrar Horas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
