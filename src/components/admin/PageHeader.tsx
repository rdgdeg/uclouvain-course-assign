import { 
  BarChart3,
  BookOpen,
  FileText,
  Users,
  Settings,
  Wrench,
  TrendingUp,
  Activity,
  Grid3X3,
  UserCheck,
  Upload,
  FileSpreadsheet,
  CheckSquare,
  Eye,
  AlertCircle,
  UserPlus,
  Database,
  Mail,
  Cog,
  HelpCircle
} from "lucide-react";

interface PageHeaderProps {
  activeTab: string;
}

const getPageInfo = (activeTab: string) => {
  const pages = {
    'dashboard': {
      title: 'Tableau de Bord',
      description: 'Vue d\'ensemble et statistiques de la gestion des cours',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    'activity': {
      title: 'Activités Récentes',
      description: 'Historique des dernières actions effectuées',
      icon: Activity,
      color: 'text-green-600'
    },
    'courses-management': {
      title: 'Gestion des Cours',
      description: 'Gestion complète des cours et attributions',
      icon: Grid3X3,
      color: 'text-green-600'
    },
    'assignments': {
      title: 'Gestion des Attributions',
      description: 'Attribution des enseignants aux cours',
      icon: UserCheck,
      color: 'text-purple-600'
    },
    'import': {
      title: 'Import de Cours',
      description: 'Import de cours depuis un fichier CSV',
      icon: Upload,
      color: 'text-orange-600'
    },
    'courses-proposals': {
      title: 'Propositions de Cours',
      description: 'Gestion des candidatures libres',
      icon: FileSpreadsheet,
      color: 'text-indigo-600'
    },
    'proposals': {
      title: 'Propositions d\'Équipes',
      description: 'Validation des propositions d\'équipes',
      icon: CheckSquare,
      color: 'text-orange-600'
    },
    'proposal-review': {
      title: 'Révision des Propositions',
      description: 'Panel de révision des propositions',
      icon: Eye,
      color: 'text-blue-600'
    },
    'requests': {
      title: 'Demandes de Modification',
      description: 'Gestion des demandes de modification',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    'teachers': {
      title: 'Gestion des Enseignants',
      description: 'Gestion de la base de données des enseignants',
      icon: UserPlus,
      color: 'text-purple-600'
    },
    'teacher-import': {
      title: 'Import d\'Enseignants',
      description: 'Import d\'enseignants depuis un fichier CSV',
      icon: Upload,
      color: 'text-indigo-600'
    },
    'tools': {
      title: 'Outils Unifiés',
      description: 'Panel d\'outils centralisé pour l\'administration',
      icon: Settings,
      color: 'text-gray-600'
    },
    'database-test': {
      title: 'Test Base de Données',
      description: 'Tests de connexion et de performance de la base de données',
      icon: Database,
      color: 'text-blue-600'
    },
    'email-test': {
      title: 'Test Emails',
      description: 'Tests d\'envoi et de configuration des emails',
      icon: Mail,
      color: 'text-green-600'
    },
    'settings': {
      title: 'Paramètres',
      description: 'Configuration du système d\'administration',
      icon: Cog,
      color: 'text-gray-600'
    },
    'help': {
      title: 'Aide & Support',
      description: 'Documentation et support technique',
      icon: HelpCircle,
      color: 'text-blue-600'
    }
  };

  return pages[activeTab as keyof typeof pages] || {
    title: 'Page inconnue',
    description: 'Page non trouvée',
    icon: Settings,
    color: 'text-gray-600'
  };
};

export const PageHeader = ({ activeTab }: PageHeaderProps) => {
  const pageInfo = getPageInfo(activeTab);
  const Icon = pageInfo.icon;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${pageInfo.color.replace('text-', 'bg-')} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${pageInfo.color}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h1>
          <p className="text-gray-600">{pageInfo.description}</p>
        </div>
      </div>
    </div>
  );
}; 