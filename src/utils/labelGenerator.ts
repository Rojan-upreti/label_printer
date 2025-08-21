import { LabelItem, Label, PurchaseOrder } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateLabels = (po: PurchaseOrder): Label[] => {
  const labels: Label[] = [];
  let currentCartonNumber = 1;
  const totalLabels = po.items.reduce((total, item) => {
    return total + Math.ceil(item.quantity / item.casePack);
  }, 0);

  po.items.forEach(item => {
    const itemLabels = Math.ceil(item.quantity / item.casePack);
    
    for (let i = 1; i <= itemLabels; i++) {
      labels.push({
        id: `${item.itemNumber}-${currentCartonNumber}`,
        itemNumber: item.itemNumber,
        itemName: item.itemName,
        upc: item.upc,
        labelNumber: currentCartonNumber,
        totalLabels: totalLabels,
        customerPO: po.customerPO,
        fromLocation: po.fromLocation,
        toLocation: po.toLocation,
        casePack: item.casePack,
        sku: item.sku,
        mfgStyle: item.mfgStyle,
        carton: '',
        countryOfOrigin: item.countryOfOrigin
      });
      currentCartonNumber++;
    }
  });

  return labels;
};

// Helper function to wrap text and fit within specified width
const wrapText = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] => {
  pdf.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
};

// Helper function to get optimal font size for text
const getOptimalFontSize = (pdf: jsPDF, text: string, maxWidth: number, maxHeight: number, startSize: number = 8): number => {
  let fontSize = startSize;
  pdf.setFontSize(fontSize);
  
  while (fontSize > 4) { // Minimum font size of 4
    const lines = wrapText(pdf, text, maxWidth, fontSize);
    const totalHeight = lines.length * (fontSize * 0.3); // Approximate line height
    
    if (totalHeight <= maxHeight) {
      return fontSize;
    }
    fontSize -= 0.5;
  }
  
  return 4; // Minimum font size
};

