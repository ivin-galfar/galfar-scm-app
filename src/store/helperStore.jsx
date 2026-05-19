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

export const useProjectCodes = create((set) => ({
  projectcodes: [],
  setProjectCodes: (value) => set(() => ({ projectcodes: value })),
  resetProjectCodes: () => set(() => ({ projectcodes: [] })),
}));

export const useDeleteStore = create((set) => ({
  deleteStatement: { id: null, open: false },
  setDeleteStatement: (id) =>
    set(() => ({ deleteStatement: { id, open: true } })),
  resetDeleteStatement: () =>
    set(() => ({ deleteStatement: { id: null, open: false } })),
}));

export const usenewfn = create((set) => ({
  newfn: false,
  setNewfn: (value) =>
    set((state) => ({
      newfn: value !== undefined ? value : !state.newfn,
    })),
}));

const getInitialProjectFilter = () => {
  const saved = sessionStorage.getItem("filenoteFilters");

  if (!saved) return "";

  try {
    return JSON.parse(saved).projectFilter || "";
  } catch {
    return "";
  }
};

export const useSelectedProject = create((set) => ({
  selectedproject: getInitialProjectFilter(),
  setSelectedProject: (value) => set(() => ({ selectedproject: value })),
  resetSelectedproject: () => set(() => ({ selectedproject: "" })),
}));

export const useCategories = create((set) => ({
  categories: [],
  setCategories: (value) => set(() => ({ categories: value })),
  resetCategories: () => set(() => ({ categories: [] })),
}));

export const useTypes = create((set) => ({
  types: [],
  setTypes: (value) => set(() => ({ types: value })),
  resetTypes: () => set(() => ({ types: [] })),
}));

export const useRecallStatement = create((set) => ({
  isRecalled: false,
  setIsRecalled: () => set({ isRecalled: true }),
  resetIsRecalled: () => set({ isRecalled: false }),
}));

export const useRecallAlert = create((set) => ({
  isAlerted: false,
  setIsAlerted: () => set({ isAlerted: true }),
  resetIsAlerted: () => set({ isAlerted: false }),
}));
