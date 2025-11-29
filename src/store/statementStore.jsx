import { create } from "zustand";

export const useStatementupdated = create((set) => ({
  showupdated: false,
  setshowupdated: () => set(() => ({ showupdated: true })),
  resetshowupdated: () => set(() => ({ showupdated: false })),
}));

export const useDeleteStatement = create((set) => ({
  deleted: false,
  setDeleted: () => set(() => ({ deleted: true })),
  resetDeleted: () => set(() => ({ deleted: false })),
}));

export const useClearStatementTable = create((set) => ({
  cleartable: false,
  setClearTable: () => set(() => ({ cleartable: true })),
  resetCleartable: () => set(() => ({ cleartable: false })),
}));

export const useUpdateQuantity = create((set) => ({
  quantity: 0,
  setQuantity: (newquantity) => set(() => ({ quantity: newquantity })),
}));

export const useSortVendors = create((set) => ({
  sortvendors: false,
  setSortVendors: () => set(() => ({ sortvendors: true })),
  resetSortVendors: () => set(() => ({ sortvendors: false })),
}));

export const useEdit = create((set) => ({
  isEdit: false,
  setIsEdit: () => set(() => ({ isEdit: true })),
  resetIsEdit: () => set(() => ({ isEdit: false })),
}));

export const userevertrequest = create((set) => ({
  isReverted: false,
  setIsReverted: () => set(() => ({ isReverted: true })),
  resetIsReverted: () => set(() => ({ isReverted: false })),
}));

export const useUpdate = create((set) => ({
  isupdated: false,
  setIsupdated: () => set(() => ({ isupdated: true })),
  revertisupdated: () => set(() => ({ isupdated: false })),
}));

export const usePagination = create((set) => ({
  pagination: { pageIndex: 0, pageSize: 20 },
  setPageIndex: (pageIndex) =>
    set((state) => ({
      pagination: { ...state.pagination, pageIndex },
    })),
  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, pageSize },
    })),
}));

export const usetotalReceipts = create((set) => ({
  receiptscount: 0,
  setReceiptsCount: (count) => set({ receiptscount: count }),
}));
