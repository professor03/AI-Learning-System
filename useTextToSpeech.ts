import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    isSpeaking: boolean;
    isPaused: boolean;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    selectVoice: (voiceName: string) => void;
    supported: boolean;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [supported, setSupported] = useState(false);

    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setSupported(true);
            synth.current = window.speechSynthesis;

            const updateVoices = () => {
                const availableVoices = synth.current?.getVoices() || [];
                setVoices(availableVoices);

                // Default to a good English or Chinese voice if available
                const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
                setSelectedVoice(defaultVoice);
            };

            updateVoices();

            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = updateVoices;
            }
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!synth.current) return;

        // Cancel any current speech
        synth.current.cancel();

        const newUtterance = new SpeechSynthesisUtterance(text);

        if (selectedVoice) {
            newUtterance.voice = selectedVoice;
        }

        newUtterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        newUtterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        newUtterance.onerror = (event) => {
            console.error("Speech synthesis error", event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.current = newUtterance;
        synth.current.speak(newUtterance);
    }, [selectedVoice]);

    const pause = useCallback(() => {
        if (synth.current && isSpeaking && !isPaused) {
            synth.current.pause();
            setIsPaused(true);
        }
    }, [isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if (synth.current && isPaused) {
            synth.current.resume();
            setIsPaused(false);
        }
    }, [isPaused]);

    const stop = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, []);

    const selectVoice = useCallback((voiceName: string) => {
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            setSelectedVoice(voice);
        }
    }, [voices]);

    return {
        speak,
        pause,
        resume,
        stop,
        isSpeaking,
        isPaused,
        voices,
        selectedVoice,
        selectVoice,
        supported
    };
}
