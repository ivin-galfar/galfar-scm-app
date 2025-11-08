import { create } from "zustand";

export const useParticular = create((set) => ({
  particular: "",
  setParticular: (selectedparticular) =>
    set({ particular: selectedparticular }),
}));

export const useNewStatement = create((set) => ({
  newstatement: false,
  setNewStatement: () => set(() => ({ newstatement: true })),
  resetnewStatement: () => set(() => ({ newstatement: false })),
}));

export const useAllParticulars = create((set) => ({
  particulars: [],
  setParticulars: (fetchedparticulars) =>
    set(() => ({ particulars: fetchedparticulars })),
}));

export const useParticularValues = create((set) => ({
  particularvalue: [],
  setParticularValue: (response) => set(() => ({ particularvalue: response })),
  resetparticularvalue: () => set(() => ({ particularvalue: [] })),
}));

export const useStatement = create((set) => ({
  formData: {
    cargo_details: "",
    gross_weight: "",
    chargeable_weight: "",
    description: "",
    supplier: "",
    scopeofwork: "",
    mode: "",
    date: "",
    po: "",
    project: "",
    status: "",
    edited_count: 0,
    sentforapproval: "",
    recommendation_reason: "",
    shipment_no: "",
    file: [],
    filename: [],
    created_at: "",
    lastupdated: null,
  },
  tableData: [],

  // setFormData: (data) =>
  // set((state) => ({ formData: { ...state.formData, ...data } })),
  // setFormData: (updater) =>
  //   set((state) => ({
  //     formData:
  //       typeof updater === "function"
  //         ? updater(state.formData)
  //         : { ...state.formData, ...updater },
  //   })),
  setFormData: (updater) =>
    set((state) => ({
      formData:
        typeof updater === "function"
          ? updater(state.formData)
          : { ...state.formData, ...updater },
    })),

  // setTableData: (data) => set({ tableData: data }),
  setTableData: (updater) =>
    set((state) => ({
      tableData:
        typeof updater === "function" ? updater(state.tableData) : updater,
    })),
  resetData: () =>
    set({
      formData: {
        cargo_details: "",
        gross_weight: "",
        chargeable_weight: "",
        description: "",
        supplier: "",
        scopeofwork: "",
        shipment_no: "",
        mode: "",
        date: "",
        po: "",
        project: "",
        status: "",
        sentforapproval: "",
        edited_count: 0,
        recommendation_reason: "",
        file: [],
        filename: [],
        created_at: "",
        lastupdated: null,
      },
      tableData: [],
    }),
}));

export const useAllcsid = create((set) => ({
  allcsid: [],
  setAllcsid: (data) => set(() => data),
}));

export const useSelectCS = create((set) => ({
  csselected: false,
  setCsSelected: () => set({ csselected: true }),
  resetCsSelected: () => set({ csselected: false }),
}));

export const useSelectCSValue = create((set) => ({
  csselectedval: "",
  setCsSelectedval: (cs_no) => set({ csselectedval: cs_no }),
  resetCsSelectedval: () => set({ csselectedval: "" }),
}));

export const usecolumns = create((set) => ({
  columns: ["Forwarder"],
  setColumns: (newcolumns) => set({ columns: newcolumns }),
  resetcolumns: () => set({ columns: ["Forwarder"] }),
}));

export const useFreeze = create((set) => ({
  isFreeze: false,
  setFreeze: () => set({ isFreeze: true }),
  resetFreeze: () => set({ isFreeze: false }),
}));

export const useIsEditing = create((set) => ({
  isEditing: false,
  setIsEditing: () => set({ isEditing: true }),
  resetIsEditing: () => set({ isEditing: false }),
}));

export const useStatusFilter = create((set) => ({
  statusfilter: "All",
  setStatusFilter: (filter) => set({ statusfilter: filter }),
  resetStatusFilter: () => set({ statusfilter: "All" }),
}));

export const useMultiStatusFilter = create((set) => ({
  multistatusfilter: [],
  setMultiStatusFilter: (filter) => set({ statusfilter: filter }),
  resetMultiStatusFilter: () => set({ multistatusfilter: [] }),
}));

export const useDashboardType = create((set) => ({
  dashboardType: "",
  setDashboardType: (selected) => set({ dashboardType: selected }),
  resetDashboardType: () => set({ dashboardType: "" }),
}));
