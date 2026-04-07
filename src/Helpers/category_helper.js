export const getcategory = (type) => {
  const map = {
    file_note: ["General", "Ap", "ADTS", "TFW"],
    ioc: ["Insurance", "Demob", "FC", "PR"],
  };
  return map[type] || [];
};

export const TypeValue = {
  file_note: "FN",
  ioc: "Ioc",
};

export const CategoryValue = {
  General: "GN",
  ADTS: "ADTS CICPA",
  TFW: "Traffic Fine Waiver",
  Insurance: "Insurance",
  Demob: "Demob",
  FC: "FC",
  PR: "PR",
};

export const TypeForUi = {
  file_note: "File Note",
  ioc: "Ioc",
};
