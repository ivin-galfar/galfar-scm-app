export const REACT_SERVER_URL =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_REACT_SERVER_URL
    : import.meta.env.VITE_REACT_PROD_SERVER_URL;
export const SPECIAL_PROJECTS = import.meta.env.VITE_SPECIAL_PROJECTS?.split(
  ",",
).map(Number);

const parseEnvList = (value) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const FLEET_LOCATIONS = parseEnvList(
  import.meta.env.VITE_FLEET_LOCATIONS,
);

export const APP_VERSION = import.meta.env.VITE_APP_VERSION;
