import {
  CO2_GRAMS_PER_SHEET,
  ESTIMATED_PAPER_FOR_TREE,
  ESTIMATED_PAPERS_PER_STATEMENT,
} from "../../config/ENV.js";

export const calculatePaperPagesSaved = (
  milestoneThreshold,
  papersPerStatement = ESTIMATED_PAPERS_PER_STATEMENT ?? 0,
) => {
  const statementCount = Number(milestoneThreshold);
  const pageEstimate = Number(papersPerStatement);

  if (
    !Number.isFinite(statementCount) ||
    !Number.isFinite(pageEstimate) ||
    statementCount < 0 ||
    pageEstimate < 0
  ) {
    return 0;
  }

  const paperssaved = statementCount * pageEstimate + statementCount;

  return Math.round(paperssaved);
};

export const calculateTreesSaved = (
  papersaved,
  papersPerTree = ESTIMATED_PAPER_FOR_TREE,
) => {
  const paperPages = Number(papersaved);
  const pageEstimate = Number(papersPerTree);

  if (
    !Number.isFinite(paperPages) ||
    !Number.isFinite(pageEstimate) ||
    paperPages < 0 ||
    pageEstimate <= 0
  ) {
    return 0;
  }
  const treessaved = paperPages / pageEstimate;
  return Math.round(treessaved);
};

export const getDashboardTimePeriod = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
};

export const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const calculateCo2SavedKg = (
  papersaved,
  co2GramsPerSheet = CO2_GRAMS_PER_SHEET,
) => {
  const paperPages = Number(papersaved);
  const gramsPerSheet = Number(co2GramsPerSheet);

  if (
    !Number.isFinite(paperPages) ||
    !Number.isFinite(gramsPerSheet) ||
    paperPages < 0 ||
    gramsPerSheet < 0
  ) {
    return 0;
  }

  return Math.round((paperPages * gramsPerSheet) / 1000);
};

const getSafeUserIdentifier = (userInfo) => {
  const identifier = userInfo?.id ?? userInfo?.email?.split("@")[0];

  return String(identifier ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");
};

export const getMilestoneStorageKey = (userInfo, date = new Date()) => {
  const identifier = getSafeUserIdentifier(userInfo);

  if (!identifier) return null;

  return `milestone_${identifier}_${formatLocalDate(date)}`;
};
