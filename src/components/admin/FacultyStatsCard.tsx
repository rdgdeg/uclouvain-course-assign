
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/hooks/useCourses";
import { GraduationCap, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface FacultyStatsCardProps {
  faculty: string;
  courses: Course[];
  onViewCourses: (faculty: string, filter: 'all' | 'vacant' | 'assigned' | 'issues') => void;
}

export const FacultyStatsCard = ({ faculty, courses, onViewCourses }: FacultyStatsCardProps) => {
  const totalCourses = courses.length;
  const vacantCourses = courses.filter(c => c.vacant).length;
  const assignedCourses = courses.filter(c => !c.vacant && c.assignments.length > 0).length;
  const coursesWithIssues = courses.filter(c => !c.vacant && c.assignments.length === 0).length;

  const completionRate = totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          {faculty || "Non définie"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalCourses}</div>
            <div className="text-muted-foreground">Total cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <div className="text-muted-foreground">Attribués</div>
          </div>
        </div>

        <div className="space-y-2">
          <div 
            className="flex justify-between items-center p-2 rounded bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
            onClick={() => onViewCourses(faculty, 'vacant')}
          >
            <span className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Cours vacants
            </span>
            <Badge variant="secondary" className="bg-orange-500 text-white">
              {vacantCourses}
            </Badge>
          </div>

          <div 
            className="flex justify-between items-center p-2 rounded bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
            onClick={() => onViewCourses(faculty, 'assigned')}
          >
            <span className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Cours attribués
            </span>
            <Badge variant="secondary" className="bg-green-500 text-white">
              {assignedCourses}
            </Badge>
          </div>

          {coursesWithIssues > 0 && (
            <div 
              className="flex justify-between items-center p-2 rounded bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
              onClick={() => onViewCourses(faculty, 'issues')}
            >
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-red-500" />
                En attente
              </span>
              <Badge variant="destructive">
                {coursesWithIssues}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
