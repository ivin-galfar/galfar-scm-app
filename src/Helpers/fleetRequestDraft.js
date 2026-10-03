const DRAFT_VERSION = 1;
const DRAFT_PREFIX = "fleet-request-draft";

const itemFields = [
  "fleetDescription",
  "capacity",
  "cicpa",
  "quantity",
  "requiredFrom",
  "rentalType",
  "duration",
  "purpose",
  "productionQtyEnvisaged",
  "similarMachinesAvailable",
  "remarks",
  "utilization",
  "adnocFitments",
  "tpi",
];

export const createEmptyFleetItem = () =>
  Object.fromEntries(itemFields.map((field) => [field, ""]));

const sanitizeItems = (items) => {
  return items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return createEmptyFleetItem();
    }

    return Object.fromEntries(
      itemFields.map((field) => [
        field,
        typeof item[field] === "string" || typeof item[field] === "number"
          ? String(item[field])
          : "",
      ]),
    );
  });
};

export const getFleetDraftKey = (userId, project) => {
  if (!userId || !project) return null;

  return `${DRAFT_PREFIX}:v${DRAFT_VERSION}:${encodeURIComponent(
    String(userId),
  )}:${encodeURIComponent(String(project))}`;
};

export const readFleetDraft = (storageKey, expectedProject) => {
  if (!storageKey) return null;

  try {
    const storedValue = sessionStorage.getItem(storageKey);
    if (!storedValue) return null;

    const draft = JSON.parse(storedValue);
    const fleetItems = sanitizeItems(draft?.fleetItems);
    const modalItems = sanitizeItems(draft?.modalItems);

    if (
      draft?.version !== DRAFT_VERSION ||
      draft?.project !== expectedProject ||
      fleetItems === null ||
      modalItems === null
    ) {
      sessionStorage.removeItem(storageKey);
      return null;
    }

    const editingItemIndex = Number.isInteger(draft.editingItemIndex)
      ? draft.editingItemIndex
      : null;

    return {
      project: draft.project,
      location: typeof draft.location === "string" ? draft.location : "",
      date: typeof draft.date === "string" ? draft.date : "",
      fleetId: typeof draft.fleetId === "string" ? draft.fleetId : "",
      fleetItems,
      modalItems,
      editingItemIndex:
        editingItemIndex !== null &&
        editingItemIndex >= 0 &&
        editingItemIndex < fleetItems.length
          ? editingItemIndex
          : null,
    };
  } catch {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
    return null;
  }
};

export const writeFleetDraft = (storageKey, draft) => {
  if (!storageKey) return;

  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ version: DRAFT_VERSION, ...draft }),
    );
  } catch (error) {
    console.error("Unable to save Fleet Request draft", error);
  }
};

export const removeFleetDraft = (storageKey) => {
  if (!storageKey) return;

  try {
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Unable to discard Fleet Request draft", error);
  }
};
