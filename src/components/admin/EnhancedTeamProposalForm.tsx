import React, { useState, useEffect } from "react";
import { useProposals } from "@/hooks/useProposals";
import { StatusSelector } from "@/components/ui/StatusSelector";
import { LegalMentions } from "@/components/ui/LegalMentions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  Eye, 
  Download, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Member {
  nom: string;
  prenom: string;
  entite: string;
  statut: string;
  vol1: number;
  vol2: number;
}

interface FormData {
  coordonnateur: Member;
  cotitulaires: Member[];
  submitterName: string;
  submitterEmail: string;
}

export const EnhancedTeamProposalForm: React.FC<{ 
  totalVol1: number; 
  totalVol2: number;
  courseId?: number;
}> = ({ totalVol1, totalVol2, courseId }) => {
  const [formData, setFormData] = useState<FormData>({
    coordonnateur: { nom: "", prenom: "", entite: "", statut: "", vol1: 0, vol2: 0 },
    cotitulaires: [],
    submitterName: "",
    submitterEmail: ""
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { submitTeamProposal } = useProposals();

  // Auto-sauvegarde locale
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem('team_proposal_draft', JSON.stringify(formData));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Erreur de sauvegarde locale:', error);
      }
    };

    const timeoutId = setTimeout(saveToLocalStorage, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Restaurer les données au chargement
  useEffect(() => {
    const saved = localStorage.getItem('team_proposal_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (error) {
        console.error('Erreur de restauration:', error);
      }
    }
  }, []);

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCoordoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      coordonnateur: { ...prev.coordonnateur, [e.target.name]: e.target.value }
    }));
  };

  const handleCoordoStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      coordonnateur: { ...prev.coordonnateur, statut: value }
    }));
  };

  const handleCotitChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => {
      const newCotits = [...prev.cotitulaires];
      newCotits[idx] = { ...newCotits[idx], [e.target.name]: e.target.value };
      return { ...prev, cotitulaires: newCotits };
    });
  };

  const handleCotitStatusChange = (idx: number, value: string) => {
    setFormData(prev => {
      const newCotits = [...prev.cotitulaires];
      newCotits[idx] = { ...newCotits[idx], statut: value };
      return { ...prev, cotitulaires: newCotits };
    });
  };

  const addCotitulaire = () => {
    setFormData(prev => ({
      ...prev,
      cotitulaires: [...prev.cotitulaires, { nom: "", prenom: "", entite: "", statut: "", vol1: 0, vol2: 0 }]
    }));
  };

  const removeCotitulaire = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      cotitulaires: prev.cotitulaires.filter((_, i) => i !== idx)
    }));
  };

  const reorderCotitulaires = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newCotits = [...prev.cotitulaires];
      const [moved] = newCotits.splice(fromIndex, 1);
      newCotits.splice(toIndex, 0, moved);
      return { ...prev, cotitulaires: newCotits };
    });
  };

  const sumVol1 = Number(formData.coordonnateur.vol1) + formData.cotitulaires.reduce((s, m) => s + Number(m.vol1), 0);
  const sumVol2 = Number(formData.coordonnateur.vol2) + formData.cotitulaires.reduce((s, m) => s + Number(m.vol2), 0);

  const isValid = sumVol1 === Number(totalVol1) && 
                 sumVol2 === Number(totalVol2) && 
                 formData.submitterName && 
                 formData.submitterEmail &&
                 formData.coordonnateur.nom && 
                 formData.coordonnateur.prenom && 
                 formData.coordonnateur.entite && 
                 formData.coordonnateur.statut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    submitTeamProposal.mutate({
      courseId,
      coordonnateur: formData.coordonnateur,
      cotitulaires: formData.cotitulaires,
      submitterName: formData.submitterName,
      submitterEmail: formData.submitterEmail
    });

    // Nettoyer la sauvegarde locale après soumission
    localStorage.removeItem('team_proposal_draft');
  };

  const generatePreview = () => {
    setShowPreview(true);
    // Ici on pourrait générer un PDF ou afficher une prévisualisation
  };

  return (
    <div className="space-y-6">
      {/* Barre de statut */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {isOnline ? "En ligne" : "Hors ligne"}
                </span>
              </div>
              
              {lastSaved && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">
                    Sauvegardé à {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Mode hors ligne
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={!isValid}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="font-bold text-lg mb-2">Vos informations</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            name="submitterName" 
            placeholder="Votre nom complet" 
            value={formData.submitterName} 
            onChange={(e) => setFormData(prev => ({ ...prev, submitterName: e.target.value }))} 
            required 
          />
          <Input 
            name="submitterEmail" 
            type="email" 
            placeholder="Votre email" 
            value={formData.submitterEmail} 
            onChange={(e) => setFormData(prev => ({ ...prev, submitterEmail: e.target.value }))} 
            required 
          />
        </div>
        
        <h3 className="font-bold text-lg mb-2">Coordonnateur</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input name="nom" placeholder="Nom" value={formData.coordonnateur.nom} onChange={handleCoordoChange} required />
          <Input name="prenom" placeholder="Prénom" value={formData.coordonnateur.prenom} onChange={handleCoordoChange} required />
          <Input name="entite" placeholder="Entité" value={formData.coordonnateur.entite} onChange={handleCoordoChange} required />
          <div className="col-span-2">
            <StatusSelector 
              value={formData.coordonnateur.statut} 
              onChange={handleCoordoStatusChange}
              placeholder="Statut du coordonnateur"
            />
          </div>
          <Input name="vol1" type="number" placeholder="Vol.1" value={formData.coordonnateur.vol1} onChange={handleCoordoChange} />
          <Input name="vol2" type="number" placeholder="Vol.2" value={formData.coordonnateur.vol2} onChange={handleCoordoChange} />
        </div>
        
        <h3 className="font-bold text-lg mt-4 mb-2">Cotitulaires</h3>
        {formData.cotitulaires.map((cotit, idx) => (
          <Card key={idx} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </div>
                <span className="text-sm font-medium">Cotitulaire {idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCotitulaire(idx)}
                  className="ml-auto text-destructive hover:text-destructive"
                >
                  Supprimer
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input name="nom" placeholder="Nom" value={cotit.nom} onChange={e => handleCotitChange(idx, e)} />
                <Input name="prenom" placeholder="Prénom" value={cotit.prenom} onChange={e => handleCotitChange(idx, e)} />
                <Input name="entite" placeholder="Entité" value={cotit.entite} onChange={e => handleCotitChange(idx, e)} />
                <div className="col-span-2">
                  <StatusSelector 
                    value={cotit.statut} 
                    onChange={(value) => handleCotitStatusChange(idx, value)}
                    placeholder="Statut du cotitulaire"
                  />
                </div>
                <Input name="vol1" type="number" placeholder="Vol.1" value={cotit.vol1} onChange={e => handleCotitChange(idx, e)} />
                <Input name="vol2" type="number" placeholder="Vol.2" value={cotit.vol2} onChange={e => handleCotitChange(idx, e)} />
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button type="button" onClick={addCotitulaire} variant="outline" className="w-full">
          Ajouter un cotitulaire
        </Button>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className={isValid ? "text-green-600" : "text-red-600"}>
              Total Vol.1 : {sumVol1} / {totalVol1} &nbsp; | &nbsp; Total Vol.2 : {sumVol2} / {totalVol2}
            </span>
            {isValid && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </div>

        <LegalMentions />
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={!isValid || submitTeamProposal.isPending || !isOnline}
          >
            {submitTeamProposal.isPending ? "Soumission en cours..." : "Soumettre la proposition"}
          </Button>
          
          {!isOnline && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Hors ligne
            </Badge>
          )}
        </div>
      </form>

      {/* Prévisualisation */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation de la proposition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Coordonnateur</h4>
                <p>{formData.coordonnateur.prenom} {formData.coordonnateur.nom} - {formData.coordonnateur.entite}</p>
                <p>Statut: {formData.coordonnateur.statut} | Vol.1: {formData.coordonnateur.vol1}h | Vol.2: {formData.coordonnateur.vol2}h</p>
              </div>
              
              {formData.cotitulaires.length > 0 && (
                <div>
                  <h4 className="font-semibold">Cotitulaires ({formData.cotitulaires.length})</h4>
                  {formData.cotitulaires.map((cotit, idx) => (
                    <div key={idx} className="ml-4">
                      <p>{cotit.prenom} {cotit.nom} - {cotit.entite}</p>
                      <p>Statut: {cotit.statut} | Vol.1: {cotit.vol1}h | Vol.2: {cotit.vol2}h</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Fermer
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 