// 📝 Types centralisés pour le projet ATTRIB
// Ce fichier contient toutes les interfaces et types manquants

// ============================================================================
// TYPES DE BASE
// ============================================================================

export interface Course {
  id: number;
  title: string;
  code: string | null;
  faculty: string | null;
  subcategory: string | null;
  academic_year: string | null;
  start_date: string | null;
  duration_weeks: number | null;
  volume_total_vol1: number | null;
  volume_total_vol2: number | null;
  vacant: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  assignments?: any[];
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  is_coordinator: boolean;
  vol1_hours: number;
  vol2_hours: number;
  teacher?: Teacher;
}

export interface AssignmentWithTeacher extends CourseAssignment {
  teacher?: Teacher;
}

// ============================================================================
// TYPES POUR LES PROPOSITIONS
// ============================================================================

export interface ProposalData {
  assignments: TeacherAssignment[];
  additional_notes: string;
  ignore_volume_warning: boolean;
  total_vol1: number;
  total_vol2: number;
  submission_timestamp: string;
}

export interface AssignmentProposal {
  id: string;
  course_id: number | null;
  submitter_name: string;
  submitter_email: string;
  proposal_data: ProposalData;
  status: string;
  submission_date: string;
  validated_at: string | null;
  validated_by: string | null;
  admin_notes: string | null;
}

// ============================================================================
// TYPES POUR LES ATTRIBUTIONS
// ============================================================================

export interface CourseAssignment {
  id: number;
  course_id: number | null;
  teacher_id: number | null;
  vol1_hours: number | null;
  vol2_hours: number | null;
  is_coordinator: boolean | null;
  validated_by_coord: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================================
// TYPES POUR LES DEMANDES DE MODIFICATION
// ============================================================================

export interface ModificationRequest {
  id: string;
  course_id: number | null;
  requester_name: string;
  requester_email: string;
  modification_type: string;
  description: string | null;
  status: string;
  created_at: string;
  validated_at: string | null;
  validated_by: string | null;
  admin_notes: string | null;
}

// ============================================================================
// TYPES POUR L'IMPORT CSV
// ============================================================================

export interface CourseImportData {
  title: string;
  code?: string;
  faculty?: string;
  subcategory?: string;
  academic_year?: string;
  start_date?: string;
  duration_weeks?: number;
  volume_total_vol1?: number;
  volume_total_vol2?: number;
  vacant?: boolean;
}

export interface TeacherImportData {
  first_name: string;
  last_name: string;
  email: string;
  status?: string;
}

export interface CSVParseError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

// ============================================================================
// TYPES POUR LES NOTES ET REMARQUES
// ============================================================================

export interface CourseAnalysis {
  id: number;
  course_id: number;
  analysis_notes: string;
  analysis_date: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCommission {
  id: number;
  course_id: number;
  commission_notes: string;
  commission_date: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyRemarks {
  faculty: string;
  analysis_remarks: string[];
  commission_remarks: string[];
  total_courses: number;
  vacant_courses: number;
  assigned_courses: number;
  courses_with_issues: number;
}

export interface SchoolRemarks {
  school: string;
  faculty: string;
  analysis_remarks: string[];
  commission_remarks: string[];
  total_courses: number;
  vacant_courses: number;
  assigned_courses: number;
}

// ============================================================================
// TYPES POUR LES FILTRES ET TRI
// ============================================================================

export interface CourseFilters {
  faculty: string;
  school: string;
  status: 'all' | 'vacant' | 'assigned' | 'pending' | 'with_issues' | 'with_modifications';
  academic_year: string;
  search: string;
}

export interface CourseSort {
  field: 'title' | 'code' | 'faculty' | 'school' | 'vacant' | 'analysis_date' | 'commission_date';
  direction: 'asc' | 'desc';
}

// ============================================================================
// TYPES POUR LES FORMULAIRES
// ============================================================================

export interface ProposalFormData {
  submitter_name: string;
  submitter_email: string;
  assignments: TeacherAssignment[];
  additional_notes: string;
  ignore_volume_warning: boolean;
}

export interface CourseFormData {
  title: string;
  code?: string;
  faculty?: string;
  subcategory?: string;
  academic_year?: string;
  start_date?: string;
  duration_weeks?: number;
  volume_total_vol1?: number;
  volume_total_vol2?: number;
  vacant?: boolean;
}

// ============================================================================
// TYPES POUR LES ÉVÉNEMENTS
// ============================================================================

export type FormEvent = React.FormEvent<HTMLFormElement>;
export type InputEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextAreaEvent = React.ChangeEvent<HTMLTextAreaElement>;

// ============================================================================
// TYPES POUR LES RÉSULTATS DE BASE DE DONNÉES
// ============================================================================

export interface DatabaseTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ============================================================================
// TYPES POUR LES STATISTIQUES
// ============================================================================

export interface FacultyStats {
  faculty: string;
  total_courses: number;
  vacant_courses: number;
  assigned_courses: number;
  pending_proposals: number;
}

export interface SystemStats {
  total_courses: number;
  total_teachers: number;
  total_proposals: number;
  total_requests: number;
  faculty_stats: FacultyStats[];
}

// ============================================================================
// TYPES POUR LES RAPPORTS
// ============================================================================

export interface ImportReport {
  id: number;
  type: string;
  inserted: number | null;
  updated: number | null;
  skipped: number | null;
  timestamp: string | null;
}

// ============================================================================
// TYPES POUR LES COMPOSANTS UI
// ============================================================================

export interface DraggableItem<T = unknown> {
  id: string;
  data: T;
  order: number;
}

export interface StatusOption {
  value: string;
  label: string;
  color?: string;
}

// ============================================================================
// TYPES POUR LES HOOKS
// ============================================================================

export interface AutoSaveData {
  key: string;
  data: unknown;
  timestamp: number;
}

export interface QueryParams {
  faculty?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// TYPES POUR LES UTILITAIRES
// ============================================================================

export interface PDFData {
  title: string;
  content: unknown[];
  options?: Record<string, unknown>;
}

export interface OfflineData {
  key: string;
  data: unknown;
  timestamp: number;
  sync_status: 'pending' | 'synced' | 'error';
}

// ============================================================================
// TYPES POUR LES RÉPONSES API
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// TYPES POUR LES CONFIGURATIONS
// ============================================================================

export interface AppConfig {
  supabase_url: string;
  supabase_key: string;
  app_name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
}

 