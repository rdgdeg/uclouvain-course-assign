import React, { useState } from "react";
import { useProposals } from "@/hooks/useProposals";
import { StatusSelector } from "@/components/ui/StatusSelector";
import { LegalMentions } from "@/components/ui/LegalMentions";

import { TeamMember } from "@/types";

interface Member extends TeamMember {
  statut: string;
}

export const TeamProposalForm: React.FC<{ 
  totalVol1: number; 
  totalVol2: number;
  courseId?: number;
}> = ({ totalVol1, totalVol2, courseId }) => {
  const [coordo, setCoordo] = useState<Member>({ nom: "", prenom: "", entite: "", grade: "", statut: "", vol1: 0, vol2: 0 });
  const [cotitulaires, setCotitulaires] = useState<Member[]>([]);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

  const { submitTeamProposal } = useProposals();

  const handleCoordoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordo({ ...coordo, [e.target.name]: e.target.value });
  };

  const handleCoordoStatusChange = (value: string) => {
    setCoordo({ ...coordo, statut: value });
  };

  const handleCotitChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newCotits = [...cotitulaires];
    newCotits[idx] = { ...newCotits[idx], [e.target.name]: e.target.value };
    setCotitulaires(newCotits);
  };

  const handleCotitStatusChange = (idx: number, value: string) => {
    const newCotits = [...cotitulaires];
    newCotits[idx] = { ...newCotits[idx], statut: value };
    setCotitulaires(newCotits);
  };

  const addCotitulaire = () => {
    setCotitulaires([...cotitulaires, { nom: "", prenom: "", entite: "", grade: "", statut: "", vol1: 0, vol2: 0 }]);
  };

  const removeCotitulaire = (idx: number) => {
    setCotitulaires(cotitulaires.filter((_, i) => i !== idx));
  };

  const sumVol1 = Number(coordo.vol1) + cotitulaires.reduce((s, m) => s + Number(m.vol1), 0);
  const sumVol2 = Number(coordo.vol2) + cotitulaires.reduce((s, m) => s + Number(m.vol2), 0);

  const isValid = sumVol1 === Number(totalVol1) && 
                 sumVol2 === Number(totalVol2) && 
                 submitterName && 
                 submitterEmail &&
                 coordo.nom && coordo.prenom && coordo.entite && coordo.statut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    submitTeamProposal.mutate({
      courseId,
      coordonnateur: { ...coordo, grade: coordo.statut },
      cotitulaires: cotitulaires.map(c => ({ ...c, grade: c.statut })),
      submitterName,
      submitterEmail
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <h3 className="font-bold text-lg mb-2">Vos informations</h3>
      <div className="grid grid-cols-2 gap-2">
        <input 
          name="submitterName" 
          placeholder="Votre nom complet" 
          value={submitterName} 
          onChange={(e) => setSubmitterName(e.target.value)} 
          className="input" 
          required 
        />
        <input 
          name="submitterEmail" 
          type="email" 
          placeholder="Votre email" 
          value={submitterEmail} 
          onChange={(e) => setSubmitterEmail(e.target.value)} 
          className="input" 
          required 
        />
      </div>
      
      <h3 className="font-bold text-lg mb-2">Coordonnateur</h3>
      <div className="grid grid-cols-2 gap-2">
        <input name="nom" placeholder="Nom" value={coordo.nom} onChange={handleCoordoChange} className="input" required />
        <input name="prenom" placeholder="Prénom" value={coordo.prenom} onChange={handleCoordoChange} className="input" required />
        <input name="entite" placeholder="Entité" value={coordo.entite} onChange={handleCoordoChange} className="input" required />
        <div className="col-span-2">
          <StatusSelector 
            value={coordo.statut} 
            onChange={handleCoordoStatusChange}
            placeholder="Statut du coordonnateur"
          />
        </div>
        <input name="vol1" type="number" placeholder="Vol.1" value={coordo.vol1} onChange={handleCoordoChange} className="input" />
        <input name="vol2" type="number" placeholder="Vol.2" value={coordo.vol2} onChange={handleCoordoChange} className="input" />
      </div>
      
      <h3 className="font-bold text-lg mt-4 mb-2">Cotitulaires</h3>
      {cotitulaires.map((cotit, idx) => (
        <div key={idx} className="space-y-2 p-4 border rounded">
          <div className="grid grid-cols-2 gap-2">
            <input name="nom" placeholder="Nom" value={cotit.nom} onChange={e => handleCotitChange(idx, e)} className="input" />
            <input name="prenom" placeholder="Prénom" value={cotit.prenom} onChange={e => handleCotitChange(idx, e)} className="input" />
            <input name="entite" placeholder="Entité" value={cotit.entite} onChange={e => handleCotitChange(idx, e)} className="input" />
            <div className="col-span-2">
              <StatusSelector 
                value={cotit.statut} 
                onChange={(value) => handleCotitStatusChange(idx, value)}
                placeholder="Statut du cotitulaire"
              />
            </div>
            <input name="vol1" type="number" placeholder="Vol.1" value={cotit.vol1} onChange={e => handleCotitChange(idx, e)} className="input" />
            <input name="vol2" type="number" placeholder="Vol.2" value={cotit.vol2} onChange={e => handleCotitChange(idx, e)} className="input" />
          </div>
          <button type="button" onClick={() => removeCotitulaire(idx)} className="btn btn-danger text-sm">
            Supprimer ce cotitulaire
          </button>
        </div>
      ))}
      
      <button type="button" onClick={addCotitulaire} className="btn btn-secondary">
        Ajouter un cotitulaire
      </button>
      
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <span className={isValid ? "text-green-600" : "text-red-600"}>
          Total Vol.1 : {sumVol1} / {totalVol1} &nbsp; | &nbsp; Total Vol.2 : {sumVol2} / {totalVol2}
        </span>
      </div>

      <LegalMentions />
      
      <button 
        type="submit" 
        className="btn btn-primary mt-4 w-full" 
        disabled={!isValid || submitTeamProposal.isPending}
      >
        {submitTeamProposal.isPending ? "Soumission en cours..." : "Soumettre la proposition"}
      </button>
    </form>
  );
}; 