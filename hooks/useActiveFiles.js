'use client';

import { create } from 'zustand';

const useActiveFilesStore = create((set) => ({
    activeFiles: [],
    setActiveFiles: (files) => set({ activeFiles: files }),
    addActiveFile: (file) => set((state) => ({
        activeFiles: [...new Set([...state.activeFiles, file])]
    })),
    removeActiveFile: (file) => set((state) => ({
        activeFiles: state.activeFiles.filter(f => f !== file)
    })),
    clearActiveFiles: () => set({ activeFiles: [] })
}));

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
