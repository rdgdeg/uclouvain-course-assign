import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailService } from "@/integrations/resend/client";

export const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [emailType, setEmailType] = useState("notification");
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const emailTypes = [
    { value: "notification", label: "Notification générale" },
    { value: "team_proposal", label: "Confirmation proposition d'équipe" },
    { value: "modification_request", label: "Confirmation demande de modification" },
    { value: "status_update", label: "Notification de statut" },
    { value: "free_proposal", label: "Confirmation candidature libre" },
  ];

  const sendTestEmail = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir l'email et le nom de test.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      let success = false;
      let message = "";

      switch (emailType) {
        case "notification":
          success = await EmailService.sendNotification({
            recipientEmail: testEmail,
            recipientName: testName,
            subject: "Test - Notification UCLouvain",
            message: "Ceci est un email de test pour vérifier la configuration de Resend.",
            actionUrl: "https://uclouvain.be",
            actionText: "Visiter UCLouvain"
          });
          message = success ? "Email de notification envoyé avec succès" : "Erreur lors de l'envoi";
          break;

        case "team_proposal":
          success = await EmailService.sendTeamProposalConfirmation(
            testEmail,
            testName,
            "Test de cours",
            "TEST001"
          );
          message = success ? "Email de confirmation de proposition envoyé" : "Erreur lors de l'envoi";
          break;

        case "modification_request":
          success = await EmailService.sendModificationRequestConfirmation(
            testEmail,
            testName,
            "Test de modification",
            "Test de cours"
          );
          message = success ? "Email de confirmation de demande envoyé" : "Erreur lors de l'envoi";
          break;

        case "status_update":
          success = await EmailService.sendStatusNotification(
            testEmail,
            testName,
            "approved",
            "proposal",
            "Test de cours",
            "Test d'approbation"
          );
          message = success ? "Email de notification de statut envoyé" : "Erreur lors de l'envoi";
          break;

        case "free_proposal":
          success = await EmailService.sendFreeProposalConfirmation(
            testEmail,
            testName,
            "Test de cours",
            "TEST001"
          );
          message = success ? "Email de confirmation de candidature libre envoyé" : "Erreur lors de l'envoi";
          break;

        default:
          message = "Type d'email non reconnu";
          success = false;
      }

      setLastResult({ success, message });

      if (success) {
        toast({
          title: "Test réussi",
          description: "L'email de test a été envoyé avec succès.",
        });
      } else {
        toast({
          title: "Test échoué",
          description: "Impossible d'envoyer l'email de test.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du test d\'email:', error);
      setLastResult({ success: false, message: `Erreur: ${error}` });
      toast({
        title: "Erreur de test",
        description: "Une erreur est survenue lors du test d'envoi d'email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test d'envoi d'emails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-email">Email de test</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="votre-email@uclouvain.be"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="test-name">Nom de test</Label>
            <Input
              id="test-name"
              placeholder="Votre nom"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email-type">Type d'email</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type d'email" />
            </SelectTrigger>
            <SelectContent>
              {emailTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={sendTestEmail}
            disabled={isSending || !testEmail || !testName}
            className="flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSending ? "Envoi en cours..." : "Envoyer un email de test"}
          </Button>

          {lastResult && (
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={lastResult.success ? "default" : "destructive"}>
                {lastResult.message}
              </Badge>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Utilisez votre email UCLouvain pour les tests</li>
            <li>• Vérifiez votre boîte de réception après l'envoi</li>
            <li>• Les emails peuvent prendre quelques minutes à arriver</li>
            <li>• Vérifiez que VITE_RESEND_API_KEY est configurée</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 