// Lazy-loaded PDF extraction utility
// Only imported when actually needed (Upload page)

export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        // Dynamically import pdfjs-dist only when needed
        const pdfjsLib = await import('pdfjs-dist');

        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        try {
        if (pdf.numPages > 200) throw new Error('教材超過 200 頁，請拆分後上傳。');
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        if (!fullText.trim()) throw new Error('這份 PDF 沒有可擷取的文字；掃描圖片需要先轉成文字。');
        return fullText;
        } finally { await loadingTask.destroy(); }
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error(error instanceof Error ? `PDF 讀取失敗：${error.message}` : 'PDF 讀取失敗，請確認檔案未損壞或加密。');
    }
};
