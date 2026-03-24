const PDFDocument = require('pdfkit');

function buildWorkerListPdfBuffer({ job, workers }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('AgroLink - Worker List', { align: 'center' });
    doc.moveDown(0.8);

    doc.fontSize(12).text(`Job: ${job.title}`);
    doc.text(`Category: ${job.category}`);
    doc.text(`Start date: ${new Date(job.startDate).toLocaleDateString()}`);
    doc.text(`Workers matched: ${workers.length}`);
    doc.moveDown();

    doc.fontSize(11).text('Name', 40, doc.y, { continued: true, width: 180 });
    doc.text('Phone', 220, doc.y, { continued: true, width: 120 });
    doc.text('Address', 340, doc.y);
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    workers.forEach((worker) => {
      const address = [
        worker?.location?.addressLine,
        worker?.location?.village,
        worker?.location?.taluk,
        worker?.location?.district,
        worker?.location?.state,
      ]
        .filter(Boolean)
        .join(', ');

      doc.text(worker.name || '-', 40, doc.y, { continued: true, width: 180 });
      doc.text(worker.phone || '-', 220, doc.y, { continued: true, width: 120 });
      doc.text(address || '-', 340, doc.y);
      doc.moveDown(0.4);
    });

    doc.end();
  });
}

module.exports = {
  buildWorkerListPdfBuffer,
};
