import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF invoice and saves it to the public/invoices folder.
 * Returns a local URL path that can be served statically.
 */
export async function generateInvoicePDF(
  orderId: string,
  cart: Array<{ name: string; quantity: number; price: number }>,
  total: number
): Promise<string> {
  const invoicesDir = path.join(process.cwd(), 'public', 'invoices');

  // Ensure directory exists
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice-${orderId}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ── Header ──
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#128C7E')
      .text('ChatBiz', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('WhatsApp Commerce Platform', 50, 80);

    // ── Title ──
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text('INVOICE', 400, 50, { align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Order #${orderId.slice(-6).toUpperCase()}`, 400, 75, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString('en-NG')}`, 400, 90, { align: 'right' });

    // ── Divider ──
    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // ── Table Header ──
    const tableTop = 140;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#64748b')
      .text('ITEM', 50, tableTop)
      .text('QTY', 330, tableTop, { width: 60, align: 'right' })
      .text('UNIT PRICE', 390, tableTop, { width: 80, align: 'right' })
      .text('TOTAL', 470, tableTop, { width: 75, align: 'right' });

    doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).strokeColor('#e2e8f0').stroke();

    // ── Table Rows ──
    let y = tableTop + 30;
    for (const item of cart) {
      const lineTotal = item.price * item.quantity;
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#0f172a')
        .text(item.name, 50, y, { width: 270 })
        .text(String(item.quantity), 330, y, { width: 60, align: 'right' })
        .text(`₦${item.price.toLocaleString()}`, 390, y, { width: 80, align: 'right' })
        .text(`₦${lineTotal.toLocaleString()}`, 470, y, { width: 75, align: 'right' });

      y += 24;
      doc.moveTo(50, y - 6).lineTo(545, y - 6).strokeColor('#f1f5f9').stroke();
    }

    // ── Total ──
    y += 10;
    doc.moveTo(390, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
    y += 12;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text('TOTAL', 390, y, { width: 80 })
      .fillColor('#128C7E')
      .text(`₦${total.toLocaleString()}`, 470, y, { width: 75, align: 'right' });

    // ── Footer ──
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Thank you for your business!', 50, 750, { align: 'center', width: 495 });

    doc.end();

    stream.on('finish', () => resolve(`/invoices/${fileName}`));
    stream.on('error', reject);
  });
}
