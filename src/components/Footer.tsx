import React from "react";
import { LegalMentions } from "./ui/LegalMentions";

export const Footer = () => {
  return (
    <footer className="bg-secondary/20 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-primary mb-4">UCLouvain</h3>
            <p className="text-sm text-muted-foreground">
              Système de gestion des cours et des attributions d'enseignement
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Liens utiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/candidature-libre" className="text-muted-foreground hover:text-primary transition-colors">
                  Candidature libre
                </a>
              </li>
              <li>
                <a href="/demandes-modification" className="text-muted-foreground hover:text-primary transition-colors">
                  Demandes de modification
                </a>
              </li>
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Proposer une équipe
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Pour toute question technique :</p>
              <p>support@uclouvain.be</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UCLouvain. Tous droits réservés.
          </p>
          <LegalMentions />
        </div>
      </div>
    </footer>
  );
};