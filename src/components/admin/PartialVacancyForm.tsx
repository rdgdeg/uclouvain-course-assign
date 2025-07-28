import React, { useState } from "react";
import { StatusSelector } from "@/components/ui/StatusSelector";
import { LegalMentions } from "@/components/ui/LegalMentions";

interface Member {
  nom: string;
  prenom: string;
  entite: string;
  statut: string;
  vol1: number;
  vol2: number;
  existant?: boolean;
}

export const PartialVacancyForm: React.FC<{
  totalVol1: number;
  totalVol2: number;
  existants: Member[];
}> = ({ totalVol1, totalVol2, existants }) => {
  const [cotitulaires, setCotitulaires] = useState<Member[]>([]);
  const [editExistants, setEditExistants] = useState(false);
  const [existantsState, setExistantsState] = useState<Member[]>(existants);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

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
    setCotitulaires([...cotitulaires, { nom: "", prenom: "", entite: "", statut: "", vol1: 0, vol2: 0 }]);
  };

  const removeCotitulaire = (idx: number) => {
    setCotitulaires(cotitulaires.filter((_, i) => i !== idx));
  };

  const handleExistantChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newExistants = [...existantsState];
    newExistants[idx] = { ...newExistants[idx], [e.target.name]: e.target.value };
    setExistantsState(newExistants);
  };

  const handleExistantStatusChange = (idx: number, value: string) => {
    const newExistants = [...existantsState];
    newExistants[idx] = { ...newExistants[idx], statut: value };
    setExistantsState(newExistants);
  };

  const sumVol1 = existantsState.reduce((s, m) => s + Number(m.vol1), 0) + cotitulaires.reduce((s, m) => s + Number(m.vol1), 0);
  const sumVol2 = existantsState.reduce((s, m) => s + Number(m.vol2), 0) + cotitulaires.reduce((s, m) => s + Number(m.vol2), 0);

  const isValid = sumVol1 === Number(totalVol1) && 
                 sumVol2 === Number(totalVol2) && 
                 submitterName && 
                 submitterEmail;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // TODO: Implémenter la soumission de la proposition partielle
    console.log('Soumission proposition partielle:', {
      existants: existantsState,
      nouveaux: cotitulaires,
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

      <h3 className="font-bold text-lg mb-2">Cotitulaires existants</h3>
      {existantsState.map((m, idx) => (
        <div key={idx} className="space-y-2 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <input name="nom" value={m.nom} disabled className="input bg-gray-100" />
            <input name="prenom" value={m.prenom} disabled className="input bg-gray-100" />
            <input name="entite" value={m.entite} disabled className="input bg-gray-100" />
            <div className="col-span-2">
              <StatusSelector 
                value={m.statut} 
                onChange={(value) => handleExistantStatusChange(idx, value)}
                placeholder="Statut"
              />
            </div>
            <input 
              name="vol1" 
              type="number" 
              value={m.vol1} 
              disabled={!editExistants} 
              onChange={e => handleExistantChange(idx, e)} 
              className="input" 
            />
            <input 
              name="vol2" 
              type="number" 
              value={m.vol2} 
              disabled={!editExistants} 
              onChange={e => handleExistantChange(idx, e)} 
              className="input" 
            />
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="btn btn-secondary mb-2" 
        onClick={() => setEditExistants(!editExistants)}
      >
        {editExistants ? "Verrouiller les volumes existants" : "Modifier les volumes existants"}
      </button>
      
      <h3 className="font-bold text-lg mt-4 mb-2">Nouveaux cotitulaires</h3>
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
        disabled={!isValid}
      >
        Soumettre la proposition
      </button>
    </form>
  );
}; 