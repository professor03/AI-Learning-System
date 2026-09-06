import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function InjectDummyNote() {
    const addNote = useAppStore((state: any) => state.addNote);

    useEffect(() => {
        addNote({
            id: 'dummy-note-1',
            materialId: 'mat-1',
            courseName: 'Quantum Physics 101',
            summary: 'Introduction to Quantum Mechanics and Entanglement.',
            sections: [
                { id: 's1', title: 'Superposition', content: 'Particles can exist in multiple states at once.' },
                { id: 's2', title: 'Entanglement', content: 'Spooky action at a distance.' }
            ],
            terms: []
        });
        console.log('Dummy note injected!');
    }, []);

    return <div className="p-4 bg-green-100 text-green-800 rounded-lg">Dummy Note Injected</div>;
}
