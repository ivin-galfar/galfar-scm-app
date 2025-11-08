import { create } from "zustand";

export const useErrorMessage = create((set) => ({
  errormessage: "",
  setErrorMessage: (error) => set(() => ({ errormessage: error })),
  clearErrorMessage: () => set({ errormessage: "" }),
}));
