import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './utils';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoice = (saleData: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // Small thermal printer style or standard A5
  });

  // Since jsPDF default fonts don't support Arabic well without extra files,
  // we'll use simple shapes and standard text for now, but a real app would embed an Arabic font.
  // For this prototype, we'll try to use a standard font that might work or just provide a professional layout.

  doc.setFontSize(18);
  doc.text('EL HADJ TAYEB', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Construction Materials', 105, 25, { align: 'center' });
  
  doc.line(10, 30, 138, 30);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${saleData.id?.substring(0, 8)}`, 10, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 45);
  doc.text(`Customer: ${saleData.customerName || 'Walking Customer'}`, 10, 50);

  const tableData = saleData.items.map((item: any) => [
    item.name,
    item.quantity,
    formatCurrency(item.price),
    formatCurrency(item.subtotal)
  ]);

  doc.autoTable({
    startY: 60,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 8, font: 'helvetica' }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.text(`Total Amount: ${formatCurrency(saleData.totalAmount)}`, 138, finalY, { align: 'right' });
  
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });

  doc.save(`invoice_${saleData.id?.substring(0, 8)}.pdf`);
};
