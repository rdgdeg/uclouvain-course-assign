import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from "@/hooks/useCourses";
import { useProposals } from "@/hooks/useProposals";
import { CourseManagementDialog } from "@/components/CourseManagementDialog";
import { Course } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const CentralizedCourseManagement: React.FC = () => {
  const { courses, isLoading } = useCourses();
  const { pendingProposals, validateProposal } = useProposals();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.faculty && course.faculty.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleValidateProposal = async (proposalId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await validateProposal.mutateAsync({
        proposalId,
        status,
        adminNotes: notes
      });
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Chargement des cours...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion Centralisée des Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleCreateCourse}>
              Nouveau cours
            </Button>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList>
              <TabsTrigger value="courses">Cours ({filteredCourses.length})</TabsTrigger>
              <TabsTrigger value="proposals">
                Propositions ({pendingProposals?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="grid gap-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{course.title}</h3>
                            {course.code && (
                              <Badge variant="outline">{course.code}</Badge>
                            )}
                            <Badge variant={course.vacant ? "destructive" : "default"}>
                              {course.vacant ? "Vacant" : "Attribué"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            {course.faculty && <p>Faculté: {course.faculty}</p>}
                            {course.subcategory && <p>Sous-catégorie: {course.subcategory}</p>}
                            <div className="flex gap-4">
                              {course.volume_total_vol1 && (
                                <span>Vol1: {course.volume_total_vol1}h</span>
                              )}
                              {course.volume_total_vol2 && (
                                <span>Vol2: {course.volume_total_vol2}h</span>
                              )}
                            </div>
                            {course.assignments && course.assignments.length > 0 && (
                              <p>Attributions: {course.assignments.length}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="proposals" className="space-y-4">
              <div className="grid gap-4">
                {pendingProposals?.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">
                            Proposition de {proposal.submitter_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Email: {proposal.submitter_email}
                          </p>
                          <p className="text-sm">
                            Soumise le: {new Date(proposal.submission_date).toLocaleDateString()}
                          </p>
                          {proposal.course_id && (
                            <p className="text-sm">
                              Cours ID: {proposal.course_id}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidateProposal(proposal.id, 'approved')}
                          >
                            Approuver
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleValidateProposal(proposal.id, 'rejected')}
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!pendingProposals || pendingProposals.length === 0) && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">Aucune proposition en attente</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CourseManagementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        course={selectedCourse}
        mode={dialogMode}
      />
    </div>
  );
};