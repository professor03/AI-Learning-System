export interface VaultFile {
    id: string;
    name: string;
    type: 'pdf' | 'pptx' | 'image' | 'text' | 'other';
    size: number;
    uploadDate: number;
    noteId?: string; // Linked note ID if processed
    thumbnail?: string;
    url?: string; // For preview/download
}

export interface VaultState {
    files: VaultFile[];
    addFile: (file: VaultFile) => void;
    deleteFile: (id: string) => void;
    updateFile: (id: string, updates: Partial<VaultFile>) => void;
    getFilesByType: (type: string) => VaultFile[];
    resetVault: () => void;
}
