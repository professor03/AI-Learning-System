import jsPDF from 'jspdf';

/**
 * Generate a PDF from an array of slide images
 */
export async function generatePDF(images: string[], title: string): Promise<void> {
    // Create PDF in landscape 16:9 format
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080],
    });

    // Add each image to the PDF
    images.forEach((imgData, index) => {
        if (index > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
    });

    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    pdf.save(fileName);
}
