import React, { useState } from "react";
import { TeamProposalForm } from "./TeamProposalForm";
import { PartialVacancyForm } from "./PartialVacancyForm";

interface CourseVacancyManagerProps {
  course: {
    id: number;
    title: string;
    code?: string;
    vacant: boolean;
    partial_vacancy?: boolean;
    assignments?: any[];
    volume_vol1?: number;
    volume_vol2?: number;
    // autres champs utiles
  };
}

export const CourseVacancyManager: React.FC<CourseVacancyManagerProps> = ({ course }) => {
  const [showForm, setShowForm] = useState(false);
  const [showPartialForm, setShowPartialForm] = useState(false);

  if (course.vacant && !course.partial_vacancy) {
    // Cas 1 : totalement vacant
    return (
      <div className="p-4 border rounded bg-background">
        <h2 className="text-lg font-bold mb-2">Ce cours est totalement vacant</h2>
        <p>Vous pouvez proposer une équipe complète pour ce cours.</p>
        {!showForm && (
          <button className="mt-4 btn btn-primary" onClick={() => setShowForm(true)}>
            Proposer une équipe
          </button>
        )}
        {showForm && (
          <TeamProposalForm 
            totalVol1={course.volume_vol1 || 0} 
            totalVol2={course.volume_vol2 || 0} 
            courseId={course.id}
          />
        )}
      </div>
    );
  }
  if (course.partial_vacancy) {
    // Cas 2 : partiellement vacant
    const existants = (course.assignments || []).map((a: any) => ({
      nom: a.teacher?.last_name || "",
      prenom: a.teacher?.first_name || "",
      entite: a.teacher?.entite || "",
      grade: a.teacher?.grade || "",
      vol1: a.vol1_hours || 0,
      vol2: a.vol2_hours || 0,
      existant: true
    }));
    return (
      <div className="p-4 border rounded bg-background">
        <h2 className="text-lg font-bold mb-2">Ce cours est partiellement vacant</h2>
        <p>Certains cotitulaires sont déjà présents. Vous pouvez ajouter de nouveaux cotitulaires et ajuster la répartition des heures.</p>
        {!showPartialForm && (
          <button className="mt-4 btn btn-primary" onClick={() => setShowPartialForm(true)}>
            Ajouter des cotitulaires
          </button>
        )}
        {showPartialForm && (
          <PartialVacancyForm totalVol1={course.volume_vol1 || 0} totalVol2={course.volume_vol2 || 0} existants={existants} />
        )}
      </div>
    );
  }
  // Cas 3 : non vacant
  return (
    <div className="p-4 border rounded bg-background">
      <h2 className="text-lg font-bold mb-2">Ce cours n'est pas vacant</h2>
      <p>Le cours est entièrement attribué. Vous pouvez demander une révision de la répartition actuelle.</p>
      <button className="mt-4 btn btn-secondary">Demander une révision</button>
    </div>
  );
}; 