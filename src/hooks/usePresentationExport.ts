import { useState } from 'react';
import type { PresentationDeck } from '../lib/presentation-schema';

interface UsePresentationExportProps {
    deck: PresentationDeck | null;
    currentSlideIndex: number;
    setCurrentSlideIndex: (index: number) => void;
    setPetMood: (mood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening') => void;
    setPetMessage: (message: string | undefined) => void;
}

export function usePresentationExport({
    deck,
    currentSlideIndex,
    setCurrentSlideIndex,
    setPetMood,
    setPetMessage
}: UsePresentationExportProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPPTX = async () => {
        if (!deck) return;
        try {
            const { exportToPPTX } = await import('../lib/export-pptx');
            await exportToPPTX(deck);
            setPetMood('happy');
            setPetMessage("PPTX downloaded!");
            setTimeout(() => setPetMessage(undefined), 3000);
        } catch (err) {
            console.error("PPTX Export failed:", err);
            alert("Failed to export PPTX");
            setPetMood('confused');
            setPetMessage("Export failed 😢");
        }
    };

    const handleExportPDF = async () => {
        if (!deck) return;
        setIsExporting(true);
        const originalIndex = currentSlideIndex;

        try {
            const { generatePDF } = await import('../lib/export-pdf');
            const html2canvas = (await import('html2canvas')).default;
            const images: string[] = [];
            const slideContainer = document.querySelector('.aspect-video');

            if (!slideContainer) throw new Error("Slide container not found");

            // Capture each slide
            for (let i = 0; i < deck.slides.length; i++) {
                setCurrentSlideIndex(i);
                // Wait for render and charts/diagrams
                await new Promise(resolve => setTimeout(resolve, 500));

                const canvas = await html2canvas(slideContainer as HTMLElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#000000',
                    logging: false,
                });

                images.push(canvas.toDataURL('image/png'));
            }

            await generatePDF(images, deck.title);
            setPetMood('happy');
            setPetMessage("PDF downloaded!");
            setTimeout(() => setPetMessage(undefined), 3000);

        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Failed to export PDF");
            setPetMood('confused');
            setPetMessage("Export failed 😢");
        } finally {
            setIsExporting(false);
            setCurrentSlideIndex(originalIndex);
        }
    };

    return {
        isExporting,
        handleExportPPTX,
        handleExportPDF
    };
}
