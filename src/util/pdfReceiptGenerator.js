import { jsPDF } from 'jspdf';

/**
 * Load and convert image to base64
 */
async function loadImageAsBase64(imagePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = imagePath;
  });
}

/**
 * Generate a professional PDF receipt for payroll payments
 * @param {Object} paymentData - The payment data to include in the receipt
 */
export async function generatePDFReceipt(paymentData) {
  const doc = new jsPDF();
  
  // Company colors
  const primaryColor = [16, 185, 129]; // Emerald
  const secondaryColor = [51, 65, 85]; // Slate
  const lightGray = [241, 245, 249];
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPos = 20;
  
  // ============= HEADER WITH LETTERHEAD =============
  try {
    // Load letterhead image
    const letterheadBase64 = await loadImageAsBase64('/Letter_Head.jpeg');
    
    // Get image dimensions to maintain aspect ratio
    const img = new Image();
    img.src = letterheadBase64;
    await new Promise(resolve => { img.onload = resolve; });
    
    const aspectRatio = img.width / img.height;
    
    // Set desired height and calculate width to maintain aspect ratio
    const letterheadHeight = 42;
    const letterheadWidth = letterheadHeight * aspectRatio;
    
    // Center the letterhead horizontally
    const xPos = (pageWidth - letterheadWidth) / 2;
    
    doc.addImage(letterheadBase64, 'JPEG', xPos, 5, letterheadWidth, letterheadHeight);
    
    yPos = letterheadHeight + 15;
  } catch (error) {
    console.error('Failed to load letterhead, using default header:', error);
    
    // Fallback to generated header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('DCS', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Cleaning Services', margin, 35);
    
    yPos = 55;
  }
  
  // ============= RECEIPT TITLE =============
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  
  // Receipt number
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${paymentData.payment_id}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // ============= RECEIPT INFO =============
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  
  // Date and Month info
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.date, margin + 30, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Month:', margin + 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.month, margin + 110, yPos);
  
  yPos += 15;
  
  // ============= STAFF INFORMATION =============
  // Section header
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPos, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('STAFF INFORMATION', margin + 2, yPos + 5.5);
  
  yPos += 15;
  
  // Staff details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.staff_name, margin + 40, yPos);
  
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Role:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.role, margin + 40, yPos);
  
  yPos += 15;
  
  // ============= WORK LOG =============
  // Section header
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPos, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('WORK LOG', margin + 2, yPos + 5.5);
  
  yPos += 12;
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 5, yPos);
  doc.text('Branch', margin + 15, yPos);
  doc.text('Days', margin + 100, yPos);
  doc.text('Rate (LKR)', margin + 125, yPos);
  doc.text('Total (LKR)', pageWidth - margin - 30, yPos);
  
  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
  
  yPos += 8;
  
  // Work log entries
  doc.setFont('helvetica', 'normal');
  paymentData.work_log.forEach((entry, index) => {
    if (yPos > 250) { // Check if we need a new page
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(`${index + 1}`, margin + 5, yPos);
    doc.text(entry.branch, margin + 15, yPos);
    doc.text(entry.days.toString(), margin + 100, yPos);
    doc.text(entry.rate.toLocaleString(), margin + 125, yPos);
    doc.text(entry.total.toLocaleString(), pageWidth - margin - 30, yPos, { align: 'right' });
    
    yPos += 7;
  });
  
  yPos += 5;
  
  // ============= PAYMENT SUMMARY =============
  // Section header
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPos, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PAYMENT SUMMARY', margin + 2, yPos + 5.5);
  
  yPos += 15;
  
  // Summary items
  doc.setFontSize(10);
  const summaryX = pageWidth - margin - 70;
  
  // Gross Total
  doc.setFont('helvetica', 'normal');
  doc.text('Gross Total:', summaryX, yPos);
  doc.text(`LKR ${paymentData.gross_total.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 7;
  
  // Deductions
  doc.text('Deductions:', summaryX, yPos);
  doc.text(`LKR ${paymentData.deductions.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 2;
  
  // Divider line
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  
  // Net Pay (highlighted)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('NET PAY:', summaryX, yPos);
  doc.text(`LKR ${paymentData.net_pay.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 15;
  
  // ============= FOOTER =============
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.text('This is a computer-generated receipt and is valid without signature.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Bottom border line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.line(0, doc.internal.pageSize.getHeight() - 10, pageWidth, doc.internal.pageSize.getHeight() - 10);
  
  // Save the PDF
  const fileName = `Receipt_${paymentData.staff_name.replace(/\s+/g, '_')}_${paymentData.month}_${paymentData.date}.pdf`;
  doc.save(fileName);
}
