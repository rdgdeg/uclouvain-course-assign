import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Upload, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  RefreshCw,
  Settings,
  Database,
  UserCheck,
  Activity
} from "lucide-react";
import { TeacherManagement } from "./TeacherManagement";
import { TeacherImportAndStatus } from "./TeacherImportAndStatus";
import { IntelligentImportPanel } from "./IntelligentImportPanel";

export const UnifiedTeacherManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState("management");

  const subTabs = [
    {
      id: "management",
      label: "Gestion",
      icon: Users,
      description: "Liste et édition",
      component: <TeacherManagement />
    },
    {
      id: "import",
      label: "Import",
      icon: Upload,
      description: "Import CSV intelligent",
      component: <IntelligentImportPanel />
    },
    {
      id: "status",
      label: "Statuts",
      icon: UserCheck,
      description: "Gestion des statuts",
      component: <TeacherImportAndStatus />
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
                <Users className="h-6 w-6 text-purple-600" />
                Gestion Unifiée des Enseignants
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les fonctionnalités de gestion des enseignants
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel enseignant
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
                <TabsList className="grid w-full grid-cols-3 h-auto bg-transparent border-0 p-0">
                  {subTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
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