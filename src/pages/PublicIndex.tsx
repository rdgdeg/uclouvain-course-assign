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

        {/* Choix principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto mb-16">
          
          {/* Contrôle des attributions */}
          <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-primary/30 animate-slide-in-left group">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Contrôle des Attributions</CardTitle>
                  <Badge variant="default" className="mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Année en cours
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Consultez les cours de l'année, leurs attributions, cotitulaires et répartitions horaires. 
                Demandez des modifications si nécessaire.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Visualisation des cours et attributions</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Vérification des volumes horaires</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Demandes de modification</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Gestion des cotitulaires</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/controle-attributions')} 
                className="w-full group text-lg py-6"
                size="lg"
              >
                Accéder au contrôle
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Cours vacants */}
          <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-accent/30 animate-slide-in-right group">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Cours Vacants</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Attribution libre
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Explorez les cours disponibles et proposez votre candidature individuelle 
                ou en équipe pour l'enseignement.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Catalogue des cours disponibles</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Candidatures individuelles et équipes</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Suivi des candidatures</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Attribution rapide</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/cours-vacants')} 
                variant="outline"
                className="w-full group text-lg py-6 border-2"
                size="lg"
              >
                Voir les cours vacants
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
};

export default PublicIndex;