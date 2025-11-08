import { create } from "zustand";

export const useToggleAsset = create((set) => ({
  Asset: false,
  toggleasset: () => set(() => ({ Asset: true })),
  resetasset: () => set(() => ({ Asset: false })),
}));
