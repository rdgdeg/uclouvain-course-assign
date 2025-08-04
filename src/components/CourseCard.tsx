
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, GraduationCap, PlusCircle, ChevronDown, ChevronRight, UserCheck, UserX } from "lucide-react";
import { Course } from "@/types/index";
import { CourseManagementDialog } from "./CourseManagementDialog";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
  onStatusUpdate: (courseId: number, vacant: boolean) => Promise<void>;
  onCourseUpdate: () => void;
  validateHourDistribution: (course: Course) => { isValid: boolean; message?: string };
  isAdmin?: boolean;
  onProposeTeam?: () => void;
  onFacultyFilter?: (faculty: string) => void;
}

export const CourseCard = ({ 
  course, 
  onStatusUpdate, 
  onCourseUpdate, 
  validateHourDistribution,
  isAdmin = false,
  onProposeTeam,
  onFacultyFilter
}: CourseCardProps) => {
  const [showManagement, setShowManagement] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<boolean | null>(null);
  const { toast } = useToast();
  const validation = validateHourDistribution(course);

  const handleStatusChange = (newVacantStatus: boolean) => {
    setPendingStatusChange(newVacantStatus);
    setShowConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (pendingStatusChange !== null) {
      try {
        await onStatusUpdate(course.id, pendingStatusChange);
        toast({
          title: "Statut mis à jour",
          description: `Le cours a été marqué comme ${pendingStatusChange ? "vacant" : "non vacant"}.`,
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du cours.",
          variant: "destructive"
        });
      }
      setShowConfirmation(false);
      setPendingStatusChange(null);
    }
  };

  const getStatusColor = () => {
    if (course.vacant) return "bg-red-500 text-white";
    return course.assignments && course.assignments.length > 0 ? "bg-green-500 text-white" : "bg-orange-500 text-white";
  };

  const getStatusLabel = () => {
    if (course.vacant) return "Vacant";
    return course.assignments && course.assignments.length > 0 ? "Attribué" : "En attente";
  };

  const getCardStyle = () => {
    if (course.vacant) return "border-2 border-green-200 bg-green-50/30";
    return course.assignments && course.assignments.length > 0 ? "border-2 border-gray-200 bg-gray-50/30" : "border-2 border-orange-200 bg-orange-50/30";
  };

  return (
    <>
      <Card className={`hover-lift transition-all-smooth h-full flex flex-col animate-fade-in-up ${getCardStyle()}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {course.title}
                <HelpTooltip 
                  content={`Code du cours: ${course.code}${course.subcategory ? ` • Sous-catégorie: ${course.subcategory}` : ""}`}
                  icon="info"
                />
              </CardTitle>
              <p className="text-muted-foreground mt-1">{course.code}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge 
                status={course.vacant ? "vacant" : course.assignments && course.assignments.length > 0 ? "assigned" : "pending"}
                animated={course.vacant}
              />
              {isAdmin && !validation.isValid && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Volume incorrect
                </Badge>
              )}
              {isAdmin && validation.isValid && course.assignments && course.assignments.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Volume OK
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Section faculté cliquable - en haut */}
          {course.faculty && (
            <div className="mb-4">
              <button
                onClick={() => onFacultyFilter?.(course.faculty)}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <GraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <Badge 
                  variant="outline" 
                  className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  {course.faculty}
                </Badge>
              </button>
            </div>
          )}

          {/* Informations de base - structure alignée */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Ligne 1: Date et durée - alignées */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                    Début
                    <HelpTooltip 
                      content="Date de début du cours pour l'année académique"
                      className="h-3 w-3"
                    />
                  </span>
                  <span className="text-sm">
                    {course.start_date ? new Date(course.start_date).toLocaleDateString('fr-FR') : 'Non défini'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                    Durée
                    <HelpTooltip 
                      content="Durée totale du cours en semaines"
                      className="h-3 w-3"
                    />
                  </span>
                  <span className="text-sm">{course.duration_weeks || 0} semaines</span>
                </div>
              </div>
            </div>
            
            {/* Ligne 2: Volumes - alignés */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                    Volume 1
                    <HelpTooltip 
                      content="Volume horaire du premier quadrimestre"
                      className="h-3 w-3"
                    />
                  </span>
                  <span className="text-lg font-semibold text-blue-600">{course.volume_total_vol1}h</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                    Volume 2
                    <HelpTooltip 
                      content="Volume horaire du second quadrimestre"
                      className="h-3 w-3"
                    />
                  </span>
                  <span className="text-lg font-semibold text-green-600">{course.volume_total_vol2}h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            {/* Accordéon pour les détails - seulement pour les erreurs de validation */}
            {!validation.isValid && (
              <div className="mb-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      Problème de volume détecté
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Volume incorrect
                    </Badge>
                  </div>
                  {showDetails ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {showDetails && (
                  <div className="mt-3">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {validation.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section de validation */}
            {isAdmin ? (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(!course.vacant)}
                  className="transition-all-smooth hover-scale"
                >
                  Marquer comme {course.vacant ? 'non vacant' : 'vacant'}
                </Button>
                
                <Button 
                  onClick={() => setShowManagement(true)}
                  className="transition-all-smooth hover-scale"
                >
                  Gérer les attributions
                </Button>
              </div>
            ) : course.vacant && onProposeTeam ? (
              <Button 
                onClick={onProposeTeam}
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all-smooth hover-lift pulse-primary"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Proposer une équipe
              </Button>
            ) : !course.vacant && course.assignments && course.assignments.length > 0 ? (
              <div className="text-center p-3 bg-gray-100 rounded-md">
                <Users className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-600 font-medium">Équipe attribuée</p>
                <p className="text-xs text-gray-500">Ce cours n'est plus disponible</p>
              </div>
            ) : (
              <div className="text-center p-3 bg-orange-100 rounded-md">
                <Clock className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-orange-600 font-medium">En attente</p>
                <p className="text-xs text-orange-500">Attribution en cours</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CourseManagementDialog
        course={course}
        open={showManagement}
        onOpenChange={setShowManagement}
        onUpdate={onCourseUpdate}
      />

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Changer le statut du cours"
        description={`Êtes-vous sûr de vouloir marquer ce cours comme ${pendingStatusChange ? 'vacant' : 'non vacant'} ?`}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={confirmStatusChange}
        variant={pendingStatusChange ? "warning" : "default"}
      />
    </>
  );
};
