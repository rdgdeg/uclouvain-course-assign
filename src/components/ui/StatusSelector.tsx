import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { TEACHER_STATUSES, getTeacherStatus } from "@/utils/teacherStatuses";

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Sélectionner un statut" 
}) => {
  const selectedStatus = getTeacherStatus(value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {TEACHER_STATUSES.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              <div className="flex flex-col">
                <span className="font-medium">{status.label}</span>
                <span className="text-xs text-muted-foreground">{status.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedStatus && (
        <div className="space-y-2">
          {selectedStatus.warning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {selectedStatus.warning}
              </AlertDescription>
            </Alert>
          )}
          
          {selectedStatus.paymentInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {selectedStatus.paymentInfo}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}; 