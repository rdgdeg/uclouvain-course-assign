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
  GraduationCap,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';
import { Layout } from '@/components/Layout';

const PublicIndex = () => {
  const navigate = useNavigate();

  return (
    <Layout showAdminButton={true}>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* En-tête principal */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-6">
            Gestion des Enseignements
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plateforme centralisée pour la gestion des cours, attributions et candidatures
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg text-muted-foreground">Année académique 2024-2025</span>
            <Badge variant="default" className="ml-2">
              <Star className="h-3 w-3 mr-1" />
              Actif
            </Badge>
          </div>
        </div>

        {/* Candidature en équipe - Action principale */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-primary/30 animate-fade-in-up bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Candidature en équipe</CardTitle>
                  <Badge variant="default" className="mt-2 text-base px-3 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    Nouveau
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-xl leading-relaxed">
                Proposez votre candidature pour un cours en équipe. Sélectionnez un cours, 
                renseignez les membres de votre équipe et leurs volumes horaires.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Sélection d'un cours dans la liste</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Users className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Composition de l'équipe</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                  <span className="font-medium">Validation des volumes horaires</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <span className="font-medium">Envoi et suivi</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/candidature-equipe')} 
                className="w-full group text-xl py-8 shadow-lg"
                size="lg"
              >
                Commencer ma candidature
                <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Autres options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto mb-16">
          
          {/* Contrôle des attributions */}
          <Card className="hover:shadow-xl transition-all duration-300 border hover:border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Contrôle des Attributions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Consultez les cours, leurs attributions et répartitions horaires.
              </p>
              <Button 
                onClick={() => navigate('/controle-attributions')} 
                variant="outline"
                className="w-full"
              >
                Accéder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Cours vacants */}
          <Card className="hover:shadow-xl transition-all duration-300 border hover:border-accent/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Cours Vacants</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explorez tous les cours disponibles et leurs détails.
              </p>
              <Button 
                onClick={() => navigate('/cours-vacants')} 
                variant="outline"
                className="w-full"
              >
                Voir les cours
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
};

export default PublicIndex;