export const roles = {
  INITIATOR: {
    LOGISTICS: ["Mr.Appus Jose", "Mr.Conston"],
    HIRE: ["Mr.Ramzan", "Mr.Sabulal"],
    ASSET: ["Mr.Satheesh"],
    BUYRENT: ["Mr.Satheesh"],
  },
  CEO: "Mr.Sridhar.C",
  GM: "Mr.Vijayan. C.G",
  HOD: "Mr.Pramoj.R",
  FM: "Mr.Suraj Rajan",
};

export const categoryapprovers = {
  BUYRENT: ["HOD", "FM", "GM", "CEO"],
};

export const nextRole = (role) => {
  const roleMap = {
    initbr: "hod",
    hod: "fm",
    fm: "gm",
    gm: "ceo",
    ceo: null,
  };

  return roleMap[role.toLowerCase()] || null;
};
