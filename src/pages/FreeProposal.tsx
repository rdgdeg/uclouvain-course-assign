import React from "react";
import { TemporaryPlaceholder } from "@/components/TemporaryPlaceholder";

const FreeProposal: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <TemporaryPlaceholder 
          title="Free Proposal - Temporairement désactivé" 
        />
      </div>
    </div>
  );
};

export default FreeProposal;