-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'collaborator');

-- Create enum for project status
CREATE TYPE public.project_status AS ENUM ('active', 'suspended', 'completed');

-- Create enum for time entry status
CREATE TYPE public.time_entry_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('out_of_vigency', 'text_inconsistency', 'duplicate', 'over_hours');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'collaborator',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create projects table (Projetos P&D)
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status project_status NOT NULL DEFAULT 'active',
    year_base INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    hard_lock_vigency BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_members table (Equipe Multidisciplinar)
CREATE TABLE public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'researcher',
    can_log_hours BOOLEAN NOT NULL DEFAULT true,
    can_view_all_hours BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (project_id, user_id)
);

-- Create time_entries table (Lançamento de Horas)
CREATE TABLE public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    logged_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    work_date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT NOT NULL,
    activity_type TEXT NOT NULL DEFAULT 'development',
    status time_entry_status NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_validation_alerts table
CREATE TABLE public.time_validation_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE CASCADE,
    document_reference_id UUID REFERENCES public.saved_documents(id) ON DELETE SET NULL,
    alert_type alert_type NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning',
    message TEXT NOT NULL,
    details JSONB,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_validation_alerts ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is project manager
CREATE OR REPLACE FUNCTION public.is_project_manager(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = _project_id
      AND manager_id = _user_id
  )
$$;

-- Function to check if user is project member
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = _project_id
      AND user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Users can view projects they are members of"
ON public.projects FOR SELECT
USING (
    public.has_role(auth.uid(), 'admin') OR
    manager_id = auth.uid() OR
    public.is_project_member(auth.uid(), id)
);

CREATE POLICY "Admins and managers can create projects"
ON public.projects FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and project managers can update projects"
ON public.projects FOR UPDATE
USING (
    public.has_role(auth.uid(), 'admin') OR
    manager_id = auth.uid()
);

CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for project_members
CREATE POLICY "Users can view members of their projects"
ON public.project_members FOR SELECT
USING (
    public.has_role(auth.uid(), 'admin') OR
    public.is_project_manager(auth.uid(), project_id) OR
    public.is_project_member(auth.uid(), project_id)
);

CREATE POLICY "Admins and managers can manage members"
ON public.project_members FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR
    public.is_project_manager(auth.uid(), project_id)
);

-- RLS Policies for time_entries
CREATE POLICY "Users can view their own time entries"
ON public.time_entries FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Project managers can view all entries for their projects"
ON public.time_entries FOR SELECT
USING (public.is_project_manager(auth.uid(), project_id));

CREATE POLICY "Admins can view all time entries"
ON public.time_entries FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own time entries"
ON public.time_entries FOR INSERT
WITH CHECK (
    user_id = auth.uid() OR
    public.is_project_manager(auth.uid(), project_id) OR
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own draft entries"
ON public.time_entries FOR UPDATE
USING (
    (user_id = auth.uid() AND status = 'draft') OR
    public.is_project_manager(auth.uid(), project_id) OR
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own draft entries"
ON public.time_entries FOR DELETE
USING (
    (user_id = auth.uid() AND status = 'draft') OR
    public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for time_validation_alerts
CREATE POLICY "Users can view their own alerts"
ON public.time_validation_alerts FOR SELECT
USING (
    user_id = auth.uid() OR
    public.is_project_manager(auth.uid(), project_id) OR
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "System can create alerts"
ON public.time_validation_alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins and managers can update alerts"
ON public.time_validation_alerts FOR UPDATE
USING (
    public.is_project_manager(auth.uid(), project_id) OR
    public.has_role(auth.uid(), 'admin')
);

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();