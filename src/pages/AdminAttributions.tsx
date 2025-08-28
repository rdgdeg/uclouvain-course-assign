import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import AttributionManagementPanel from "@/components/admin/AttributionManagementPanel";

const AdminAttributions = () => {
  const navigate = useNavigate();

  return (
    <Layout showAdminButton={false}>
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au portail
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Contrôle des Attributions</h1>
            <p className="text-muted-foreground">Gestion complète des cours et validation des coordinateurs</p>
          </div>
        </div>

        {/* Contenu principal */}
        <AttributionManagementPanel />
      </div>
    </Layout>
  );
};

export default AdminAttributions;