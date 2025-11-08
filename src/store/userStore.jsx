import { create } from "zustand";

export const toggleNewUser = create((set) => ({
  newuser: false,
  setNewuser: () => set((state) => ({ newuser: !state.newuser })),
}));

export const useSelectedDept = create((set) => ({
  selectedDept: "",
  setSelectedDept: (dept) => set({ selectedDept: dept }),
}));
