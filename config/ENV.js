export const REACT_SERVER_URL =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_REACT_SERVER_URL
    : import.meta.env.VITE_REACT_PROD_SERVER_URL;
export const SPECIAL_PROJECTS = import.meta.env.VITE_SPECIAL_PROJECTS?.split(
  ",",
).map(Number);
export const INHOUSE_PROJECTS =
  import.meta.env.VITE_INHOUSE_PROJECTS?.split(",").map(Number) ?? [];
export const FLEET_LOCATIONS =
  import.meta.env.VITE_FLEET_LOCATIONS?.split(",")
    .map((location) => location.trim())
    .filter(Boolean) ?? [];

export const APP_VERSION = import.meta.env.VITE_APP_VERSION;
