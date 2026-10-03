import { TypeForUi } from "./category_helper";
import { categoryapprovers, roles } from "./roles_helper";

export const formatDateDDMMYYYY = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
  });

export const formatPrice = (value) => {
  return Math.round(value || 0).toLocaleString();
};

export const getApproverNames = (flow, dept) => {
  const flowRoles = categoryapprovers[flow] || [];

  return flowRoles.flatMap((role) => {
    if (role == "INITIATOR") {
      return roles.INITIATOR[dept];
    }

    return roles[role] ? [roles[role]] : [];
  });
};

export const getType = (type) => {
  return TypeForUi[type] || "";
};

export const extractText = (content = []) => {
  return content
    .map((item) => {
      if (item.type === "text") return item.text || "";
      if (item.type === "hardBreak") return "\n";
      if (item.content) return extractText(item.content);
      return "";
    })
    .join(" ");
};

export const getAlignment = (cell) => {
  const paragraph = cell.content?.find((content) => content.type === "paragraph");
  return paragraph?.attrs?.textAlign || "left";
};

export const getDept = (code) => {
  switch (code) {
    case 1:
      return "Plant & Equipment Department";
    case 2:
      return "Logistics Department";
    default:
      return undefined;
  }
};
