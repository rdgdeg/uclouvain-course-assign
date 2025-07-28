import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const LegalMentions: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-blue-800">Mentions légales et conditions :</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Les données personnelles collectées sont traitées conformément au RGPD et à la politique de confidentialité de l'UCLouvain</li>
              <li>• Cette proposition engage l'équipe proposée pour la durée spécifiée</li>
              <li>• L'UCLouvain se réserve le droit de modifier ou refuser toute proposition</li>
              <li>• Les volumes horaires doivent correspondre exactement au total du cours</li>
              <li>• Pour les APH : CV requis et conditions de paiement spécifiques applicables</li>
              <li>• Toute fausse déclaration peut entraîner le rejet de la candidature</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              En soumettant cette proposition, vous confirmez avoir lu et accepté ces conditions.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}; 