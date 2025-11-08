import { create } from "zustand";

export const useToast = create((set) => ({
  showtoast: false,
  setShowToast: () => set(() => ({ showtoast: true })),
  resetshowtoast: () => set({ showtoast: false }),
}));
