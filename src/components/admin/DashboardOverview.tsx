import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  Clock,
  Activity,
  Zap,
  BarChart3,
  PieChart,
  Target,
  Award
} from "lucide-react";
import { Course } from "@/types/index";

interface DashboardOverviewProps {
  courses: Course[];
  onViewCourses: (faculty: string, filter: 'all' | 'vacant' | 'assigned' | 'issues') => void;
  onQuickAction: (action: string) => void;
}

export const DashboardOverview = ({ 
  courses, 
  onViewCourses, 
  onQuickAction 
}: DashboardOverviewProps) => {
  // Calcul des métriques
  const totalCourses = courses.length;
  const vacantCourses = courses.filter(c => c.vacant).length;
  const assignedCourses = courses.filter(c => !c.vacant && c.assignments && c.assignments.length > 0).length;
  const pendingCourses = courses.filter(c => !c.vacant && (!c.assignments || c.assignments.length === 0)).length;
  const completionRate = totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 0;

  // Statistiques par faculté
  const facultyStats = courses.reduce((acc, course) => {
    const faculty = course.faculty || "Non définie";
    if (!acc[faculty]) {
      acc[faculty] = { total: 0, vacant: 0, assigned: 0, pending: 0 };
    }
    acc[faculty].total++;
    if (course.vacant) {
      acc[faculty].vacant++;
    } else if (course.assignments && course.assignments.length > 0) {
      acc[faculty].assigned++;
    } else {
      acc[faculty].pending++;
    }
    return acc;
  }, {} as Record<string, { total: number; vacant: number; assigned: number; pending: number }>);

  // Activités récentes simulées
  const recentActivities = [
    { id: 1, action: "Nouvelle proposition reçue", course: "LINFO1101", time: "2 min", type: "proposal", color: "bg-blue-500" },
    { id: 2, action: "Cours attribué", course: "LMATH1101", time: "15 min", type: "assignment", color: "bg-green-500" },
    { id: 3, action: "Demande de modification", course: "LPHYS1101", time: "1h", type: "request", color: "bg-orange-500" },
    { id: 4, action: "Import d'enseignants", course: "Batch", time: "2h", type: "import", color: "bg-purple-500" },
  ];

  // Objectifs et KPIs
  const kpis = [
    {
      title: "Taux d'attribution",
      value: `${completionRate}%`,
      target: 85,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Cours vacants",
      value: vacantCourses.toString(),
      target: 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Enseignants actifs",
      value: new Set(courses.flatMap(c => c.assignments.map(a => a.teacher_id))).size.toString(),
      target: 50,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Efficacité",
      value: `${Math.round((assignedCourses / Math.max(totalCourses, 1)) * 100)}%`,
      target: 90,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const progress = kpi.target > 0 ? Math.min((parseInt(kpi.value) / kpi.target) * 100, 100) : 0;
          
          return (
            <Card key={index} className="border-l-4 border-current" style={{ borderLeftColor: kpi.color.replace('text-', '') }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    {kpi.target > 0 && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Objectif: {kpi.target}</p>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions rapides */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickAction('refresh')}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <Activity className="h-4 w-4" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickAction('import')}
              className="flex items-center gap-2 hover:bg-green-50"
            >
              <BarChart3 className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickAction('proposals')}
              className="flex items-center gap-2 hover:bg-orange-50"
            >
              <PieChart className="h-4 w-4" />
              Propositions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickAction('settings')}
              className="flex items-center gap-2 hover:bg-purple-50"
            >
              <TrendingUp className="h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vue d'ensemble et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.course} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques par faculté */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Statistiques par Faculté
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(facultyStats).map(([faculty, stats]) => {
              const completionRate = stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0;
              
              return (
                <Card key={faculty} className="hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => onViewCourses(faculty, 'all')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{faculty}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                        <div className="text-muted-foreground">Attribués</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {stats.vacant > 0 && (
                        <div 
                          className="flex justify-between items-center p-2 rounded bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCourses(faculty, 'vacant');
                          }}
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Vacants
                          </span>
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            {stats.vacant}
                          </Badge>
                        </div>
                      )}

                      {stats.assigned > 0 && (
                        <div 
                          className="flex justify-between items-center p-2 rounded bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCourses(faculty, 'assigned');
                          }}
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Attribués
                          </span>
                          <Badge variant="secondary" className="bg-green-500 text-white">
                            {stats.assigned}
                          </Badge>
                        </div>
                      )}

                      {stats.pending > 0 && (
                        <div 
                          className="flex justify-between items-center p-2 rounded bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCourses(faculty, 'issues');
                          }}
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-red-500" />
                            En attente
                          </span>
                          <Badge variant="destructive">
                            {stats.pending}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 