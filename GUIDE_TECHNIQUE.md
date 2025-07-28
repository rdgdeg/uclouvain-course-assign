# Guide Technique - Portail de Gestion des Cours UCLouvain

## Table des Matières
1. [Architecture Technique](#architecture-technique)
2. [Configuration du Projet](#configuration-du-projet)
3. [Structure du Code](#structure-du-code)
4. [Base de Données](#base-de-données)
5. [API et Intégrations](#api-et-intégrations)
6. [Déploiement](#déploiement)
7. [Maintenance](#maintenance)

## Architecture Technique

### Stack Technologique

#### Frontend
- **React 18** : Framework principal
- **TypeScript** : Typage statique
- **Vite** : Build tool et dev server
- **React Router DOM** : Routing client-side
- **TanStack Query** : Gestion d'état et cache

#### UI/UX
- **Tailwind CSS** : Framework CSS utilitaire
- **shadcn/ui** : Composants UI réutilisables
- **Lucide React** : Icônes
- **Sonner** : Notifications toast
- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation des schémas

#### Backend
- **Supabase** : Backend-as-a-Service
- **PostgreSQL** : Base de données
- **Row Level Security (RLS)** : Sécurité des données

### Architecture des Composants

```
src/
├── components/
│   ├── ui/                    # Composants shadcn/ui
│   ├── admin/                 # Composants d'administration
│   ├── Header.tsx            # Header principal
│   ├── CourseCard.tsx        # Carte de cours
│   ├── CourseListView.tsx    # Vue liste des cours
│   └── ...
├── pages/
│   ├── PublicIndex.tsx       # Page publique
│   ├── Index.tsx             # Admin des cours
│   ├── Admin.tsx             # Admin générale
│   └── NotFound.tsx          # Page 404
├── hooks/
│   ├── useCourses.ts         # Hook pour les cours
│   ├── use-toast.ts          # Hook pour les notifications
│   └── use-mobile.tsx        # Hook responsive
└── integrations/
    └── supabase/
        ├── client.ts         # Client Supabase
        └── types.ts          # Types TypeScript
```

## Configuration du Projet

### Prérequis
- **Node.js** : Version 18+ recommandée
- **npm** ou **bun** : Gestionnaire de paquets
- **Git** : Contrôle de version

### Installation

```bash
# Cloner le repository
git clone https://github.com/rdgdeg/uclouvain-course-assign.git
cd uclouvain-course-assign

# Installer les dépendances
npm install
# ou
bun install

# Variables d'environnement
cp .env.example .env.local
```

### Variables d'Environnement

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application
VITE_APP_NAME="Portail de Gestion des Cours"
VITE_APP_VERSION=1.0.0
```

### Scripts Disponibles

```json
{
  "dev": "vite",                    // Serveur de développement
  "build": "vite build",           // Build de production
  "build:dev": "vite build --mode development",
  "preview": "vite preview",       // Prévisualisation du build
  "lint": "eslint ."               // Vérification du code
}
```

## Structure du Code

### Patterns Utilisés

#### 1. Custom Hooks
```typescript
// hooks/useCourses.ts
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    // Logique de récupération
  }, []);

  return { courses, loading, fetchCourses };
};
```

#### 2. Composants Composables
```typescript
// components/CourseCard.tsx
interface CourseCardProps {
  course: Course;
  onPropose?: (course: Course) => void;
  onEdit?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPropose,
  onEdit
}) => {
  // Logique du composant
};
```

#### 3. Gestion d'État avec React Query
```typescript
// Utilisation de TanStack Query
const { data: courses, isLoading, error } = useQuery({
  queryKey: ['courses'],
  queryFn: fetchCourses,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Gestion des Erreurs

#### 1. Error Boundaries
```typescript
// Composants d'erreur personnalisés
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-container">
      <h2>Une erreur est survenue</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Réessayer</button>
    </div>
  );
};
```

#### 2. Toast Notifications
```typescript
// Utilisation des notifications
const { toast } = useToast();

toast({
  title: "Succès",
  description: "Opération réussie",
  variant: "default"
});
```

## Base de Données

### Schéma Supabase

#### Tables Principales

```sql
-- Table des cours
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT,
  faculty TEXT,
  subcategory TEXT,
  academic_year TEXT,
  volume_total_vol1 INTEGER,
  volume_total_vol2 INTEGER,
  vacant BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des enseignants
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des attributions
CREATE TABLE course_assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  teacher_id INTEGER REFERENCES teachers(id),
  vol1_hours INTEGER,
  vol2_hours INTEGER,
  is_coordinator BOOLEAN DEFAULT false,
  validated_by_coord BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Relations et Contraintes

```sql
-- Contraintes de validation
ALTER TABLE course_assignments 
ADD CONSTRAINT check_hours 
CHECK (vol1_hours >= 0 AND vol2_hours >= 0);

-- Index pour les performances
CREATE INDEX idx_courses_faculty ON courses(faculty);
CREATE INDEX idx_courses_vacant ON courses(vacant);
CREATE INDEX idx_assignments_course ON course_assignments(course_id);
```

### Row Level Security (RLS)

```sql
-- Politique pour les cours publics
CREATE POLICY "Cours publics visibles" ON courses
  FOR SELECT USING (true);

-- Politique pour les attributions
CREATE POLICY "Attributions visibles" ON course_assignments
  FOR SELECT USING (true);
```

## API et Intégrations

### Client Supabase

```typescript
// integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

### Opérations CRUD

#### 1. Récupération des Cours
```typescript
const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_assignments (
        *,
        teachers (*)
      )
    `)
    .order('title');

  if (error) throw error;
  return data;
};
```

#### 2. Mise à Jour d'un Cours
```typescript
const updateCourse = async (id: number, updates: Partial<Course>) => {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

#### 3. Insertion d'une Proposition
```typescript
const submitProposal = async (proposal: AssignmentProposal) => {
  const { data, error } = await supabase
    .from('assignment_proposals')
    .insert({
      course_id: proposal.courseId,
      submitter_name: proposal.submitterName,
      submitter_email: proposal.submitterEmail,
      proposal_data: proposal.teamData,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Gestion des Types TypeScript

```typescript
// types.ts
export interface Course {
  id: number;
  title: string;
  code?: string;
  faculty?: string;
  subcategory?: string;
  vacant: boolean;
  volume_total_vol1?: number;
  volume_total_vol2?: number;
  assignments: CourseAssignment[];
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status?: string;
}

export interface CourseAssignment {
  id: number;
  course_id: number;
  teacher_id: number;
  vol1_hours?: number;
  vol2_hours?: number;
  is_coordinator: boolean;
  validated_by_coord: boolean;
  teacher: Teacher;
}
```

## Déploiement

### Build de Production

```bash
# Build optimisé
npm run build

# Vérification du build
npm run preview
```

### Configuration Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*'],
        },
      },
    },
  },
});
```

### Déploiement sur Vercel

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Variables d'Environnement de Production

```env
# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_ENV=production
```

## Maintenance

### Monitoring et Logs

#### 1. Logs d'Application
```typescript
// Utilitaires de logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

#### 2. Performance Monitoring
```typescript
// Mesure des performances
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
};
```

### Tests

#### 1. Tests Unitaires (à implémenter)
```typescript
// __tests__/hooks/useCourses.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCourses } from '@/hooks/useCourses';

describe('useCourses', () => {
  it('should fetch courses successfully', async () => {
    const { result } = renderHook(() => useCourses());
    
    await act(async () => {
      await result.current.fetchCourses();
    });
    
    expect(result.current.courses).toHaveLength(5);
    expect(result.current.loading).toBe(false);
  });
});
```

#### 2. Tests d'Intégration
```typescript
// __tests__/components/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/CourseCard';

describe('CourseCard', () => {
  it('should display course information', () => {
    const mockCourse = {
      id: 1,
      title: 'Test Course',
      code: 'TEST101',
      vacant: true
    };
    
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('TEST101')).toBeInTheDocument();
  });
});
```

### Optimisations

#### 1. Code Splitting
```typescript
// Lazy loading des composants
const Admin = lazy(() => import('./pages/Admin'));
const TeacherManagement = lazy(() => import('./components/admin/TeacherManagement'));
```

#### 2. Memoization
```typescript
// Optimisation des re-renders
const MemoizedCourseCard = memo(CourseCard);
const MemoizedCourseList = memo(CourseListView);
```

#### 3. Debouncing
```typescript
// Debounce pour la recherche
const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    setSearchTerm(term);
  }, 300),
  []
);
```

### Sécurité

#### 1. Validation des Données
```typescript
// Schémas de validation Zod
const courseSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  code: z.string().optional(),
  faculty: z.enum(['FSM', 'FSP', 'FASB', 'MEDE']),
  volume_total_vol1: z.number().min(0),
  volume_total_vol2: z.number().min(0)
});
```

#### 2. Sanitisation des Inputs
```typescript
// Nettoyage des données utilisateur
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

---

*Guide technique v1.0 - UCLouvain* 