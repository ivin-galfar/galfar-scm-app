const firstValue = (source, keys, fallback = 0) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }
  return fallback;
};

const flattenCollection = (collection) => {
  if (Array.isArray(collection)) return collection;
  if (!collection || typeof collection !== "object") return [];

  return Object.entries(collection).flatMap(([source, records]) =>
    Array.isArray(records)
      ? records.map((record) => ({ ...record, source }))
      : [],
  );
};

const getRecords = (response, keys) => {
  for (const key of keys) {
    if (response?.[key] !== undefined) return flattenCollection(response[key]);
  }
  return [];
};

const getRecordValue = (record, keys, fallback = "") =>
  firstValue(record, keys, fallback);

const normalizeItem = (record) => ({
  id: getRecordValue(record, ["id"], "-"),
  name: getRecordValue(record, ["name", "item", "title"], "-"),
  label: getRecordValue(record, ["label"], "-"),
  due_period: getRecordValue(record, ["due_period"], "-"),
  // created_at: getRecordValue(record, ["created_at"], "-"),
});

export const transformAnalyticsData = (response) => {
  const data =
    response?.data && !Array.isArray(response.data) ? response.data : response;

  //pending for you (count)
  const pendingRecords = data.pending_for_you;
  const nearingRecords = getRecords(data, ["nearing_reminder"]);
  const pendingRecordsValue = getRecords(
    data,
    ["pending_data_for_you"],
    undefined,
  );

  const summary = {
    total_approved: firstValue(data, ["total_approved"]),
    pending: pendingRecords,
    inProgress: firstValue(data, ["in_progress"]),
    approved_by_you: firstValue(data, ["approved_by_you"]),
    submitted_by_you: firstValue(data, ["submitted_by_you"]),
    returned_to_you: firstValue(data, ["retuned_to_you"]),
    total_rejected: firstValue(data, ["total_rejected"]),
    all: firstValue(data, ["all_statements"]),
    escalated_times: firstValue(data, ["escalations_triggered"]),
  };

  return {
    summary,
    pendingForYou: pendingRecordsValue,
    nearingReminder: nearingRecords.map(normalizeItem),
    workflowSummary: [
      { name: "Approved", value: summary.total_approved },
      // { name: "Submitted By You", value: summary.submitted_by_you }, //phase II
      { name: "Pending For You", value: summary.pending },
      { name: "Returned to You", value: summary.returned_to_you?.length },
      { name: "In Progress", value: summary.inProgress },
      { name: "Rejected", value: summary.total_rejected },
    ],
  };
};
