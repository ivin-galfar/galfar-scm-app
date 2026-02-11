export const is_logistics = (dept_code) => dept_code?.includes(2);
export const is_plant = (dept_code) => dept_code?.includes(1);
export const is_asset = (role) => role == "inita";
export const is_buyvsrent = (role) => role == "initbr";
export const is_fm = (role) => role == "fm";
