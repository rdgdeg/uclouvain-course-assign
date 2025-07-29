import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface VolumeValidationProps {
  requiredVol1: number;
  requiredVol2: number;
  proposedVol1: number;
  proposedVol2: number;
  isValid: boolean;
}

export const VolumeValidation: React.FC<VolumeValidationProps> = ({
  requiredVol1,
  requiredVol2,
  proposedVol1,
  proposedVol2,
  isValid
}) => {
  const vol1Match = proposedVol1 === requiredVol1;
  const vol2Match = proposedVol2 === requiredVol2;
  const totalRequired = requiredVol1 + requiredVol2;
  const totalProposed = proposedVol1 + proposedVol2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Validation des volumes horaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Volume requis</h4>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Vol.1: {requiredVol1}h
              </Badge>
              <Badge variant="outline" className="text-sm">
                Vol.2: {requiredVol2}h
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {totalRequired}h
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Volume proposé</h4>
            <div className="flex items-center gap-4">
              <Badge 
                variant={vol1Match ? "default" : "destructive"} 
                className="text-sm"
              >
                Vol.1: {proposedVol1}h
              </Badge>
              <Badge 
                variant={vol2Match ? "default" : "destructive"} 
                className="text-sm"
              >
                Vol.2: {proposedVol2}h
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {totalProposed}h
            </p>
          </div>
        </div>

        {/* Détails des erreurs */}
        {!isValid && (
          <div className="space-y-2">
            {!vol1Match && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Volume 1: {proposedVol1}h proposé pour {requiredVol1}h requis 
                ({proposedVol1 > requiredVol1 ? '+' : ''}{proposedVol1 - requiredVol1}h)
              </div>
            )}
            {!vol2Match && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Volume 2: {proposedVol2}h proposé pour {requiredVol2}h requis 
                ({proposedVol2 > requiredVol2 ? '+' : ''}{proposedVol2 - requiredVol2}h)
              </div>
            )}
          </div>
        )}

        {/* Messages de validation */}
        {isValid ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Les volumes horaires correspondent parfaitement. Vous pouvez soumettre votre candidature.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Veuillez ajuster les volumes horaires pour qu'ils correspondent aux volumes requis.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 