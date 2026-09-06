import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VaultState } from '../types/vaultTypes';

export const useVaultStore = create<VaultState>()(
    persist(
        (set, get) => ({
            files: [],

            addFile: (file) => set((state) => ({
                files: [file, ...state.files]
            })),

            deleteFile: (id) => set((state) => ({
                files: state.files.filter((f) => f.id !== id)
            })),

            updateFile: (id, updates) => set((state) => ({
                files: state.files.map((f) =>
                    f.id === id ? { ...f, ...updates } : f
                )
            })),

            getFilesByType: (type) => {
                const { files } = get();
                if (type === 'all') return files;
                return files.filter((f) => f.type === type);
            },

            resetVault: () => set({ files: [] })
        }),
        {
            name: 'vault-storage',
        }
    )
);
