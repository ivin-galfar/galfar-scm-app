import { create } from "zustand";

export const useComments = create((set) => ({
  comments: "",
  setComments: (value) => set(() => ({ comments: value })),
  resetComments: () => set(() => ({ comments: "" })),
}));

export const useIsEditing = create((set) => ({
  isedit: false,
  setIsEdit: () => set(() => ({ isedit: true })),
  resetIsEdit: () => set(() => ({ isedit: false })),
}));
