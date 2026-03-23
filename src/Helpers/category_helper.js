export const getcategory = (category) => {
  const map = {
    file_note: ["General", "ATDS CICPA", "Traffic Fine Waiver"],
    ioc: ["Insurance", "Demobilization", "Fuel Chip", "Police Return"],
  };
  return map[category] || [];
};

export const TypeValue = {
  file_note: "FN",
  ioc: "Ioc",
};

export const CategoryValue = {
  General: "GN",
  "ATDS CICPA": "ATDS CICPA",
  "Traffic Fine Waiver": "Traffic Fine Waiver",
  Insurance: "Insurance",
  Demobilization: "Demob",
  "Fuel Chip": "FC",
  "Police Return": "PR",
};

export const TypeForUi = {
  file_note: "File Note",
  ioc: "Ioc",
};
