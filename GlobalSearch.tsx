import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
    const navigate = useNavigate();
    const { atoms } = useMemoryStore();
    const { notes } = useAppStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return { atoms: [], notes: [] };

        const lowerQuery = query.toLowerCase();

        const matchedAtoms = atoms.filter(atom =>
            atom.term.toLowerCase().includes(lowerQuery) ||
            atom.definition.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        const matchedNotes = notes.filter(note =>
            (note.courseName || '').toLowerCase().includes(lowerQuery) ||
            note.summary.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        return { atoms: matchedAtoms, notes: matchedNotes };
    }, [query, atoms, notes]);

    const hasResults = results.atoms.length > 0 || results.notes.length > 0;

    return (
        <div className="relative flex-1 max-w-2xl mx-4" ref={containerRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                    placeholder="搜尋筆記、知識卡片..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">Ctrl K</span>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && query && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
                    >
                        {!hasResults ? (
                            <div className="p-8 text-center text-gray-500">
                                <p className="text-4xl mb-2">🤔</p>
                                <p>找不到與 "{query}" 相關的內容</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {results.atoms.length > 0 && (
                                    <div className="px-2 mb-2">
                                        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            知識卡片 (Memory Bank)
                                        </h3>
                                        {results.atoms.map(atom => (
                                            <button
                                                key={atom.id}
                                                onClick={() => {
                                                    navigate('/memory');
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                                            >
                                                <span className="text-lg bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                                    🧠
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{atom.term}</p>
                                                    <p className="text-xs text-gray-500 truncate">{atom.definition}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {results.notes.length > 0 && (
                                    <div className="px-2">
                                        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            筆記 (Notes)
                                        </h3>
                                        {results.notes.map(note => (
                                            <div key={note.id} className="group flex items-center px-2 hover:bg-purple-50 rounded-lg transition-colors">
                                                <button
                                                    onClick={() => {
                                                        navigate(`/notes/${note.id}`);
                                                        setIsOpen(false);
                                                    }}
                                                    className="flex-1 text-left py-2 flex items-start gap-3"
                                                >
                                                    <span className="text-lg bg-purple-100 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                                        📝
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{note.courseName || '未命名課程'}</p>
                                                        <p className="text-xs text-gray-500 truncate">{note.summary}</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/galaxy?focus=${note.id}`);
                                                        setIsOpen(false);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    title="在星系中查看"
                                                >
                                                    🌌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
                            <span>按 Enter 選擇</span>
                            <span>AI Student Search</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
