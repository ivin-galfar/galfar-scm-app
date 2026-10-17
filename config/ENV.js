const environment = import.meta.env ?? {};

export const REACT_SERVER_URL =
  environment.VITE_ENVIRONMENT === "development"
    ? environment.VITE_REACT_SERVER_URL
    : environment.VITE_REACT_PROD_SERVER_URL;
export const SPECIAL_PROJECTS =
  environment.VITE_SPECIAL_PROJECTS?.split(",").map(Number);
export const NORMAL_PROJECTS =
  environment.VITE_NORMAL_PROJECTS?.split(",").map(Number);
export const INHOUSE_PROJECTS =
  environment.VITE_INHOUSE_PROJECTS?.split(",").map(Number) ?? [];
export const SHAREPOINT_LISTS =
  environment.VITE_SHAREPOINT_LISTS?.split(",")
    .map((listName) => listName.trim())
    .filter(Boolean) ?? [];

export const APP_VERSION = environment.VITE_APP_VERSION;
export const PAPERLESS_MILESTONE_THRESHOLD =
  environment.VITE_PAPERLESS_MILESTONE_THRESHOLD;

export const ESTIMATED_PAPERS_PER_STATEMENT =
  environment.VITE_ESTIMATED_PAPERS_PER_STATEMENT;

export const ESTIMATED_PAPER_FOR_TREE =
  environment.VITE_ESTIMATED_PAPERS_PER_TREE;

export const CO2_GRAMS_PER_SHEET = environment.VITE_CO2_GRAMS_PER_SHEET;
