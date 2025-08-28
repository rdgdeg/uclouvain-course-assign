import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Users, 
  Clock,
  FileSpreadsheet,
  Mail,
  BarChart3,
  ArrowRight,
  Shield,
  Calendar
} from 'lucide-react';
import { Layout } from '@/components/Layout';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <Layout showAdminButton={false}>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* En-tête */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Portail d'Administration
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez votre espace de travail pour gérer efficacement les cours et attributions
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Année académique 2024-2025</span>
          </div>
        </div>

        {/* Options principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Contrôle des attributions de l'année */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20 animate-slide-in-left">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Contrôle des Attributions</CardTitle>
                  <Badge variant="default" className="mt-1">Année en cours</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-6">
                Gérez l'ensemble des cours de l'année, contrôlez les volumes horaires, 
                et coordonnez les validations avec les coordinateurs de cours.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                  <span>Import/export des cours et attributions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Contrôle des sous/sur-attributions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>Communication avec les coordinateurs</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span>Suivi des validations en temps réel</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/admin/attributions')} 
                className="w-full group"
                size="lg"
              >
                Accéder au contrôle
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Attribution des cours vacants */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-accent/20 animate-slide-in-right">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cours Vacants</CardTitle>
                  <Badge variant="secondary" className="mt-1">Attribution libre</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-6">
                Gérez les cours vacants, examinez les candidatures libres et les propositions 
                d'équipes pour l'attribution des enseignements disponibles.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Liste des cours disponibles</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Candidatures et propositions d'équipes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Gestion des demandes de modification</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Validation et attribution finale</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/admin/courses')} 
                variant="outline"
                className="w-full group"
                size="lg"
              >
                Gérer les cours vacants
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-16 animate-fade-in-up" style={{animationDelay: "0.4s"}}>
          <h2 className="text-2xl font-semibold text-center mb-8">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
                <div className="text-sm text-muted-foreground">Cours total</div>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">23</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">89%</div>
                <div className="text-sm text-muted-foreground">Validés</div>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">8</div>
                <div className="text-sm text-muted-foreground">Anomalies</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="mt-12 text-center animate-fade-in-up" style={{animationDelay: "0.6s"}}>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">Raccourcis utiles</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Accueil public
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/candidature-libre')}>
                Candidatures libres
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/demandes-modification')}>
                Demandes modification
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;