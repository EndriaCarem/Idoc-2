import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  code: string;
  description: string | null;
  start_date: string;
  end_date: string;
  manager_id: string | null;
  status: 'active' | 'suspended' | 'completed';
  year_base: number;
  hard_lock_vigency: boolean;
  created_at: string;
  member_count?: number;
}

interface Profile {
  user_id: string;
  full_name: string | null;
}

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    start_date: '',
    end_date: '',
    manager_id: '',
    status: 'active' as 'active' | 'suspended' | 'completed',
    year_base: new Date().getFullYear(),
    hard_lock_vigency: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name')
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      // Get member counts
      const projectsWithCounts = await Promise.all(
        (projectsRes.data || []).map(async (project) => {
          const { count } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
          return { ...project, member_count: count || 0 };
        })
      );

      setProjects(projectsWithCounts);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      start_date: '',
      end_date: '',
      manager_id: '',
      status: 'active',
      year_base: new Date().getFullYear(),
      hard_lock_vigency: false
    });
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        manager_id: formData.manager_id || null,
        status: formData.status,
        year_base: formData.year_base,
        hard_lock_vigency: formData.hard_lock_vigency
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id);
        if (error) throw error;
        toast.success('Projeto atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(payload);
        if (error) throw error;
        toast.success('Projeto criado com sucesso');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar projeto');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      code: project.code,
      description: project.description || '',
      start_date: project.start_date,
      end_date: project.end_date,
      manager_id: project.manager_id || '',
      status: project.status as 'active' | 'suspended' | 'completed',
      year_base: project.year_base,
      hard_lock_vigency: project.hard_lock_vigency
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Projeto excluído');
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      active: { label: 'Ativo', variant: 'default' },
      suspended: { label: 'Suspenso', variant: 'secondary' },
      completed: { label: 'Encerrado', variant: 'destructive' }
    };
    const { label, variant } = variants[status] || variants.active;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const isProjectInVigency = (project: Project) => {
    const today = new Date();
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    return today >= start && today <= end;
  };

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
          <h1 className="text-3xl font-bold text-foreground">Projetos P&D</h1>
          <p className="text-muted-foreground">Gerencie os projetos de Pesquisa e Desenvolvimento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto P&D'}</DialogTitle>
              <DialogDescription>
                Cadastre os dados do projeto para controle de horas e conformidade Lei do Bem
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sistema de Automação Industrial"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código Interno *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PRJ-2024-001"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva brevemente o objetivo do projeto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Término *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Gestor Responsável</Label>
                  <Select
                    value={formData.manager_id}
                    onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name || 'Usuário sem nome'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_base">Ano-Base Lei do Bem</Label>
                  <Input
                    id="year_base"
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.year_base}
                    onChange={(e) => setFormData({ ...formData, year_base: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'suspended' | 'completed') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                      <SelectItem value="completed">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-7">
                  <Switch
                    id="hard_lock"
                    checked={formData.hard_lock_vigency}
                    onCheckedChange={(checked) => setFormData({ ...formData, hard_lock_vigency: checked })}
                  />
                  <Label htmlFor="hard_lock" className="text-sm">
                    Bloquear lançamentos fora da vigência
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className={!isProjectInVigency(project) ? 'opacity-70' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{project.code}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusBadge(project.status)}
                  {project.hard_lock_vigency ? (
                    <Lock className="h-4 w-4 text-destructive" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(project.start_date), 'MMM/yy', { locale: ptBR })} - {format(new Date(project.end_date), 'MMM/yy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{project.member_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="outline">Ano-base: {project.year_base}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
