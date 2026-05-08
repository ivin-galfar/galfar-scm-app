export const REACT_SERVER_URL =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_REACT_SERVER_URL
    : import.meta.env.VITE_REACT_PROD_SERVER_URL;
export const SPECIAL_PROJECTS = import.meta.env.VITE_SPECIAL_PROJECTS?.split(
  ",",
).map(Number);
