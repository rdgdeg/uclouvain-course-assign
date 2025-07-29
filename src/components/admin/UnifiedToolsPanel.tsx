import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  TestTube, 
  Activity, 
  Zap, 
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Search,
  Filter,
  Bell,
  Shield,
  HelpCircle
} from "lucide-react";
import { AdminTestPanel } from "./AdminTestPanel";
import { DatabaseTestPanel } from "./DatabaseTestPanel";
import { EmailTestPanel } from "./EmailTestPanel";

export const UnifiedToolsPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState("tests");

  const subTabs = [
    {
      id: "tests",
      label: "Tests",
      icon: TestTube,
      description: "Tests et diagnostics",
      component: <AdminTestPanel />
    },
    {
      id: "database",
      label: "Base de données",
      icon: Database,
      description: "Tests de connexion",
      component: <DatabaseTestPanel />
    },
    {
      id: "email",
      label: "Email",
      icon: Bell,
      description: "Tests d'envoi",
      component: <EmailTestPanel />
    },
    {
      id: "settings",
      label: "Configuration",
      icon: Settings,
      description: "Paramètres système",
      component: <SystemSettingsPanel />
    }
  ];

  const getSubTabIcon = (icon: any) => {
    const Icon = icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions rapides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-gray-600" />
                Outils et Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tests, diagnostics et configuration du système
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Logs
              </Button>
              <Button size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Optimiser
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation par sous-onglets */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <div className="border-b border-gray-200">
              <div className="container mx-auto px-4">
                <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent border-0 p-0">
                  {subTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-gray-600"
                    >
                      {getSubTabIcon(tab.icon)}
                      <div className="text-center">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* Contenu des sous-onglets */}
            {subTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="p-6">
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour les paramètres système
const SystemSettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Configuration Générale</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Année académique :</span>
                    <span className="font-medium">2024-2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environnement :</span>
                    <span className="font-medium">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version :</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Statistiques</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cours total :</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enseignants :</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Propositions :</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Actions Système</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Vider le cache
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 