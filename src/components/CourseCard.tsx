
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, GraduationCap, PlusCircle } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { CourseManagementDialog } from "./CourseManagementDialog";

interface CourseCardProps {
  course: Course;
  onStatusUpdate: (courseId: number, vacant: boolean) => Promise<void>;
  onCourseUpdate: () => void;
  validateHourDistribution: (course: Course) => { isValid: boolean; message?: string };
  isAdmin?: boolean;
  onProposeTeam?: () => void;
}

export const CourseCard = ({ 
  course, 
  onStatusUpdate, 
  onCourseUpdate, 
  validateHourDistribution,
  isAdmin = false,
  onProposeTeam
}: CourseCardProps) => {
  const [showManagement, setShowManagement] = useState(false);
  const validation = validateHourDistribution(course);

  const getStatusColor = () => {
    if (course.vacant) return "bg-accent text-accent-foreground";
    return course.assignments.length > 0 ? "bg-green-500 text-white" : "bg-orange-500 text-white";
  };

  const getStatusLabel = () => {
    if (course.vacant) return "Vacant";
    return course.assignments.length > 0 ? "Attribué" : "En attente";
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{course.code}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor()}>
                {getStatusLabel()}
              </Badge>
              {!validation.isValid && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Volume incorrect
                </Badge>
              )}
              {validation.isValid && course.assignments.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Volume OK
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Début: {course.start_date ? new Date(course.start_date).toLocaleDateString('fr-FR') : 'Non défini'}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Durée: {course.duration_weeks || 0} semaines</span>
            </div>
            
            <div>
              <span className="font-medium">Vol.1:</span> {course.volume_total_vol1}h
            </div>
            
            <div>
              <span className="font-medium">Vol.2:</span> {course.volume_total_vol2}h
            </div>
          </div>

          {(course.faculty || course.subcategory) && (
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                {course.faculty && (
                  <Badge variant="secondary">{course.faculty}</Badge>
                )}
                {course.subcategory && (
                  <Badge variant="outline">{course.subcategory}</Badge>
                )}
              </div>
            </div>
          )}

          {!validation.isValid && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {validation.message}
              </p>
            </div>
          )}
          
          {course.assignments.length > 0 && (
            <div className="mb-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Équipe pédagogique ({course.assignments.length}):
              </p>
              <div className="space-y-2">
                {course.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex justify-between items-center text-sm">
                    <Badge variant="outline">
                      {assignment.teacher.first_name} {assignment.teacher.last_name}
                      {assignment.is_coordinator && " (Coordinateur)"}
                    </Badge>
                    <div className="text-muted-foreground">
                      Vol.1: {assignment.vol1_hours}h | Vol.2: {assignment.vol2_hours}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isAdmin ? (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(course.id, !course.vacant)}
              >
                Marquer comme {course.vacant ? 'non vacant' : 'vacant'}
              </Button>
              
              <Button onClick={() => setShowManagement(true)}>
                Gérer les attributions
              </Button>
            </div>
          ) : course.vacant && onProposeTeam && (
            <Button 
              onClick={onProposeTeam}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Proposer une équipe
            </Button>
          )}
        </CardContent>
      </Card>

      <CourseManagementDialog
        course={course}
        open={showManagement}
        onOpenChange={setShowManagement}
        onUpdate={onCourseUpdate}
      />
    </>
  );
};
