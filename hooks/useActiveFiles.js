'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useActiveFilesStore = create(
    persist(
        (set) => ({
            activeFiles: [],
            setActiveFiles: (files) => set({ 
                activeFiles: files.map(file => file?.name || file)
            }),
            addActiveFile: (file) => set((state) => ({
                activeFiles: [...new Set([...state.activeFiles, file?.name || file])]
            })),
            removeActiveFile: (file) => set((state) => ({
                activeFiles: state.activeFiles.filter(f => f !== (file?.name || file))
            })),
            clearActiveFiles: () => set({ activeFiles: [] })
        }),
        {
            name: 'active-files-storage',
            version: 1,
        }
    )
);

export function useActiveFiles() {
    const store = useActiveFilesStore();
    return {
        activeFiles: store.activeFiles,
        setActiveFiles: store.setActiveFiles,
        addActiveFile: store.addActiveFile,
        removeActiveFile: store.removeActiveFile,
        clearActiveFiles: store.clearActiveFiles
    };
}
