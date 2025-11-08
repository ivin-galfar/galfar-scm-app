import jsPDF from "jspdf";
import galfarlogo from "../assets/Images/logo-new.png";
import { autoTable } from "jspdf-autotable";

export const handlePrint = (formData, tableData) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 60;
  const logoHeight = 10;
  doc.setFontSize(14);
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = 2;

  doc.addImage(galfarlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

  doc.setFontSize(12);

  doc.text(`LOGISTICS COMPARISON STATEMENT`, 105, 22, { align: "center" });

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

  const startX = 90;
  const valueXcenter = 115;
  doc.text("Supplier:", startX, 39);
  doc.text(formData.supplier, valueXcenter, 39);

  doc.text("Description:", startX, 45);
  doc.text(formData.description, valueXcenter, 45);

  doc.text("Scope of work:", startX, 51);
  doc.text(formData.scopeofwork, valueXcenter, 51);

  doc.text("Mode:", startX, 57);
  doc.text(formData.mode, valueXcenter, 57);

  const labelX = 160;
  const valueX = 175;

  doc.text("Date:", labelX, 40);
  doc.text(new Date(formData.date).toLocaleDateString(), valueX, 40);

  doc.text("Po:", labelX, 45);
  doc.text(formData.po, valueX, 45);

  doc.text("Project:", labelX, 50);
  doc.text(formData.project, valueX, 50);

  const vendorNames = Array.from(
    new Set(
      tableData?.flatMap((r) => Object.keys(r.particulars.forwarders)) || {}
    )
  );

  const headerRow1 = [
    { content: "Forwarders", rowSpan: 1 },
    ...vendorNames.map((name) => name),
  ];
  const tableBody = tableData.map((row) => {
    const forwarders = row.particulars.particulars;
    const forwarderValues = vendorNames.map(
      (name) => row.particulars.forwarders[name] || 0
    );
    return [forwarders, ...forwarderValues];
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
    startY: 80,
    head: tableHead,
    body: tableBody,
    margin: { left: 10, right: 10 },
    tableWidth: "auto",
    styles: {
      fontSize: 10,
      overflow: "linebreak",
      cellPadding: { top: 3, right: 1, bottom: 3, left: 0.5 },
      cellWidth: "wrap",
    },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    columnStyles: {
      0: { cellWidth: 60 },
    },
  });

  const startYNotes =
    doc.previousAutoTable?.finalY || doc.lastAutoTable?.finalY || 65;
  const notesX = 14;
  const notesWidth = 185;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.text("Notes:", notesX, startYNotes + 18);

  doc.setFont("helvetica", "normal");
  const notesText = formData.recommendation_reason || "";
  const splitNotes = doc.splitTextToSize(notesText, notesWidth - 4);
  doc.text(splitNotes, notesX, startYNotes + 25);

  const pageHeight = doc.internal.pageSize.height;
  const roleDisplayMap = {
    incharge: "Mr.Anoop.GP",
    pm: "Project Manager",
    gm: "Mr.Vijayan.C",
    fm: "Mr.Suraj.R",
    ceo: "Mr.Sridhar. C",
  };

  const rolesToShow = ["Incharge", "PM", "GM", "FM", "CEO"];

  const status = {};
  const currentStatus = formData.status?.toLowerCase() || "";
  let pendingIndex = -1;

  const rejectedRole = formData.rejectedby;
  if (currentStatus.startsWith("pending for")) {
    const pendingRole = currentStatus.replace("pending for ", "").trim();
    pendingIndex = rolesToShow.findIndex(
      (r) => r.toLowerCase() === pendingRole
    );
  }

  rolesToShow.forEach((role, i) => {
    if (rejectedRole) {
      const rejectedIndex = rolesToShow.findIndex(
        (r) => r.toLowerCase() === rejectedRole.toLowerCase()
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
  const offsetY = 8;

  rolesToShow.forEach((dbRole, index) => {
    const roleStatus = status[dbRole];
    if (!roleStatus) return;

    const displayName = roleDisplayMap[dbRole] || dbRole;
    const displayRole = `(${dbRole})`;

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
      approverStartY1 + offsetY + 1.5
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(
      displayName,
      centerX - nameWidth / 2,
      approverStartY1 + offsetY + 6
    );
    doc.text(
      displayRole,
      centerX - roleWidth / 2,
      approverStartY1 + offsetY + 12
    );
  });

  const footerPadding = 6;
  const pageCount = doc.internal.getNumberOfPages();
  const extraSpacing = 10;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);

    doc.text(
      `System Generated Comparative Statement `,
      14,
      pageHeight - footerPadding - extraSpacing
    );

    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      14,
      pageHeight - footerPadding
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - footerPadding,
      {
        align: "right",
      }
    );

    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
  }
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
};
