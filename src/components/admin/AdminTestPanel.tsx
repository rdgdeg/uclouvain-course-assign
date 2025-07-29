import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Plus, 
  Trash2, 
  Edit,
  Database,
  TestTube,
  AlertTriangle,
  Info
} from "lucide-react";

export const AdminTestPanel: React.FC = () => {
  const [testCourse, setTestCourse] = useState({
    title: "Cours de Test",
    code: "TEST001",
    faculty: "FSM",
    subcategory: "Informatique",
    volume_total_vol1: 30,
    volume_total_vol2: 15,
    vacant: true
  });
  
  const [testTeacher, setTestTeacher] = useState({
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean.dupont@test.com",
    status: "active"
  });
  
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les cours
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['test-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer les enseignants
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['test-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer les attributions
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['test-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_assignments')
        .select(`
          *,
          course:courses(*),
          teacher:teachers(*)
        `)
        .limit(5)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation pour créer un cours de test
  const createTestCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-courses'] });
      toast({
        title: "Cours de test créé",
        description: "Le cours de test a été ajouté avec succès",
      });
      addTestResult("✅ Cours de test créé avec succès");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le cours: ${error.message}`,
        variant: "destructive",
      });
      addTestResult("❌ Erreur lors de la création du cours");
    }
  });

  // Mutation pour créer un enseignant de test
  const createTestTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const { data, error } = await supabase
        .from('teachers')
        .insert([teacherData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-teachers'] });
      toast({
        title: "Enseignant de test créé",
        description: "L'enseignant de test a été ajouté avec succès",
      });
      addTestResult("✅ Enseignant de test créé avec succès");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'enseignant: ${error.message}`,
        variant: "destructive",
      });
      addTestResult("❌ Erreur lors de la création de l'enseignant");
    }
  });

  // Mutation pour créer une attribution de test
  const createTestAssignmentMutation = useMutation({
    mutationFn: async ({ courseId, teacherId }: { courseId: number; teacherId: number }) => {
      const { data, error } = await supabase
        .from('course_assignments')
        .insert([{
          course_id: courseId,
          teacher_id: teacherId,
          vol1_hours: 15,
          vol2_hours: 10,
          is_coordinator: true,
          validated_by_coord: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-assignments'] });
      toast({
        title: "Attribution de test créée",
        description: "L'attribution de test a été ajoutée avec succès",
      });
      addTestResult("✅ Attribution de test créée avec succès");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'attribution: ${error.message}`,
        variant: "destructive",
      });
      addTestResult("❌ Erreur lors de la création de l'attribution");
    }
  });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult("🚀 Démarrage des tests d'administration...");
    
    // Test 1: Créer un cours
    addTestResult("📝 Test 1: Création d'un cours de test");
    createTestCourseMutation.mutate(testCourse);
    
    // Test 2: Créer un enseignant
    setTimeout(() => {
      addTestResult("👤 Test 2: Création d'un enseignant de test");
      createTestTeacherMutation.mutate(testTeacher);
    }, 1000);
    
    // Test 3: Créer une attribution (si on a des cours et enseignants)
    setTimeout(() => {
      if (courses.length > 0 && teachers.length > 0) {
        addTestResult("🔗 Test 3: Création d'une attribution de test");
        createTestAssignmentMutation.mutate({
          courseId: courses[0].id,
          teacherId: teachers[0].id
        });
      } else {
        addTestResult("⚠️ Test 3: Impossible - pas assez de cours ou enseignants");
      }
    }, 2000);
  };

  const clearTestData = async () => {
    try {
      // Supprimer les données de test (cours avec code TEST*)
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .like('code', 'TEST%');
      
      if (courseError) throw courseError;
      
      // Supprimer les enseignants de test (email contenant test)
      const { error: teacherError } = await supabase
        .from('teachers')
        .delete()
        .like('email', '%test%');
      
      if (teacherError) throw teacherError;
      
      queryClient.invalidateQueries({ queryKey: ['test-courses'] });
      queryClient.invalidateQueries({ queryKey: ['test-teachers'] });
      queryClient.invalidateQueries({ queryKey: ['test-assignments'] });
      
      toast({
        title: "Données de test supprimées",
        description: "Toutes les données de test ont été supprimées",
      });
      
      addTestResult("🧹 Données de test supprimées");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer les données: ${error.message}`,
        variant: "destructive",
      });
      addTestResult("❌ Erreur lors de la suppression des données");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Panel de Test - Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Actions de Test</Label>
              <div className="space-y-2 mt-2">
                <Button 
                  onClick={runAllTests}
                  className="w-full"
                  disabled={createTestCourseMutation.isPending}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Lancer tous les tests
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={clearTestData}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Nettoyer les données de test
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Statistiques</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold">{courses.length}</div>
                  <div className="text-xs text-muted-foreground">Cours</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold">{teachers.length}</div>
                  <div className="text-xs text-muted-foreground">Enseignants</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="text-lg font-bold">{assignments.length}</div>
                  <div className="text-xs text-muted-foreground">Attributions</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats des tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Résultats des Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun test exécuté. Cliquez sur "Lancer tous les tests" pour commencer.
              </p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Données de test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cours Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <p className="text-muted-foreground text-sm">Chargement...</p>
            ) : courses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun cours</p>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{course.code}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enseignants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enseignants Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {teachersLoading ? (
              <p className="text-muted-foreground text-sm">Chargement...</p>
            ) : teachers.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun enseignant</p>
            ) : (
              <div className="space-y-2">
                {teachers.slice(0, 3).map((teacher) => (
                  <div key={teacher.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">
                      {teacher.first_name} {teacher.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">{teacher.email}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attributions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Attributions Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <p className="text-muted-foreground text-sm">Chargement...</p>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune attribution</p>
            ) : (
              <div className="space-y-2">
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">
                      {assignment.course?.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {assignment.teacher?.first_name} {assignment.teacher?.last_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de configuration des tests */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration des Tests</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Cours de test</Label>
              <Input
                value={testCourse.title}
                onChange={(e) => setTestCourse(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du cours"
              />
            </div>
            
            <div>
              <Label>Enseignant de test</Label>
              <Input
                value={`${testTeacher.first_name} ${testTeacher.last_name}`}
                onChange={(e) => {
                  const [first, last] = e.target.value.split(' ');
                  setTestTeacher(prev => ({ 
                    ...prev, 
                    first_name: first || '', 
                    last_name: last || '' 
                  }));
                }}
                placeholder="Prénom Nom"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 