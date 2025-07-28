import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface TeamMember {
  nom: string;
  prenom: string;
  entite: string;
  statut: string;
  vol1: number;
  vol2: number;
}

interface CourseInfo {
  code: string;
  nom_fr: string;
  nom_en?: string;
  faculte?: string;
  sous_categorie?: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
}

interface ProposalData {
  courseInfo?: CourseInfo;
  coordonnateur: TeamMember;
  cotitulaires: TeamMember[];
  submitterName: string;
  submitterEmail: string;
  submissionDate: string;
}

export const generateProposalPDF = (data: ProposalData, type: 'preview' | 'final' = 'preview') => {
  const doc = new jsPDF();
  
  // Configuration de la page
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPosition = 20;

  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('UCLouvain - Proposition d\'Équipe', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Informations du cours
  if (data.courseInfo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du cours', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Code: ${data.courseInfo.code}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Nom français: ${data.courseInfo.nom_fr}`, margin, yPosition);
    yPosition += 6;
    if (data.courseInfo.nom_en) {
      doc.text(`Nom anglais: ${data.courseInfo.nom_en}`, margin, yPosition);
      yPosition += 6;
    }
    if (data.courseInfo.faculte) {
      doc.text(`Faculté: ${data.courseInfo.faculte}`, margin, yPosition);
      yPosition += 6;
    }
    doc.text(`Volume total Vol.1: ${data.courseInfo.volume_total_vol1}h`, margin, yPosition);
    yPosition += 6;
    doc.text(`Volume total Vol.2: ${data.courseInfo.volume_total_vol2}h`, margin, yPosition);
    yPosition += 15;
  }

  // Coordonnateur
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Coordonnateur', margin, yPosition);
  yPosition += 10;
  
  const coordoData = [
    ['Nom', 'Prénom', 'Entité', 'Statut', 'Vol.1', 'Vol.2'],
    [
      data.coordonnateur.nom,
      data.coordonnateur.prenom,
      data.coordonnateur.entite,
      data.coordonnateur.statut,
      `${data.coordonnateur.vol1}h`,
      `${data.coordonnateur.vol2}h`
    ]
  ];
  
  (doc as any).autoTable({
    startY: yPosition,
    head: [coordoData[0]],
    body: [coordoData[1]],
    margin: { left: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Cotitulaires
  if (data.cotitulaires.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotitulaires', margin, yPosition);
    yPosition += 10;
    
    const cotitData = data.cotitulaires.map(cotit => [
      cotit.nom,
      cotit.prenom,
      cotit.entite,
      cotit.statut,
      `${cotit.vol1}h`,
      `${cotit.vol2}h`
    ]);
    
    (doc as any).autoTable({
      startY: yPosition,
      head: [['Nom', 'Prénom', 'Entité', 'Statut', 'Vol.1', 'Vol.2']],
      body: cotitData,
      margin: { left: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Informations du soumissionnaire
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du soumissionnaire', margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.submitterName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Email: ${data.submitterEmail}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Date de soumission: ${new Date(data.submissionDate).toLocaleDateString('fr-FR')}`, margin, yPosition);
  
  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    type === 'preview' ? 'Prévisualisation - Document non officiel' : 'Document officiel',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const openPDFInNewTab = (doc: jsPDF) => {
  const pdfDataUri = doc.output('datauristring');
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(`
      <html>
        <head><title>Prévisualisation PDF</title></head>
        <body style="margin:0;padding:0;">
          <embed width="100%" height="100%" src="${pdfDataUri}" type="application/pdf">
        </body>
      </html>
    `);
  }
}; 