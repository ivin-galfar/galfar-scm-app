export const roles = {
  INITIATOR: {
    LOGISTICS: ["Mr.Appus Jose", "Mr.Conston"],
    HIRE: ["Mr.Ramzan", "Mr.Sabulal"],
    ASSET: ["Mr.Satheesh"],
    BUYRENT: ["Mr.Satheesh"],
    FNIOC: ["plant"],
  },
  CEO: "Mr.Sridhar.C",
  GM: "Mr.Vijayan. C.G",
  HOD: "Mr.Pramoj.R",
  FM: "Mr.Suraj Rajan",
};

export const categoryapprovers = {
  BUYRENT: ["HOD", "FM", "GM", "CEO"],
  FNIOC: ["HOD", "FM", "GM", "CEO"],
  FNIOCM: ["HOD", "GM", "CEO"],
};

export const nextRole = (role, category) => {
  const normalizedRole = role?.toLowerCase();
  const normalizedCategory = category?.toLowerCase();

  const fmCategories = ["ap", "adtsren", "adtsnew"];

  if (normalizedRole === "hod") {
    return fmCategories.includes(normalizedCategory) ? "fm" : "gm";
  }

  const roleMap = {
    inita: "hod",
    inith: "hod",
    initfn: "hod",
    hod: "gm",
    fm: "gm",
    gm: "ceo",
    ceo: null,
  };

  return roleMap[normalizedRole] || null;
};

export const prevRole = (role) => {
  const roleMap = {
    ceo: "fm",
    fm: "gm",
    gm: "pm",
    pm: "incharge",
    incharge: "initlg",
    initlg: "initlg",
  };
  return roleMap[role.toLowerCase()] || null;
};