export const downloadLabelsAsPDF = async (labels: Label[]) => {
  // Create custom 4x6 inch page size (4" width x 6" height)
  const pdf = new jsPDF('p', 'in', [4, 6]); // 4" width x 6" height
  const pageWidth = pdf.internal.pageSize.getWidth(); // 4 inches
  const pageHeight = pdf.internal.pageSize.getHeight(); // 6 inches
  const labelWidth = 3.8; // 3.8 inches (with 0.1" margins on each side)
  const labelHeight = 5.8; // 5.8 inches (with 0.1" margins on each side)
  const margin = 0.1; // 0.1 inch margin
  let currentY = margin;
  let currentX = margin;

  labels.forEach((label, index) => {
    // Check if we need a new page
    if (currentY + labelHeight > pageHeight - margin) {
      pdf.addPage([4, 6]); // Add new 4x6 page
      currentY = margin;
      currentX = margin;
    }

    // Check if we need to move to next column (only 1 label per page for 4x6)
    if (currentX + labelWidth > pageWidth - margin) {
      currentX = margin;
      currentY += labelHeight + 0.05; // 0.05 inch gap between rows
      
      // Check if we need a new page after moving to next column
      if (currentY + labelHeight > pageHeight - margin) {
        pdf.addPage([4, 6]); // Add new 4x6 page
        currentY = margin;
        currentX = margin;
      }
    }

    // Draw label border with rounded corners effect
    pdf.setDrawColor(44, 62, 80); // Dark blue border
    pdf.setLineWidth(0.02); // Thin border
    pdf.rect(currentX, currentY, labelWidth, labelHeight, 'S');
    
    // Add gradient header background
    pdf.setFillColor(102, 126, 234); // Blue gradient start
    pdf.rect(currentX, currentY, labelWidth, 0.5, 'F');
    
    // Header text - Auto-fit to width
    pdf.setTextColor(255, 255, 255);
    const headerText = `Carton ${label.labelNumber} out of ${label.totalLabels}`;
    const headerFontSize = getOptimalFontSize(pdf, headerText, labelWidth - 0.1, 0.4, 10);
    pdf.setFontSize(headerFontSize);
    pdf.setFont('helvetica', 'bold');
    const headerWidth = pdf.getTextWidth(headerText);
    pdf.text(headerText, currentX + (labelWidth - headerWidth) / 2, currentY + 0.3);
    
    // Reset text color for content
    pdf.setTextColor(44, 62, 80);
    
    // From/To Section at Top - Auto-fit text
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(currentX + 0.05, currentY + 0.6, labelWidth - 0.1, 0.4, 'F');
    pdf.setDrawColor(102, 126, 234);
    pdf.setLineWidth(0.01);
    pdf.rect(currentX + 0.05, currentY + 0.6, labelWidth - 0.1, 0.4, 'S');
    
    // From/To text with auto-sizing
    const fromToFontSize = Math.min(
      getOptimalFontSize(pdf, label.fromLocation, (labelWidth - 0.2) / 2, 0.2, 7),
      getOptimalFontSize(pdf, label.toLocation, (labelWidth - 0.2) / 2, 0.2, 7)
    );
    
    pdf.setFontSize(fromToFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FROM:', currentX + 0.1, currentY + 0.75);
    pdf.text('TO:', currentX + 2.0, currentY + 0.75);
    
    pdf.setFont('helvetica', 'normal');
    
    // Wrap and fit From location
    const fromLines = wrapText(pdf, label.fromLocation, (labelWidth - 0.2) / 2, fromToFontSize);
    fromLines.forEach((line, i) => {
      pdf.text(line, currentX + 0.1, currentY + 0.75 + (i + 1) * (fromToFontSize * 0.15));
    });
    
    // Wrap and fit To location
    const toLines = wrapText(pdf, label.toLocation, (labelWidth - 0.2) / 2, fromToFontSize);
    toLines.forEach((line, i) => {
      pdf.text(line, currentX + 2.0, currentY + 0.75 + (i + 1) * (fromToFontSize * 0.15));
    });
    
    // Divider line
    pdf.setLineWidth(0.02);
    pdf.line(currentX + 1.9, currentY + 0.7, currentX + 1.9, currentY + 0.95);
    
    // Main Information Section - Auto-fit all fields
    let yOffset = 1.1;
    const fields = [
      { label: 'PO:', value: label.customerPO },
      { label: 'UPC:', value: label.upc },
      { label: 'Description:', value: label.itemName },
      { label: 'SKU #:', value: label.sku },
      { label: 'TJX Style:', value: label.mfgStyle },
      { label: 'Case Pack:', value: label.casePack.toString() }
    ];
    
    const maxFieldHeight = (labelHeight - 1.8) / fields.length; // Distribute remaining height
    
    fields.forEach(field => {
      // Calculate optimal font size for this field
      const fieldFontSize = getOptimalFontSize(pdf, field.value, labelWidth - 0.8, maxFieldHeight, 6);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fieldFontSize);
      pdf.text(field.label, currentX + 0.05, currentY + yOffset);
      pdf.setFont('helvetica', 'normal');
      
      // Wrap and fit the value text
      const valueLines = wrapText(pdf, field.value, labelWidth - 0.8, fieldFontSize);
      valueLines.forEach((line, i) => {
        pdf.text(line, currentX + 0.6, currentY + yOffset + i * (fieldFontSize * 0.15));
      });
      
      // Move to next field position
      yOffset += Math.max(maxFieldHeight, valueLines.length * (fieldFontSize * 0.15) + 0.05);
    });
    
    // Country of Origin at Bottom - Auto-fit
    pdf.setFillColor(248, 249, 250); // Light gray background
    pdf.rect(currentX + 0.05, currentY + 5.2, labelWidth - 0.1, 0.4, 'F');
    pdf.setDrawColor(108, 117, 125);
    pdf.setLineWidth(0.01);
    pdf.rect(currentX + 0.05, currentY + 5.2, labelWidth - 0.1, 0.4, 'S');
    
    const originText = `Country of Origin: ${label.countryOfOrigin}`;
    const originFontSize = getOptimalFontSize(pdf, originText, labelWidth - 0.1, 0.35, 7);
    pdf.setFontSize(originFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    const originWidth = pdf.getTextWidth(originText);
    pdf.text(originText, currentX + (labelWidth - originWidth) / 2, currentY + 5.45);

    // Move to next position (only 1 label per page for 4x6)
    currentX += labelWidth + 0.05; // 0.05 inch gap between labels
  });

  // Save the PDF
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  pdf.save(`labels-${timestamp}.pdf`);
};

export const printLabels = () => {
  window.print();
}; 