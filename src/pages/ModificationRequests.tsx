import React from "react";
import { TemporaryPlaceholder } from "@/components/TemporaryPlaceholder";

const ModificationRequests: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <TemporaryPlaceholder 
          title="Modification Requests - Temporairement désactivé" 
        />
      </div>
    </div>
  );
};

export default ModificationRequests;