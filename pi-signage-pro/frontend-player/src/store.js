import { create } from 'zustand';

const useStore = create((set) => ({
  widgets: [],
  setWidgets: (widgets) => set({ widgets }),
}));

export default useStore;