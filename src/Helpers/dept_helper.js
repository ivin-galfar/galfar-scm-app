export const is_logistics = (dept_code) => dept_code?.includes(2);
export const is_plant = (dept_code) => dept_code?.includes(1);
export const is_buyrent = (dept_code) => dept_code?.includes(3);
export const is_hod = (role) => role?.includes("hod");
export const is_gm = (role) => role?.includes("gm");
export const is_ceo = (role) => role?.includes("ceo");
export const is_asset = (role) => role?.includes("inita");
export const is_fm = (role) => role?.includes("fm");
export const is_pm = (role) => role?.includes("pm");
export const is_cm = (role) => role?.includes("cm");
export const is_dc = (role) => role?.includes("initdc");
export const is_hire = (role) => role?.includes("inith");

export const is_fnote = (role) =>
  role?.includes("initfn") ||
  role?.includes("initpr") ||
  role?.includes("initdc");

export const dept_finder_asadmin = (dept_code) => {
  if (!dept_code) return null;
  if (dept_code.includes(1)) return "Plant & Equipment";
  if (dept_code.includes(2)) return "Logistics";
};

export const dept_finder = (dept_code) => {
  if (!dept_code) return null;
  if (dept_code == 1) return "Plant & Equipment";
  if (dept_code == 2) return "Logistics";
};
