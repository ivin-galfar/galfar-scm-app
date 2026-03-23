import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { categoryapprovers, prevRole, roles } from "./roles_helper";
import { CategoryValue, TypeForUi, TypeValue } from "./category_helper";

export const handleRemoveFile = (index, formData, setFormData) => {
  const updatedFilenames = [...formData.filename];
  const updatedFiles = [...formData.file];

  updatedFilenames.splice(index, 1);
  updatedFiles.splice(index, 1);

  setFormData((prev) => ({
    ...prev,
    filename: updatedFilenames,
    file: updatedFiles,
  }));
};

export const handleRemoveFiles = (index, attachments, setAttachments) => {
  if (!Array.isArray(attachments)) return;
  const updatedAttachments = attachments.filter((_, i) => i !== index);
  setAttachments(updatedAttachments);
};

export const handleRemoveBrFile = (
  index,
  brtabledata,
  setbrtabledata,
  setHasChanges,
) => {
  const updatedFilenames = [...brtabledata.filename];
  const updatedFiles = [...brtabledata.file];
  let status = brtabledata.status;

  if (brtabledata.status != "pending for hod") {
    status = "created";
  }
  updatedFilenames.splice(index, 1);
  updatedFiles.splice(index, 1);
  setHasChanges(true);
  setbrtabledata((prev) => ({
    ...prev,
    filename: updatedFilenames,
    file: updatedFiles,
    status: status,
  }));
};

export const wrapWithAndGlue = (text, maxWidth, doc) => {
  const safeText = text.replace(/,?\s+and\s+/g, (match) => `✪${match.trim()}✪`);

  const parts = safeText.split(" ");
  let line = "";
  const result = [];

  for (let p of parts) {
    const word = p.replace(/✪/g, " ");
    const testLine = line ? `${line} ${word}` : word;

    if (doc.getTextWidth(testLine) > maxWidth) {
      result.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) result.push(line);

  return result.map((line) => line.replace(/✪/g, " "));
};

export const getApproverName = (role) => {
  switch (role) {
    case "incharge":
      return "Mr.Anoop";
    case "gm":
      return "Mr.Vijayan. C.G.";
    case "ceo":
      return "Mr.Sridhar.C";
    case "fm":
      return "Mr.Suraj Rajan";
  }
};

export const getPmName = (projectcode) => {
  switch (projectcode) {
    case "7092":
      return "Mr. Manoj E";
    case "7112":
      return "Mr. Manoj E";
    case "7099":
      return "Mr. Shanmugam R.";
    case "7110":
      return "Mr. Swarup Biswas";
    case "7111":
      return "Mr. Manoj Pattabi";
    case "7114":
      return "Mr. Manoj Pattabi";
    case "7108":
      return "Mr. Shivnath Kumar";
    case "7105":
      return "Mr. Jamsheed Nawaz";
    case "7097":
      return "Mr. Jeyaraman Sangaiya";
    case "7102":
      return "Mr. Firose Pareeth";
    case "7104":
      return "Mr. Praveen Kumar";
    case "7106":
      return "Mr. Sumon Kuriakose - Project Director (PD)";
    case "1":
      return "Mr. Pramoj Ramesh Konattuseril (PLANT MANAGER)";
    default:
      return "Unknown PM";
  }
};

export const formatDateDDMMYYYY = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
  });

export const formatDateDDMMYYYYHHMMSS = (date) => {
  if (!date) return "";

  return new Date(date)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Dubai",
    })
    .toUpperCase();
};

export const formatPrice = (value) => {
  return Math.round(value || 0).toLocaleString();
};

export const handleFileUpload = async (files, userInfo, setFormData) => {
  try {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.post(
      `${REACT_SERVER_URL}/receipts/file`,
      formData,
      config,
    );

    const newFiles = response.data.uploadedFiles.map((file) => file.fileUrl);
    const newFileNames = response.data.uploadedFiles.map(
      (file) => file.fileName,
    );

    setFormData((prev) => ({
      ...prev,
      file: [...(prev.file || []), ...newFiles],
      filename: [...(prev.filename || []), ...newFileNames],
    }));
  } catch (error) {
    return error;
  }
};

export const handleAttachmentsUpload = async (files, userInfo) => {
  try {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const response = await axios.post(
      `${REACT_SERVER_URL}/receipts/file`,
      formData,
      config,
    );

    return response.data.uploadedFiles;
  } catch (error) {
    return [];
  }
};

export const getApproverNames = (category, dept) => {
  const flow = categoryapprovers[category] || [];
  return flow.flatMap((role) => {
    if (role == "INITIATOR") {
      return roles.INITIATOR[dept];
    }

    return roles[role] ? [roles[role]] : [];
  });
};

export const getSubmittedDate = (approverinfo = [], role) => {
  let lastsubmissiondate = "";
  const prevrole = prevRole(role);
  const prevapprover = approverinfo?.find((a) => a.role == prevrole);
  if (!prevapprover || !prevapprover.datetime) return "";
  lastsubmissiondate = formatDateDDMMYYYY(prevapprover?.datetime);
  return lastsubmissiondate;
};

export const getlastSubmittedDate = (approverinfo = [], role) => {
  let lastsubmissiondate = "";
  lastsubmissiondate = formatDateDDMMYYYYHHMMSS(
    approverinfo?.[approverinfo.length - 1]?.datetime,
  );
  return lastsubmissiondate;
};

export const formatwords = (buttontxt) => {
  return buttontxt
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getCategoryCode = (category) => {
  return CategoryValue[category] || "";
};

export const getTypeCode = (type) => {
  return TypeValue[type] || "";
};

export const getType = (type) => {
  return TypeForUi[type] || "";
};
