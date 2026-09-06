import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore } from '../store/useVaultStore';

import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Vault() {
    const navigate = useNavigate();
    const { files, deleteFile } = useVaultStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFiles = files.filter(file => {
        const matchesType = filterType === 'all' || file.type === filterType;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'pptx': return '📊';
            case 'image': return '🖼️';
            case 'text': return '📝';
            default: return '📁';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">📂 Vault</h1>
                        <p className="text-slate-500 mt-1">管理您的所有學習檔案</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:flex-none min-w-[200px]">
                            <input
                                type="text"
                                placeholder="搜尋檔案..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={() => navigate('/upload')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                        >
                            <span>☁️</span>
                            <span className="hidden sm:inline">上傳檔案</span>
                        </button>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                        {['all', 'pdf', 'pptx', 'image', 'text'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                    filterType === type
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {type === 'all' ? '全部' : type.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg self-end sm:self-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'grid' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                            title="網格檢視"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                            title="列表檢視"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>

                {/* Files Grid/List */}
                {filteredFiles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="text-6xl mb-4">📂</div>
                        <h3 className="text-xl font-medium text-slate-900">這裡還沒有檔案</h3>
                        <p className="text-slate-500 mt-2 mb-6">上傳您的第一份學習資料吧！</p>
                        <button
                            onClick={() => navigate('/upload')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            立即上傳
                        </button>
                    </div>
                ) : (
                    <div className={clsx(
                        "grid gap-6",
                        viewMode === 'grid'
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                    )}>
                        <AnimatePresence>
                            {filteredFiles.map((file) => (
                                <motion.div
                                    key={file.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={clsx(
                                        "bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group",
                                        viewMode === 'list' && "flex items-center p-4 gap-4"
                                    )}
                                >
                                    {/* Preview / Icon */}
                                    <div className={clsx(
                                        "bg-slate-50 flex items-center justify-center relative overflow-hidden",
                                        viewMode === 'grid' ? "aspect-[4/3]" : "w-16 h-16 rounded-xl shrink-0"
                                    )}>
                                        {file.thumbnail ? (
                                            <img
                                                src={file.thumbnail}
                                                alt={file.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <span className="text-4xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                                                {getFileIcon(file.type)}
                                            </span>
                                        )}

                                        {/* Overlay Actions (Grid Mode) */}
                                        {viewMode === 'grid' && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                <button
                                                    onClick={() => file.noteId ? navigate(`/notes/${file.noteId}`) : null}
                                                    className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
                                                    title="開啟"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => deleteFile(file.id)}
                                                    className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                                    title="刪除"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className={clsx(viewMode === 'grid' ? "p-4" : "flex-1 min-w-0")}>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3
                                                className="font-medium text-slate-900 truncate leading-tight"
                                                title={file.name}
                                            >
                                                {file.name}
                                            </h3>
                                            {viewMode === 'list' && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => file.noteId ? navigate(`/notes/${file.noteId}`) : null}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => deleteFile(file.id)}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                                {file.type}
                                            </span>
                                            <span>•</span>
                                            <span>{formatFileSize(file.size)}</span>
                                            <span>•</span>
                                            <span>{formatDate(file.uploadDate)}</span>
                                        </div>

                                        {file.noteId && (
                                            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                                                <span>🔗</span>
                                                <span>已連結筆記</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
