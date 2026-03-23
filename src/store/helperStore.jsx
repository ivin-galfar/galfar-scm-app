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

export const useAttachments = create((set) => ({
  attachments: JSON.parse(localStorage.getItem("editorAttachments")) || [],

  setAttachments: (value) =>
    set((state) => {
      const updatedAttachments =
        typeof value === "function" ? value(state.attachments) : value;

      localStorage.setItem(
        "editorAttachments",
        JSON.stringify(updatedAttachments),
      );

      return { attachments: updatedAttachments };
    }),

  resetAttachments: () =>
    set(() => {
      localStorage.removeItem("editorAttachments");
      return { attachments: [] };
    }),
}));
