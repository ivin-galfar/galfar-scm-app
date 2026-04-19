export const getcategory = (type) => {
  const map = {
    file_note: ["General", "Ap", "ADTSRen", "ADTSNew", "TFW"],
    ioc: ["Insurance", "Demob", "PR", "FC", "DPR"],
  };
  return map[type] || [];
};

export const TypeValue = {
  file_note: "FN",
  ioc: "Ioc",
};

// export const CategoryValue = {
//   General: "GN",
//   ADTS: "ADTS CICPA",
//   TFW: "Traffic Fine Waiver",
//   Insurance: "Insurance",
//   Demob: "Demob",
//   FC: "FC",
//   PR: "PR",
// };

export const TypeForUi = {
  file_note: "File Note",
  ioc: "Inter Office Correspondence",
};

export const CategoryForUi = {
  General: "General",
  Ap: "Asset Purchase",
  Insurance: "Insurance",
  ADTSRen: "ADTS CICPA",
  ADTSNew: "ADTS CICPA",
  TFW: "Traffic Fine Waiver",
  Demob: "Demobilization",
  FC: "Fuel Chip",
  PR: "Police Return",
  DPR: "Down Payment Request",
};
