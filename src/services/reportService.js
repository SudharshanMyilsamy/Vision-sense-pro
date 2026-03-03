import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReport = (history) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("VisionSense Detection Report", 14, 22);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 14, 30);

  // Prepare data for table
  const tableData = [];
  
  history.forEach(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    entry.objects.forEach(obj => {
      tableData.push([
        time,
        obj.label,
        `${(obj.confidence * 100).toFixed(0)}%`,
        obj.description
      ]);
    });
  });

  if (tableData.length === 0) {
    doc.setFontSize(12);
    doc.text("No detections recorded in this session.", 14, 40);
  } else {
    autoTable(doc, {
      head: [['Time', 'Object', 'Confidence', 'Description']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, // Blue-600
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Save the PDF
  doc.save(`vision-sense-report-${Date.now()}.pdf`);
};
