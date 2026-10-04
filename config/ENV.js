const environment = import.meta.env ?? {};

export const REACT_SERVER_URL =
  environment.VITE_ENVIRONMENT === "development"
    ? environment.VITE_REACT_SERVER_URL
    : environment.VITE_REACT_PROD_SERVER_URL;
export const SPECIAL_PROJECTS =
  environment.VITE_SPECIAL_PROJECTS?.split(",").map(Number);
export const INHOUSE_PROJECTS =
  environment.VITE_INHOUSE_PROJECTS?.split(",").map(Number) ?? [];

const parseEnvList = (value) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const FLEET_LOCATIONS = parseEnvList(environment.VITE_FLEET_LOCATIONS);

export const APP_VERSION = environment.VITE_APP_VERSION;
export const PAPERLESS_MILESTONE_THRESHOLD =
  environment.VITE_PAPERLESS_MILESTONE_THRESHOLD;
