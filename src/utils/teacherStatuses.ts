export interface TeacherStatus {
  id: string;
  label: string;
  description: string;
  warning?: string;
  paymentInfo?: string;
}

export const TEACHER_STATUSES: TeacherStatus[] = [
  {
    id: 'AB',
    label: 'Professeur Ordinaire',
    description: 'Professeur titulaire de l\'UCLouvain',
    paymentInfo: 'Rémunération selon le barème académique en vigueur'
  },
  {
    id: 'APH',
    label: 'Chargé de cours invité',
    description: 'Personne extérieure à l\'UCLouvain',
    warning: 'CV requis pour validation',
    paymentInfo: 'Aucun paiement en dessous de 7,5h. Paiement d\'un forfait par tranche de 7,5h de cours'
  },
  {
    id: 'AE',
    label: 'Académique clinique',
    description: 'Personnel académique clinique',
    paymentInfo: 'Rémunération selon les conditions spécifiques aux académiques cliniques'
  }
];

export const getTeacherStatus = (id: string): TeacherStatus | undefined => {
  return TEACHER_STATUSES.find(status => status.id === id);
};

export const getStatusWarning = (statusId: string): string | undefined => {
  const status = getTeacherStatus(statusId);
  return status?.warning;
};

export const getStatusPaymentInfo = (statusId: string): string | undefined => {
  const status = getTeacherStatus(statusId);
  return status?.paymentInfo;
}; 