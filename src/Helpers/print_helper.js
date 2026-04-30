import jsPDF from "jspdf";
import galfarlogo from "../assets/Images/logo-new.png";
import { autoTable } from "jspdf-autotable";
import {
  extractText,
  formatDateDDMMYYYY,
  formatPrice,
  getAlignment,
  getApproverNames,
  getDept,
  getType,
  isBold,
} from "./helperfunctions";
import { categoryapprovers, nextRole, roles } from "./roles_helper";
import { getcmpmNames } from "../APIs/api";

export const handlePrint = (formData, tableData) => {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 60;
  const logoHeight = 10;
  doc.setFontSize(14);
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = 2;

  doc.addImage(galfarlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

  doc.setFontSize(12);

  doc.text(`LOGISTICS COMPARISON STATEMENT`, pageWidth / 2, 22, {
    align: "center",
  });

  doc.setFontSize(10);
  const labelXleft = 14;
  const valueXleft = 50;

  doc.text("Shipment No:", labelXleft, 38);
  doc.text(String(formData.shipment_no), valueXleft, 38);

  doc.text("Cargo Details:", labelXleft, 45);
  doc.text(String(formData.cargo_details), valueXleft, 45);

  doc.text("Chargeable Weight:", labelXleft, 51);
  doc.text(String(formData.chargeable_weight), valueXleft, 51);

  doc.text("Gross Weight:", labelXleft, 57);
  doc.text(String(formData.gross_weight), valueXleft, 57);

  const startX = 120;
  const valueXcenter = 150;
  doc.text("Supplier:", startX, 38);
  doc.text(formData.supplier, valueXcenter, 38);

  doc.text("Description:", startX, 45);
  doc.text(formData.description, valueXcenter, 45);

  doc.text("Scope of work:", startX, 51);
  doc.text(formData.scopeofwork, valueXcenter, 51);

  doc.text("Mode:", startX, 57);
  doc.text(formData.mode, valueXcenter, 57);

  const labelX = 230;
  const valueX = 250;

  doc.text("CS No.:", labelX, 38);
  doc.text(formData.id.toString(), valueX, 38);

  doc.text("Date:", labelX, 45);
  doc.text(formatDateDDMMYYYY(formData.date), valueX, 45);

  doc.text("Po:", labelX, 51);
  doc.text(formData.po, valueX, 51);

  doc.text("Project:", labelX, 57);
  doc.text(formData.project, valueX, 57);

  const vendorNames = tableData
    .map((vendor) => vendor.vendorcol)
    .reduce((max, arr) => (arr.length > max.length ? arr : max));

  const headerRow1 = [
    { content: "Forwarders", rowSpan: 1 },
    ...vendorNames.map((name) => name),
  ];
  const tableBody = tableData.map((row) => {
    const forwarderValues = Object.keys(row.forwarders || {}).map(
      (key) => row.forwarders[key] ?? 0,
    );
    const particulars = row.particulars;

    return [particulars, ...forwarderValues];
  });
  const selected_vendor_index = formData.selected_vendor_index;
  const tableHead = [headerRow1];

  const selectedRow = [
    { content: "Selected" },
    ...vendorNames.map((_, index) => {
      const isSelected = index === selected_vendor_index;
      return {
        content: isSelected ? "Yes" : "--",
        styles: isSelected
          ? { textColor: [0, 128, 0], fontStyle: "bold" }
          : { textColor: [100, 100, 100], fontStyle: "normal" },
      };
    }),
  ];

  const ratingRow = [
    { content: "Rating" },
    ...vendorNames.map((_, index) => ({
      content: `L${index + 1}`,
      styles: { fontStyle: "bold" },
    })),
  ];
  tableBody.push(ratingRow);

  tableBody.push(selectedRow);
  autoTable(doc, {
    startY: 65,
    head: tableHead,
    body: tableBody,
    margin: { left: 10, right: 10 },
    tableWidth: "auto",
    styles: {
      fontSize: 10,
      overflow: "linebreak",
      cellPadding: { top: 2, right: 1, bottom: 2, left: 0.5 },
      cellWidth: "wrap",
      halign: "center",
    },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    columnStyles: {
      0: { cellWidth: 60 },
    },
  });

  const startYNotes =
    doc.previousAutoTable?.finalY || doc.lastAutoTable?.finalY || 65;
  const notesX = 14;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text("Notes:", notesX, startYNotes + 5);

  const defaultNotesRaw =
    "1- Above rates are after negotiation. 2- MOFAIC charges, BOE charges and other government charges shall be at actual.3- The above rates are based on current estimation and there shall be changes subject to final weight and dimension.";

  const defaultNotes = defaultNotesRaw
    .split(/\d-\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const bulletX = notesX + 4;

  let y = startYNotes + 12;
  const maxWidth = 220;
  const lineHeight = 6;
  let totalLines = 0;

  defaultNotes.forEach((note) => {
    const wrapped = doc.splitTextToSize(`• ${note}`, maxWidth);
    doc.text(wrapped, bulletX, y);
    y += wrapped.length * lineHeight;
    totalLines += wrapped.length;
  });
  doc.setFont("helvetica", "normal");
  const notesText = formData.recommendation_reason || "";

  let sentences = notesText
    .split(/(?<=\."|\n)/g)
    .map((s) => s.trim())
    .filter((s) => s !== "");

  sentences.forEach((sentence) => {
    const wrapped = doc.splitTextToSize(sentence, maxWidth);

    wrapped.forEach((line, index) => {
      if (index === 0) {
        doc.text(`• ${line}`, bulletX, y);
      } else {
        doc.text(line, bulletX + 4, y);
      }

      y += lineHeight;
      totalLines += 1;
    });
  });

  const pageHeight = doc.internal.pageSize.height;
  const roleDisplayMap = {
    incharge: "Mr.Anoop.GP",
    pm: "Project Manager",
    gm: "Mr.Vijayan.C",
    fm: "Mr.Suraj.R",
    ceo: "Mr.Sridhar. C",
  };

  const rolesToShow = ["incharge", "pm", "gm", "fm", "ceo"];

  const status = {};
  const currentStatus = formData.status?.toLowerCase() || "";
  let pendingIndex = -1;

  const rejectedRole = formData.rejectedby;
  if (currentStatus.startsWith("pending for")) {
    const pendingRole = currentStatus.replace("pending for ", "").trim();
    pendingIndex = rolesToShow.findIndex(
      (r) => r.toLowerCase() === pendingRole,
    );
  }

  rolesToShow.forEach((role, i) => {
    if (rejectedRole) {
      const rejectedIndex = rolesToShow.findIndex(
        (r) => r.toLowerCase() === rejectedRole.toLowerCase(),
      );
      if (i < rejectedIndex) {
        status[role] = "Approved";
      } else if (i === rejectedIndex) {
        status[role] = "Rejected";
      } else {
        status[role] = "--";
      }
    } else if (currentStatus === "approved") {
      status[role] = "Approved";
    } else if (pendingIndex >= 0) {
      if (i < pendingIndex) status[role] = "Approved";
      else if (i === pendingIndex) status[role] = "(Pending)";
      else status[role] = "--";
    } else {
      status[role] = "--";
    }
  });

  const totalApprovers = rolesToShow.length;
  const sectionWidth = pageWidth - 60;
  const spacing1 = sectionWidth / (totalApprovers - 1);
  const baseX = 30;
  const approverStartY1 = pageHeight - 100;
  let offsetY = 60;

  if (totalLines >= 8) {
    offsetY = 80;
  } else if (totalLines >= 6) {
    offsetY = 70;
  } else if (totalLines >= 5) {
    offsetY = 65;
  } else {
    offsetY = 50;
  }

  rolesToShow.forEach((dbRole, index) => {
    const roleStatus = status[dbRole];
    if (!roleStatus) return;

    const displayName = roleDisplayMap[dbRole] || dbRole;
    const displayRole =
      dbRole !== "incharge"
        ? `(${dbRole.toUpperCase()})`
        : "(Logistics Incharge)";

    const centerX = baseX + index * spacing1;
    const statusWidth = doc.getTextWidth(roleStatus);
    const nameWidth = doc.getTextWidth(displayName);
    const roleWidth = doc.getTextWidth(displayRole);
    const lineWidth = Math.max(statusWidth, nameWidth);

    let textColor = [0, 0, 0];
    if (roleStatus === "Approved") textColor = [0, 128, 0];
    else if (roleStatus === "Rejected") textColor = [200, 0, 0];
    else textColor = [255, 165, 0];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);

    doc.text(roleStatus, centerX - statusWidth / 2, approverStartY1 + offsetY);

    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(
      centerX - lineWidth / 2,
      approverStartY1 + offsetY + 1.5,
      centerX + lineWidth / 2,
      approverStartY1 + offsetY + 1.5,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(
      displayName,
      centerX - nameWidth / 2,
      approverStartY1 + offsetY + 6,
    );
    doc.text(
      displayRole,
      centerX - roleWidth / 2,
      approverStartY1 + offsetY + 12,
    );
  });

  const footerPadding = 2;
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);

    doc.text(
      `This statement is Electronically Approved; Signature Not Required`,
      14,
      pageHeight - footerPadding,
    );
    doc.text(
      `Prepared By ${formData?.createdby?.split("@")[0]}`,
      pageWidth - 14,
      pageHeight - footerPadding,
      {
        align: "right",
      },
    );

    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
  }
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
};

export const handleBrPrint = (formData) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;
  const logoWidth = 60;
  const logoHeight = 10;
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = 2;

  const formatP = (val) => (val != 0 ? formatPrice(val) : "--");
  const dateStr = formatDateDDMMYYYY(formData.created_at);
  const currencyCode = formData.currency.split(" - ")[0].trim();

  /* =========================
      1. HEADER & HIGHLIGHTED ITEM
  ========================= */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.addImage(galfarlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

  y += 8;
  doc.setFontSize(12);

  doc.text("Comparison of Buy Vs Rental", pageWidth / 2, y, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  const rightBlockX = pageWidth - 40; // starting position of the right block

  doc.setFontSize(9);

  doc.text(`BVR No: ${formData.id || ""}`, rightBlockX, y - 3);
  doc.text(`Date: ${dateStr}`, rightBlockX, y + 3);

  y += 8;
  const itemText = `Item : ${formData.item}`;

  const margin = 14; // same margin you use in jsPDF tables usually
  const rectWidth = pageWidth - margin * 2;

  doc.setFillColor(245, 245, 245);

  // Full width background
  doc.rect(margin, y - 4, rectWidth, 6, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);

  // Keep text centered
  doc.text(itemText, pageWidth / 2, y, { align: "center" });

  doc.setTextColor(0);
  y += 7;

  /* =========================
      2. CASH FLOW TABLES (SIDE BY SIDE)
  ========================= */
  doc.setFontSize(11);
  let cashflowx = 14;
  doc.setFont("helvetica", "bold");
  const cashflowtext = "Cash flow Gain/loss";
  const textWidthtypecashflow = doc.getTextWidth(cashflowtext);
  doc.setFillColor(204, 255, 204);

  // doc.setFillColor(222, 235, 255);
  const paddingX = 0; // horizontal padding

  const rectHeight = 6;

  doc.rect(
    cashflowx - paddingX,
    y - rectHeight + 2,
    textWidthtypecashflow + paddingX * 2 + 40,
    rectHeight,
    "F",
  );
  doc.text(cashflowtext, 14, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const topPadding = 4;

  doc.text(`Currency: ${currencyCode || ""} `, rightBlockX, y - 3 + topPadding);
  y += 4;

  const buyingBody = [
    ["Unit Price", formatP(formData.unit_price)],
    ["No of Units", formData.units_no],
    ["Total Principal Cost", formatP(formData.principal_cost)],
    ["Interest Rate", `${formData.int_rate}%`],
    ["Tenure-Years", formatP(formData.fin_tenure)],
    ["Tenure-Months", formatP(formData.tenure_months)],
    ["Monthly Instalment", formatP(formData.monthly_installment)],
    ["Total Interest Cost", formatP(formData.total_interest_cost)],
    [
      "Total Principal + Interest",
      formatP(formData.principal_with_interest_buy),
    ],
    ["Operation Cost (Tenure)", formatP(formData.op_cost_tenure)],
    ["Maintenance Cost (Tenure)", formatP(formData.maintenance_cost_tenure)],
    [
      {
        content: "Total Cost Outflow",
        styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
      },
      {
        content: formatP(formData.cash_outflow_buying),
        styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
      },
    ],
  ];

  const rentingBody = [
    ["Unit Rental", formatP(formData.monthly_rent)],
    ["No of Units", formData.units_no],
    ["Tenure-Years", formatP(formData.fin_tenure)],
    ["Tenure-Months", formatP(formData.tenure_months)],
    ["Monthly Rent", formatP(formData.total_monthly_rental)],
    ["Total Rental", formatP(formData.total_rental_cost)],
    ["Operation Cost", formatP(formData.op_cost_rental)],
    ["Maintenance Cost", formatP(formData.maint_rental)],
    ["", ""],
    ["", ""],
    ["", ""],
    [
      {
        content: "Total Cost Outflow",
        styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
      },
      {
        content: formatP(formData.cash_outflow_renting),
        styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
      },
    ],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: 14 },
    tableWidth: 89,
    head: [
      [
        {
          content: "Buying",
          colSpan: 2,
          styles: { halign: "center", fillColor: [22, 101, 52] },
        },
      ],
    ],
    body: buyingBody,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 1.2 },
    columnStyles: { 1: { halign: "right" } },
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 107 },
    tableWidth: 89,
    head: [
      [
        {
          content: "Renting",
          colSpan: 2,
          styles: { halign: "center", fillColor: [220, 38, 38] },
        },
      ],
    ],
    body: rentingBody,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 1.2 },
    columnStyles: { 1: { halign: "right" } },
  });

  // FIX: Dynamically set Y to the bottom of the tables before drawing benefit line
  y = doc.lastAutoTable.finalY + 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  const part1cash = "Cash flow benefit in ";
  const part2cash = formData.chosentype || ""; // highlighted
  const part3cash = ` with benefit of (${currencyCode}) ${formatPrice(
    formData.benefit,
  )} in ${formatP(formData.fin_tenure)} Years`;

  let xcash = 14;

  // part 1
  doc.setTextColor(0, 0, 0);
  doc.text(part1cash, xcash, y);
  xcash += doc.getTextWidth(part1cash);

  const textWidthcash = doc.getTextWidth(part2cash);
  doc.setFillColor(255, 255, 0);
  doc.rect(xcash - 0.5, y - 3.5, textWidthcash + 1, 4.5, "F");

  doc.text(part2cash, xcash, y);
  xcash += textWidthcash;

  // part 3
  doc.setTextColor(0, 0, 0);
  doc.text(part3cash, xcash, y);

  y += 8;

  /* =========================
      3. ACCOUNTING GAIN/LOSS
  ========================= */
  doc.setFontSize(11);
  let accountingX = 14;
  doc.setFont("helvetica", "bold");

  const accountingText = "Accounting Gain/Loss";
  doc.setFillColor(222, 235, 255);

  // doc.setFillColor(204, 255, 204);

  // Highlight rectangle (same style as Cash flow)
  doc.rect(
    accountingX - paddingX,
    y - rectHeight + 2,
    textWidthtypecashflow + paddingX * 2 + 40,
    rectHeight,
    "F",
  );

  // Text on top
  doc.setTextColor(0, 0, 0);
  doc.text(accountingText, accountingX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ["Depreciation Rate", "", "", "", `${formData.dp_rate || 0}%`],
      ["Depreciation Cost", "", "", "", formatP(formData.depreciation_cost)],
      ["Interest Cost", "", "", "", formatP(formData.total_interest_cost)],
      [
        "Operation & Maintenance Cost",
        "",
        "",
        "",
        formatP(formData.maintenance_cost_tenure),
      ],
      [
        "Total Expenses - BUYING",
        "",
        "",
        "",
        formatP(formData.total_expenses_buying),
      ],
      [
        "Total Expenses - RENTALS",
        "",
        "",
        "",
        formatP(formData.total_rental_cost),
        {
          styles: {
            lineWidth: { left: 0, right: 0.1, top: 0.1, bottom: 0.1 },
          },
        },
      ],
      [
        {
          content: `Accounting Gain/Loss`,
          styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
        },
        {
          content: formData.chosentype,
          styles: {
            fontStyle: "bold",
            fillColor: [255, 255, 0],
            cellWidth: 20,
            halign: "left",
          },
        },
        {
          content: "",
        },
        {
          content: "",
          styles: { cellWidth: 80 },
        },
        {
          content: formatP(formData.accounting_gain_loss),
          styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
        },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 1.2 },
    columnStyles: {
      1: {
        halign: "left",
        lineWidth: { left: 0, right: 0, top: 0.1, bottom: 0.1 },
      },
      2: {
        halign: "left",
        lineWidth: { left: 0, right: 0, top: 0.1, bottom: 0.1 },
      },
      3: {
        halign: "left",
        lineWidth: { left: 0, right: 0, top: 0.1, bottom: 0.1 },
      },
      4: { halign: "right" },
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* =========================x
      4. PAYBACK PERIOD
  ========================= */
  doc.setFontSize(11);
  let paybackX = 14;
  doc.setFont("helvetica", "bold");

  const paybackText = "Payback period";

  doc.setFillColor(255, 248, 204);

  // Highlight rectangle
  doc.rect(
    paybackX - paddingX,
    y - rectHeight + 2,
    textWidthtypecashflow + paddingX * 2 + 40,
    rectHeight,
    "F",
  );

  // Text
  doc.setTextColor(0, 0, 0);
  doc.text(paybackText, paybackX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [
      [
        { content: "Particulars", styles: { halign: "left" } },
        { content: "Without Maint", styles: { halign: "center" } },
        { content: "Incl Maint", styles: { halign: "center" } },
      ],
    ],
    body: [
      [
        "Total Cost in Buying",
        formatP(formData.principal_with_interest_buy),
        formatP(formData.cash_outflow_buying),
      ],
      [
        "Monthly Rentals",
        formatP(formData.total_monthly_rental),
        formatP(formData.total_monthly_rental),
      ],
      [
        { content: "Payback period - Months", styles: { fontStyle: "bold" } },
        formatP(
          formData.cost_in_buying_without_main / formData.total_monthly_rental,
        ),
        formatP(
          formData.cost_in_buying_with_main / formData.total_monthly_rental,
        ),
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 1.2 },
    headStyles: { fillColor: [230, 126, 34] },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
  });

  y = doc.lastAutoTable.finalY + 6;

  /* =========================
      5. SUMMARY SECTION
  ========================= */
  doc.setFontSize(11);
  let summaryX = 14;
  doc.setFont("helvetica", "bold");

  const summaryText = "Summary";

  doc.setFillColor(230, 220, 255);

  // Highlight rectangle
  doc.rect(
    summaryX - paddingX,
    y - rectHeight + 2,
    textWidthtypecashflow + paddingX * 2 + 40,
    rectHeight,
    "F",
  );

  // Text
  doc.setTextColor(0, 0, 0);
  doc.text(summaryText, summaryX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      [
        "Cash flow benefit in",
        `${formatP(formData.fin_tenure)} Years`,
        { content: formatP(formData.benefit) },
      ],
      [
        "Accounting Gains in",
        `${formatP(formData.fin_tenure)} Years`,
        formData.chosentype,
        {
          content: formatP(formData.accounting_gain_loss),
        },
      ],
      [
        "With Payback period of",
        `${formatP(formData.cost_in_buying_with_main / formData.total_monthly_rental)} Months`,
        "",
        "",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: { 3: { halign: "right" } },
  });

  y = doc.lastAutoTable.finalY + 8;

  /* =========================
      6. RECOMMENDATION
  ========================= */
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  doc.setTextColor(0, 0, 0);

  let x = 14;

  const part1 = "Recommended for: ";
  doc.text(part1, x, y);
  x += doc.getTextWidth(part1);
  doc.setFillColor(255, 255, 0);

  const part2 = formData.chosentype || "";

  const textWidthtype = doc.getTextWidth(part2);

  doc.setFillColor(255, 255, 0);
  doc.rect(x - 0.5, y - 3.5, textWidthtype + 1, 4.5, "F");

  doc.text(part2, x, y);

  x += textWidthtype;

  doc.setTextColor(0, 0, 0);
  const part3 = `   As on ${dateStr}`;
  doc.text(part3, x, y);

  const footerY = 275;
  const col = pageWidth / 4;
  const pageHeight = doc.internal.pageSize.height;
  const footerPadding = 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("(HOD)", col * 0.65, footerY + 5.5, { align: "center" });
  doc.text("(SFM)", col * 1.5, footerY + 5.5, { align: "center" });
  doc.text("(GM)", col * 2.4, footerY + 5.5, { align: "center" });
  doc.text("(CEO)", col * 3.3, footerY + 5.5, { align: "center" });
  const names = getApproverNames("BUYRENT", "BUYRENT");
  const approvers = categoryapprovers.BUYRENT;
  const approvals = formData.approver_info;
  const isReviewStatus = formData?.status?.toLowerCase() === "review";
  const flowRoles = approvers.map((r) => r.toLowerCase());

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const lineY = footerY - 7;
  [0.65, 1.5, 2.4, 3.3].forEach((m, index) => {
    const name = names[index] || "";
    const role = approvers[index]?.toLowerCase();

    const lastApprover = approvals?.[approvals.length - 1];
    const lastRole = lastApprover?.role?.toLowerCase() ?? "";
    const currentRoleIndex = flowRoles.indexOf(lastRole);
    const roleIndex = flowRoles.indexOf(role);

    const status =
      approvals?.findLast((a) => a.role.toLowerCase() === role)?.status ?? "--";
    const formattedstatus = status.charAt(0).toUpperCase() + status.slice(1);
    const isRejected = approvals?.some(
      (a) => a.status?.toLowerCase() === "rejected",
    );
    const nextPending = !isRejected ? nextRole(lastRole) : null;

    const isFutureReviewRole =
      isReviewStatus && currentRoleIndex >= 0 && roleIndex > currentRoleIndex;

    const displayStatus = isFutureReviewRole
      ? "--"
      : nextPending && role.toLowerCase() === nextPending.toLowerCase()
        ? "(Pending)"
        : formattedstatus;

    let color = [128, 128, 128];
    if (status.toLowerCase() === "approved") color = [0, 128, 0];
    else if (status.toLowerCase() === "rejected") color = [200, 0, 0];
    if (displayStatus.toLowerCase() === "(pending)") color = [255, 165, 0];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.line(col * m - 20, lineY, col * m + 20, lineY);
    doc.text(displayStatus, col * m, lineY - 4, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(name, col * m, footerY, { align: "center" });
  });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `This Statement is Electronically Approved; Signature Not Required `,
    60,
    pageHeight - footerPadding,
  );

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
};

export const handleFnPrint = async (data, userInfo) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 60;
  const logoHeight = 10;
  doc.setFontSize(14);
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = 10;

  doc.addImage(galfarlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

  doc.setFontSize(12);

  const text = getType(data?.type);
  const dept =
    data.category != "FWA"
      ? getDept(data?.department_id)
      : `PROJECT - P10${data?.project_code} `;

  const x = pageWidth / 2;
  let y = 30;

  doc.text(dept, x, y, { align: "center" });

  y += 8; // spacing between lines
  doc.text(text, x, y, { align: "center" });

  const textWidth = doc.getTextWidth(text);
  const startX = x - textWidth / 2;
  const endX = x + textWidth / 2;

  doc.line(startX, y + 1, endX, y + 1);

  const marginLeft = 14;
  const marginRight = 20;
  const contentWidth = 180;
  const marginTop = 40;
  const marginBottom = 20;
  const headerBottomY = 50;
  const paragraphFontSize = 11;
  const paragraphLineHeight = 6;
  const paragraphSpacing = 4;
  y = headerBottomY;
  let pageHeight = doc.internal.pageSize.height;

  data.content.content.forEach((block) => {
    if (block.type === "table") {
      const body = block.content.map((row, rowIndex) =>
        row.content.map((cell) => ({
          content: extractText(cell.content || []),
          colSpan: cell.attrs?.colspan || 1,
          styles: {
            halign: getAlignment(cell),
            fontStyle: rowIndex === 0 ? "bold" : "normal",
          },
        })),
      );

      autoTable(doc, {
        startY: y,
        body: body,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontStyle: "normal",
          fontSize: 10,
          textColor: [0, 0, 0],
          lineWidth: 0.3,
          cellPadding: 2,
        },
        margin: {
          left: marginLeft,
          right: marginRight,
          top: marginTop,
          bottom: marginBottom,
        },
        headStyles: {
          fontStyle: "bold",
          textColor: [0, 0, 0],
          fillColor: [240, 240, 240], // light gray header (optional)
          lineWidth: 0.4,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },

        theme: "grid",
      });

      // update Y position after table
      y = doc.lastAutoTable.finalY + 20;
    } else if (block.type === "paragraph") {
      const lines = [];
      let currentLine = [];

      block.content?.forEach((item) => {
        if (item.type === "hardBreak") {
          if (currentLine.length > 0) {
            lines.push([...currentLine]);
            currentLine = [];
          }
        } else if (item.type === "text") {
          currentLine.push(item);
        }
      });

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // Render each logical line (separated by hardBreaks)
      lines.forEach((line) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        // Build full text and formatting map
        let fullText = "";
        const formatMap = [];

        line.forEach((textItem) => {
          const text = textItem.text || "";
          const isBold =
            textItem.marks?.some((m) => m.type === "bold") || false;

          for (let i = 0; i < text.length; i++) {
            formatMap.push({ bold: isBold });
          }

          fullText += text;
        });

        // Wrap text to fit page width
        doc.setFontSize(paragraphFontSize);
        doc.setFont("helvetica", "normal");
        const wrappedLines = doc.splitTextToSize(fullText, contentWidth);

        let charIndex = 0;

        wrappedLines.forEach((wrappedLine) => {
          if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
          }

          let xPos = marginLeft;

          // Render each character/segment with proper formatting
          for (let i = 0; i < wrappedLine.length; i++) {
            const char = wrappedLine[i];
            const formatting = formatMap[charIndex] || {
              bold: false,
              underline: false,
            };

            doc.setFontSize(paragraphFontSize);
            doc.setFont("helvetica", formatting.bold ? "bold" : "normal");
            doc.text(char, xPos, y);

            if (formatting.underline) {
              const charWidth = doc.getTextWidth(char);
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.3);
              doc.line(xPos, y + 1, xPos + charWidth, y + 1);
            }

            xPos += doc.getTextWidth(char);
            charIndex++;
          }

          y += paragraphLineHeight + paragraphSpacing;
        });
      });
    }

    // ✅ BULLET LIST
    else if (block.type === "bulletList") {
      block.content.forEach((listItem) => {
        if (listItem.type === "listItem" && listItem.content) {
          // Extract text from paragraph inside listItem
          const paragraphBlock = listItem.content[0];
          if (paragraphBlock && paragraphBlock.type === "paragraph") {
            const itemText =
              paragraphBlock.content?.map((t) => t.text || "").join(" ") || "";

            if (itemText.trim()) {
              // Check if we need a new page
              if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
              }

              doc.setFont("helvetica", "normal");
              doc.setFontSize(paragraphFontSize);
              doc.setLineHeightFactor(1.1); // tighter lines

              const wrapped = doc.splitTextToSize(
                `• ${itemText}`,
                contentWidth - 4,
              );

              doc.text(wrapped, marginLeft + 4, y);

              y += wrapped.length * paragraphLineHeight;
            }
          }
        }
      });

      // Add spacing after bullet list
      y += paragraphSpacing + 2;
    }
  });

  const footerY = 275;
  const footerPadding = 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  const skipSfmCategories = ["tfw", "general", "insurance", "fc", "pr", "dpr"];
  const categoryKey = String(data?.category || "")
    .trim()
    .toLowerCase();
  const skipSfm = skipSfmCategories.includes(categoryKey);
  const demob = data.category == "Demob";
  const fwa = data.category == "FWA";

  let approverLabels;

  if (skipSfm) {
    approverLabels = ["(HOD)", "(GM)", "(CEO)"];
  } else if (demob) {
    approverLabels = ["(CM / SCM)"];
  } else if (fwa && data.project_code != 101501) {
    approverLabels = ["(CM / SCM)", "(PM / SPM)", "(GM)"];
  } else if (fwa && data.project_code == 101501) {
    approverLabels = ["(CM / SCM)", "(GM)"];
  } else {
    approverLabels = ["(HOD)", "(SFM)", "(GM)", "(CEO)"];
  }

  let approverIndexes;

  if (skipSfm || (fwa && data.project_code === 101501)) {
    approverIndexes = [0, 1];
  } else if (demob) {
    approverIndexes = [0];
  } else if (fwa && data.project_code !== 101501) {
    approverIndexes = [0, 1, 2];
  } else {
    approverIndexes = [0, 1, 2, 3];
  }
  let Flow;
  const category = data?.category;

  if (category === "Ap" || category === "ADTSNew" || category === "ADTSRen") {
    Flow = "FNIOC";
  } else {
    Flow = "FNIOCM";
  }
  let names = [];

  if (category == "Demob") {
    const cmName = await getcmpmNames("cm", data.project_code, userInfo);
    names.push(cmName);
  } else if (category == "FWA") {
    let pmName = "";
    const cmName = await getcmpmNames("cm", data.project_code, userInfo);
    if (data.project_code != 101501) {
      pmName = await getcmpmNames("pm", data.project_code, userInfo);
      names.push(pmName);
    }
    names.push(cmName);
    names.push(roles.GM);
  } else {
    names = getApproverNames(Flow, "FNIOC");
  }

  let approvers = categoryapprovers.FNIOCM;

  if (
    data?.category == "Ap" ||
    data.category == "ADTSNew" ||
    data.category == "ADTSRen"
  ) {
    approvers = categoryapprovers.FNIOC;
  } else if (data.category == "Demob") {
    approvers = categoryapprovers.FNDEMOB;
  } else if (data.category == "FWA" && data.project_code != 101501) {
    approvers = categoryapprovers.FNFWA;
  } else if (data.category == "FWA" && data.project_code == 101501) {
    approvers = categoryapprovers.FNFWAS;
  }

  const approvals = data.approver_info || [];
  const isReviewStatus = data?.status?.toLowerCase() === "review";
  const flowRoles = approvers.map((r) => r.toLowerCase());

  const positions = approverLabels.map(
    (_, index) => (pageWidth * (index + 1)) / (approverLabels.length + 1),
  );

  approverLabels.forEach((label, index) => {
    doc.text(label, positions[index], footerY + 5.5, { align: "center" });
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const lineY = footerY - 7;

  approverIndexes.forEach((approverIndex, index) => {
    const name = names[approverIndex] || "";
    const role = approvers[approverIndex]?.toLowerCase() || "";

    const lastApprover = approvals[approvals.length - 1];
    const lastRole = lastApprover?.role?.toLowerCase() ?? "";
    const currentRoleIndex = flowRoles.indexOf(lastRole);
    const roleIndex = flowRoles.indexOf(role);

    const status =
      approvals.findLast((a) => a.role?.toLowerCase() === role)?.status ?? "--";
    const formattedstatus = status.charAt(0).toUpperCase() + status.slice(1);
    const isRejected = approvals.some(
      (a) => a.status?.toLowerCase() === "rejected",
    );

    const nextPending = !isRejected
      ? nextRole(lastRole, data.category, data.project_code)
      : null;

    const isFutureReviewRole =
      isReviewStatus && currentRoleIndex >= 0 && roleIndex > currentRoleIndex;

    const displayStatus = isFutureReviewRole
      ? "--"
      : nextPending && role === nextPending.toLowerCase()
        ? "(Pending)"
        : formattedstatus;

    let color = [128, 128, 128];
    if (status.toLowerCase() === "approved") color = [0, 128, 0];
    else if (status.toLowerCase() === "rejected") color = [200, 0, 0];
    if (displayStatus.toLowerCase() === "(pending)") color = [255, 165, 0];

    const posX = positions[index];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.line(posX - 20, lineY, posX + 20, lineY);
    doc.text(displayStatus, posX, lineY - 4, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(name, posX, footerY, { align: "center" });
  });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `This Statement is Electronically Approved; Signature Not Required `,
    60,
    pageHeight - footerPadding,
  );

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
};
