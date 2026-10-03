import axios from "axios";
import { REACT_SERVER_URL, SPECIAL_PROJECTS } from "../../config/ENV";
import { prevRole } from "./roles_helper";
import { CategoryForUi, TypeForFeedUi, TypeValue } from "./category_helper";
import { GetFleetRequestById, getcmpmNames } from "../APIs/api";
import {
  generateFRPDF,
  handleBrPrint,
  handleFnPrint,
  handleHirePrint,
  handlePrint,
} from "./print_helper";
export {
  extractText,
  formatDateDDMMYYYY,
  formatPrice,
  getAlignment,
  getApproverNames,
  getDept,
  getType,
} from "./pdfHelpers";

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
    case "pd":
      return "Mr. Sumon Kuriakose";
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
      return "Mr. Shanmugam R.";
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

export const formatDateDMY = (date) =>
  new Date(date).toLocaleDateString("en-AE", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export const compareWefDate = (wefDate) => {
  const currentDate = new Date();
  const wefDateValue = new Date(wefDate);

  return {
    wefChanged: wefDateValue < currentDate,
    updatedDate: wefDateValue < currentDate ? currentDate : null,
  };
};

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

export const getSubmittedDate = (approverinfo = [], role, module) => {
  let lastsubmissiondate = "";
  const prevrole = prevRole(role, module);
  const prevapprover = Array.isArray(prevrole)
    ? [...(approverinfo || [])]
        .reverse()
        .find((a) => prevrole.includes(a.role?.toLowerCase()))
    : [...(approverinfo || [])]
        .reverse()
        .find((a) => a.role?.toLowerCase() === prevrole?.toLowerCase());
  if (!prevapprover || (!prevapprover.datetime && !prevapprover.date))
    return "";
  const lastdate = prevapprover?.date || prevapprover?.datetime;
  lastsubmissiondate = formatDateDDMMYYYYHHMMSS(lastdate);
  return lastsubmissiondate;
};

export const getlastSubmittedDate = (approverinfo = [], role) => {
  let lastsubmissiondate = "";
  const lastItem = approverinfo?.[approverinfo.length - 1];
  lastsubmissiondate = formatDateDDMMYYYYHHMMSS(
    lastItem?.datetime || lastItem?.date,
  );
  return lastsubmissiondate;
};

export const formatwords = (buttontxt) => {
  return buttontxt
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// export const getCategoryCode = (category) => {
//   return CategoryValue[category] || "";
// };

export const getTypeCode = (type) => {
  return TypeValue[type] || "";
};

export const getFeedType = (type) => {
  return TypeForFeedUi[type] || "";
};

export const getCategoryforUI = (category) => {
  return CategoryForUi[category];
};

export const getEnclosureText = (category) => {
  switch (category) {
    case "Insurance":
      return "Encl: Copy of Vcc, Proforma Invoice, LPO";
    case "PR":
      return "Encl: Copy of Mulkia, Agreement, Inspection Reports & Maintenance Charge";
    case "FC":
      return "Encl: Copy of Registration card";
    case "ADTSNew":
      return "CC: Mr. Suraj Rajan - Sr. Manager (F&A)";
    case "DPR":
      return "Encl: PO and Performa Invoice";
    case "FWA":
      return "Your kind approval in this regard will be highly appreciated.";
    default:
      return "Encl: Relevant documents attached";
  }
};

export const getFooterText = (category) => {
  if (category !== "DPR" && category !== "FWA") {
    return "CC: CEO/GM";
  } else if (category === "FWA") {
    return " ";
  } else {
    return "Pramoj Ramesh\n(Manager P&E)";
  }
};

export const getToValue = (category) => {
  switch (category) {
    case "PR":
      return " Sr.Manager-Finance & Accounts";
    case "FC":
      return " Sr.Manager-Finance & Accounts";
    case "Insurance":
      return "  CEO";
    case "Demob":
      return "Mr. Pramoj Ramesh Konattuseril (Plant Manager)";
    case "FWA":
      return "C.G. Vijayan (General Manager)";
    case "DPR":
      return "  CEO";
  }
};

export const getCCValue = async (category, project_code, userInfo) => {
  const pmName =
    project_code != "" ? await getcmpmNames("pm", project_code, userInfo) : "";
  const pdName = SPECIAL_PROJECTS.includes(Number(project_code))
    ? await getcmpmNames("pd", project_code, userInfo)
    : "";
  switch (category) {
    case "Demob":
      return `C.G. Vijayan (General Manager), ${pmName} (SPM/PM)${pdName ? `, ${pdName} (PD)` : ""}`;
    case "FWA":
      return `${pmName} (SPM/PM)${pdName ? `, ${pdName} (PD)` : ""}`;
  }
};

export const getCMFromValue = async (category, project_code, userInfo) => {
  const cmName =
    project_code != "" ? await getcmpmNames("cm", project_code, userInfo) : "";
  return `${cmName} (CM/SCM - P10${project_code})`;
};

export const getFromValue = (category) => {
  switch (category) {
    case "PR":
      return " Manager (Plant & Equipment)";
    case "FC":
      return " Manager (Plant & Equipment)";
    case "Insurance":
      return " Manager (Plant & Equipment)";
    case "DPR":
      return "  Manager (Plant & Equipment)";
    case "Demob":
      return "  Manager (Plant & Equipment)";
  }
};

export const isBold = (cell) => {
  return cell.content?.some((item) => {
    if (item.type === "text") {
      return item.marks?.some((m) => m.type === "bold");
    }
    if (item.content) {
      return isBold({ content: item.content });
    }
    return false;
  });
};

export const formatName = (name) => {
  if (!name) return "";

  const trimmed = name?.trim();

  if (/^mr\./i.test(trimmed)) {
    return trimmed;
  }

  return `Mr. ${trimmed}`;
};

export const generatePDF = async (responseData, userInfo) => {
  if (responseData?.status !== "approved") return null;

  try {
    const result = await handleFnPrint(responseData, userInfo, true);
    const pdfBlob = result?.pdfBlob;

    if (!pdfBlob) return null;

    const pdfFile = new File(
      [pdfBlob],
      `Approved_Statement_${responseData.doc_no}.pdf`,
      {
        type: "application/pdf",
      },
    );

    const uploadedFiles = await handleAttachmentsUpload([pdfFile], userInfo);
    if (uploadedFiles && uploadedFiles.length > 0) {
      return uploadedFiles[0].fileUrl || uploadedFiles[0].url || null;
    }
  } catch (err) {
    console.error("PDF generation/upload failed:", err);
  }

  return null;
};

export const generatePDFLG = async (formData, tableData, userInfo) => {
  if (formData?.status !== "approved") return null;
  try {
    const result = await handlePrint(formData, tableData, userInfo, true);

    const pdfBlob = result?.pdfBlob;

    if (!pdfBlob) return null;

    const pdfFile = new File(
      [pdfBlob],
      `Approved_Statement_${formData.shipment_no}.pdf`,
      {
        type: "application/pdf",
      },
    );

    const uploadedFiles = await handleAttachmentsUpload([pdfFile], userInfo);
    if (uploadedFiles && uploadedFiles.length > 0) {
      return uploadedFiles[0].fileUrl || uploadedFiles[0].url || null;
    }
  } catch (error) {
    console.error("PDF generation/upload failed:", error);
  }
};

export const generateBvrPDF = async (responseData, userInfo) => {
  if (responseData?.status !== "approved") return null;

  try {
    const result = handleBrPrint(responseData, true);

    const pdfBlob = result?.pdfBlob;

    if (!pdfBlob) return null;

    const pdfFile = new File(
      [pdfBlob],
      `Approved_Statement_${responseData.id}.pdf`,
      {
        type: "application/pdf",
      },
    );

    const uploadedFiles = await handleAttachmentsUpload([pdfFile], userInfo);

    if (uploadedFiles && uploadedFiles.length > 0) {
      return uploadedFiles[0].fileUrl || uploadedFiles[0].url || null;
    }
  } catch (err) {}

  return null;
};

export const generatePDFHire = async (responseData, userInfo) => {
  if (responseData.formData?.status.toLowerCase() !== "approved") return null;
  try {
    const result = await handleHirePrint(
      responseData,
      userInfo,
      responseData.tableData,
      true,
    );
    const type = responseData.formData.type;
    const doc_no = responseData.formData.doc_no.split("/")[4].trim();
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const pdfBlob = result?.pdfBlob;

    if (!pdfBlob) return null;

    const pdfFile = new File(
      [pdfBlob],
      `CS_${formattedType + "_" + doc_no}.pdf`,
      {
        type: "application/pdf",
      },
    );

    const uploadedFiles = await handleAttachmentsUpload([pdfFile], userInfo);
    if (uploadedFiles && uploadedFiles.length > 0) {
      return uploadedFiles[0].fileUrl || uploadedFiles[0].url || null;
    }
  } catch (error) {
    console.error("PDF generation/upload failed:", error);
  }
};

export const handleFrPrint = async (
  fleetRequest,
  userInfo,
  emailPdf = false,
) => {
  const requestId = fleetRequest?.id ?? null;
  const hasCompleteData =
    fleetRequest &&
    typeof fleetRequest === "object" &&
    Array.isArray(fleetRequest.items);
  const completeRequest = hasCompleteData
    ? fleetRequest
    : await GetFleetRequestById(userInfo, requestId);
  console.log("comp", completeRequest);

  return generateFRPDF(completeRequest, userInfo, emailPdf);
};

export const generateFRApprovedPDF = async (fleetRequestId, userInfo) => {
  if (!fleetRequestId) {
    throw new Error(
      "Fleet Request id is required to generate the approved PDF.",
    );
  }
  console.log("entering into", fleetRequestId);

  const approvedRequest = await GetFleetRequestById(userInfo, fleetRequestId);
  if (
    String(approvedRequest?.status ?? "")
      .trim()
      .toLowerCase() !== "approved"
  ) {
    throw new Error(
      "The latest Fleet Request data is not in the approved state.",
    );
  }

  let pdfResult;
  try {
    pdfResult = await handleFrPrint(approvedRequest, userInfo, true);
  } catch (error) {
    console.error("Fleet Request approved PDF generation failed", error);
    throw error;
  }

  const pdfBlob = pdfResult?.pdfBlob;
  if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
    if (pdfResult?.blobUrl) URL.revokeObjectURL(pdfResult.blobUrl);
    throw new Error(
      "Fleet Request PDF generation did not return a valid Blob.",
    );
  }
  console.log(pdfBlob);
  console.log("approvedreq", approvedRequest);

  const safeDocumentNumber = String(approvedRequest?.doc_id).replace(
    /[^a-zA-Z0-9_-]+/g,
    "_",
  );
  const pdfFile = new File(
    [pdfBlob],
    `Approved_Fleet_Request_${safeDocumentNumber}.pdf`,
    { type: "application/pdf" },
  );

  try {
    const uploadedFiles = await handleAttachmentsUpload([pdfFile], userInfo);
    const uploadedUrl = uploadedFiles?.[0]?.fileUrl || uploadedFiles?.[0]?.url;
    console.log(uploadedUrl);

    if (typeof uploadedUrl !== "string" || !uploadedUrl.trim()) {
      throw new Error(
        "Fleet Request approved PDF upload did not return a Blob URL.",
      );
    }

    return uploadedUrl;
  } catch (error) {
    console.error("Fleet Request approved PDF upload failed", error);
    throw error;
  } finally {
    if (pdfResult?.blobUrl) URL.revokeObjectURL(pdfResult.blobUrl);
  }
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export const getPath = (label) => {
  switch (label) {
    case "Asset CS":
      return "receipts";
    case "Hiring CS":
      return "receipts";
    case "Logistics CS":
      return "lstatements";
    case "File Note":
      return "filenote";
    case "IOC":
      return "filenote";
    case "Buy Vs Rent":
      return "brstatement";
    case "Fleet Request":
      return "fleetrequest";
    default:
      return "";
  }
};

export const initiatorRoles = [
  "inita",
  // "initfn", //directly used this role wherever required
  "inith",
  "initpr",
  "initdc",
  "view",
  "initlg",
  "initfr",
];
