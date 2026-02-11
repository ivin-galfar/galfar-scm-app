import { create } from "zustand";

export const useBrStatement = create((set) => ({
  formData: {
    item: "",
    no_of_units: "",
    unit_price: "",
    int_rate: "",
    fin_tenure: "",
    maint_yearly: 0,
    dp_year: "",
    dp_rate: "",
    monthly_rental: "",
    op_cost: 0,
    op_cost_rent: 0,
    maintain_cost_rent: 0,
    is_included_maintain_cost_rent: false,
    is_included_op_cost_rent: false,
    file: [],
    file_name: [],
  },
  setFormData: (updater) =>
    set((state) => ({
      formData:
        typeof updater === "function"
          ? updater(state.formData)
          : { ...state.formData, ...updater },
    })),
  resetFormData: () =>
    set({
      formData: {
        item: "",
        no_of_units: "",
        unit_price: "",
        int_rate: "",
        fin_tenure: "",
        maint_yearly: 0,
        dp_rate: "",
        dp_year: "",
        monthly_rental: "",
        op_cost: 0,
        op_cost_rent: 0,
        maintain_cost_rent: 0,
        is_included_maintain_cost_rent: false,
        is_included_op_cost_rent: false,
        file: [],
        file_name: [],
      },
    }),
}));

export const useBrCsIds = create((set) => ({
  brcs_ids: [],
  setBrCs_ids: (value) => set(() => ({ brcs_ids: value })),
  resetBrCs_id: () => set(() => ({ brcs_ids: [] })),
}));

export const useBrTableData = create((set) => ({
  brtabledata: {},

  setbrtabledata: (value) =>
    set((state) => ({
      brtabledata:
        typeof value === "function" ? value(state.brtabledata) : value,
    })),
  resetbrtabledata: () =>
    set(() => ({
      brtabledata: {
        item: "",
        id: null,
        no_of_units: "",
        unit_price: "",
        int_rate: "",
        fin_tenure: "",
        maint_yearly: 0,
        dp_year: "",
        dp_rate: "",
        monthly_rental: "",
        op_cost: 0,
        op_cost_rent: 0,
        maintain_cost_rent: 0,
        is_included_maintain_cost_rent: false,
        is_included_op_cost_rent: false,
        file: [],
        file_name: [],
      },
    })),
}));

export const useToggleModal = create((set) => ({
  showmodal: false,
  setShowModal: () => set({ showmodal: true }),
  resetShowModal: () => set({ showmodal: false }),
}));

export const useDatasaved = create((set) => ({
  datasaved: false,
  setDataSaved: () => set({ datasaved: true }),
  resetDataSaved: () => set({ datasaved: false }),
}));

export const useNewStatement = create((set) => ({
  newstatement: false,
  setNewStatement: () => set({ newstatement: true }),
  resetNewStatement: () => set({ newstatement: false }),
}));

export const usetotalBRstatements = create((set) => ({
  brcount: 0,
  setBRCount: (count) => set({ brcount: count }),
}));
