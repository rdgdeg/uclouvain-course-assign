import { Button } from "@/components/ui/button";
import { Settings, FileUp, Download, PlusCircle, MessageSquare, Menu, ChevronDown, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

interface HeaderProps {
  onAdminClick?: () => void;
  showAdminButton?: boolean;
}

export const Header = ({ onAdminClick, showAdminButton = true }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFreeProposalPage = location.pathname === "/candidature-libre";
  const isModificationPage = location.pathname === "/demandes-modification";
  const isHomePage = location.pathname === "/";
  
  return (
    <header className="bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50 animate-slide-in-down">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="cursor-pointer hover-scale transition-transform-smooth" onClick={() => navigate("/")}>
          <h1 className="text-2xl font-bold text-primary">UCLouvain</h1>
          <p className="text-sm text-muted-foreground">Gestion des cours</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Menu Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-all-smooth hover-scale">
                  <Menu className="h-4 w-4 mr-2" />
                  Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                <HelpTooltip 
                  content="Menu des actions principales pour la gestion des cours"
                  side="bottom"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 animate-scale-in">
              <DropdownMenuItem 
                className="flex items-start p-4 cursor-pointer transition-all-smooth hover-lift"
                onClick={() => navigate("/candidature-libre")}
              >
                <div className="flex items-start">
                  <PlusCircle className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Candidature libre</h3>
                    <p className="text-sm text-muted-foreground">
                      Proposer votre candidature pour un cours vacant
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-start p-4 cursor-pointer transition-all-smooth hover-lift"
                onClick={() => navigate("/")}
              >
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Proposer une équipe</h3>
                    <p className="text-sm text-muted-foreground">
                      Constituer une équipe pour un cours
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-start p-4 cursor-pointer transition-all-smooth hover-lift"
                onClick={() => navigate("/demandes-modification")}
              >
                <div className="flex items-start">
                  <MessageSquare className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Demander une modification</h3>
                    <p className="text-sm text-muted-foreground">
                      Modifier une attribution existante
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Boutons individuels pour les actions principales */}
          {!isHomePage && (
            <HelpTooltip content="Revenir à la page d'accueil pour proposer une équipe">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-all-smooth hover-scale"
              >
                <Users className="h-4 w-4 mr-2" />
                Proposer équipe
              </Button>
            </HelpTooltip>
          )}
          
          {!isFreeProposalPage && (
            <HelpTooltip content="Proposer votre candidature pour un cours vacant">
              <Button 
                variant="outline" 
                onClick={() => navigate("/candidature-libre")}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all-smooth hover-scale"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Candidature libre
              </Button>
            </HelpTooltip>
          )}
          
          {!isModificationPage && (
            <HelpTooltip content="Demander une modification d'attribution">
              <Button 
                variant="outline" 
                onClick={() => navigate("/demandes-modification")}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-all-smooth hover-scale"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Demandes modification
              </Button>
            </HelpTooltip>
          )}
          
          {showAdminButton && (
            <HelpTooltip content="Accéder à l'interface d'administration">
              <Button 
                variant="outline" 
                onClick={onAdminClick || (() => navigate("/admin"))}
                className="transition-all-smooth hover-scale"
              >
                <Settings className="h-4 w-4 mr-2" />
                Administration
              </Button>
            </HelpTooltip>
          )}

          {/* Sélecteur de langue visible uniquement sur la page publique */}
        </div>
      </div>
    </header>
  );
};