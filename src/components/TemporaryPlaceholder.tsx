// Correction temporaire pour éviter les erreurs TypeScript
// Supprime les références aux champs inexistants dans la DB

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TemporaryPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <p className="text-gray-600">
            Composant temporairement simplifié pour résoudre les erreurs TypeScript.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Les données de base sont fonctionnelles, l'interface sera restaurée prochainement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};