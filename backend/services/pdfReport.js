import PDFDocument from 'pdfkit';

export function buildReviewPdf({ review, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const feedback = review.feedback || {};
    const breakdown = feedback.breakdown || {};

    doc.fontSize(22).fillColor('#6F4E37').text('CodeReview AI — Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).fillColor('#333');
    doc.text(`Student: ${user?.name || 'N/A'}`);
    doc.text(`Language: ${review.language}`);
    doc.text(`Date: ${new Date(review.created_at).toLocaleString()}`);
    doc.text(`Overall Score: ${review.score}/100`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#6F4E37').text('Score Breakdown');
    doc.fontSize(11).fillColor('#333');
    doc.text(`Correctness: ${breakdown.correctness ?? '—'}`);
    doc.text(`Readability: ${breakdown.readability ?? '—'}`);
    doc.text(`Efficiency: ${breakdown.efficiency ?? '—'}`);
    doc.text(`Best Practices: ${breakdown.bestPractices ?? '—'}`);
    doc.moveDown();

    if (feedback.summary) {
      doc.fontSize(14).fillColor('#6F4E37').text('Summary');
      doc.fontSize(11).text(feedback.summary);
      doc.moveDown();
    }

    const issues = feedback.issues || [];
    if (issues.length) {
      doc.fontSize(14).fillColor('#6F4E37').text('Issues Found');
      issues.forEach((issue, i) => {
        doc.fontSize(11).fillColor('#333');
        doc.text(`${i + 1}. [${issue.severity}] Line ${issue.lineNumber}: ${issue.description}`);
        if (issue.suggestedFix) doc.text(`   Fix: ${issue.suggestedFix}`);
      });
      doc.moveDown();
    }

    const insights = feedback.learningInsights;
    if (insights) {
      doc.fontSize(14).fillColor('#6F4E37').text('Learning Insights');
      doc.fontSize(11);
      if (insights.learningSuggestions?.length) {
        doc.text('Suggestions: ' + insights.learningSuggestions.join('; '));
      }
    }

    doc.end();
  });
}
