// Lazy-loaded PDF extraction utility
// Only imported when actually needed (Upload page)

export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        // Dynamically import pdfjs-dist only when needed
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker source using unpkg
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to parse PDF file');
    }
};
