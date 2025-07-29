
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, GraduationCap } from "lucide-react";
import { Course } from "@/types/index";
import { CourseManagementDialog } from "./CourseManagementDialog";
import { useState } from "react";

interface CourseListViewProps {
  courses: Course[];
  onStatusUpdate: (courseId: number, vacant: boolean) => Promise<void>;
  onCourseUpdate: () => void;
  validateHourDistribution: (course: Course) => { isValid: boolean; message?: string };
  isAdmin?: boolean;
}

export const CourseListView = ({ 
  courses, 
  onStatusUpdate, 
  onCourseUpdate, 
  validateHourDistribution,
  isAdmin = false
}: CourseListViewProps) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showManagement, setShowManagement] = useState(false);

  const getStatusBadge = (course: Course) => {
    if (course.vacant) return <Badge className="bg-accent text-accent-foreground">Vacant</Badge>;
    return course.assignments && course.assignments.length > 0 
      ? <Badge className="bg-green-500 text-white">Attribué</Badge>
      : <Badge className="bg-orange-500 text-white">En attente</Badge>;
  };

  const handleManageCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowManagement(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cours</TableHead>
              <TableHead>Faculté</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Enseignants</TableHead>
              <TableHead>Volume (h)</TableHead>
              <TableHead>Validation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const validation = validateHourDistribution(course);
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.code}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{course.start_date ? new Date(course.start_date).toLocaleDateString('fr-FR') : 'Non défini'}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{course.duration_weeks || 0} sem.</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course.faculty && (
                        <Badge variant="secondary">{course.faculty}</Badge>
                      )}
                      {course.subcategory && (
                        <Badge variant="outline" className="block w-fit">
                          {course.subcategory}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(course)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course.assignments.map((assignment) => (
                        <div key={assignment.id} className="text-sm flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {assignment.teacher.first_name} {assignment.teacher.last_name}
                            {assignment.is_coordinator && " (Coord.)"}
                          </Badge>
                        </div>
                      ))}
                      {(!course.assignments || course.assignments.length === 0) && (
                        <span className="text-muted-foreground text-sm">Aucun</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Vol.1: {course.volume_total_vol1}h</div>
                      <div>Vol.2: {course.volume_total_vol2}h</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={validation.isValid ? "default" : "destructive"}
                        className={validation.isValid ? "bg-green-500 text-white" : ""}
                      >
                        {validation.isValid ? "✓ OK" : "✗ Erreur"}
                      </Badge>
                      {!validation.isValid && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusUpdate(course.id, !course.vacant)}
                        >
                          {course.vacant ? 'Non vacant' : 'Vacant'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleManageCourse(course)}
                      >
                        Gérer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedCourse && (
        <CourseManagementDialog
          course={selectedCourse}
          open={showManagement}
          onOpenChange={setShowManagement}
          onUpdate={() => {
            onCourseUpdate();
            setShowManagement(false);
          }}
        />
      )}
    </>
  );
};
