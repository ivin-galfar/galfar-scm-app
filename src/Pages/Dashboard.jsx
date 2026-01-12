import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../Components/Context";
import fetchStatments from "../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link, useLocation } from "react-router-dom";
import { FaArrowAltCircleRight, FaTrash } from "react-icons/fa";
import Alerts from "../Components/Alerts";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoPrint } from "react-icons/io5";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import galfarlogo from "../assets/Images/logo-new.png";
import { IoWarningOutline } from "react-icons/io5";
import { useToggleAsset } from "../store/assetStore";
import {
  useDeleteStatement,
  usePagination,
  usetotalReceipts,
} from "../store/statementStore";
import { useDashboardType } from "../store/logisticsStore";
import DashboardButton from "../Components/DashboardButton";
import { is_logistics, is_plant } from "../Helpers/dept_helper";
import {
  fetchReceipt,
  fetchReceiptCount,
  fetchStatement,
  loginUser,
} from "../APIs/api";
const Dashboard = () => {
  const {
    receipts,
    setReqMrno,
    setReceipts,
    setMrno,
    setAllReceipts,
    allreceipts,
    statusFilter,
    setStatusFilter,
    multiStatusFilter,
    setMultiStatusFilter,
    sharedTableData,
    setApproverDetails,
  } = useContext(AppContext);
  const { toggleasset, resetasset } = useToggleAsset();
  const [approversFetched, setApproversFetched] = useState(false);
  const { deleted, resetDeleted, setDeleted } = useDeleteStatement();
  const [searchcs, setSearchCS] = useState("");
  const userInfo = useUserInfo();
  const { dashboardType, setDashboardType, resetDashboardType } =
    useDashboardType();
  const { pagination, setPageIndex, setPageSize } = usePagination();

  const isLogistics = is_logistics(userInfo?.dept_code);
  const location = useLocation();
  const { receiptscount, setReceiptsCount } = usetotalReceipts();
  const isPlant = is_plant(userInfo?.dept_code);
  const statusProgress = {
    "Pending For HOD": 20,
    "Pending for GM": 40,
    "Pending for CEO": 60,
    Approved: 100,
    Rejected: 100,
    "": 0,
  };

  const statusMapping = {
    inita: [
      "Pending for HOD",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
      "Rejected",
      "review",
      "reverted",
      "",
    ],
    inith: [
      "Pending for HOD",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
      "Rejected",
      "review",
      "reverted",
      "",
    ],
    hod: [
      "Pending For HOD",
      "Pending For GM",
      "Pending For CEO",
      "review",
      "Rejected",
      "Approved",
    ],
    gm: [
      "Pending For HOD",
      "Pending for GM",
      "Pending for CEO",
      "review",
      "Approved",
      "Rejected",
    ],
    ceo: [
      "Pending For HOD",
      "Pending for GM",
      "Pending for CEO",
      "review",
      "Approved",
      "Rejected",
    ],
  };

  const [triggerdelete, setTriggerdelete] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [deleteMr, setdeleteMr] = useState("");
  const expectedStatuses = (statusMapping[userInfo?.role] || []).map((s) =>
    s.toLowerCase()
  );

  const pendingStatuses = !userInfo?.is_admin
    ? expectedStatuses.filter(
        (s) =>
          s.startsWith("pending") && s.includes(userInfo?.role.toLowerCase())
      )
    : expectedStatuses.filter((s) => s.startsWith("pending"));

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { filteredReceipts, reqMrValues, categorizedReceipts, mrValues } =
          await fetchStatments({
            expectedStatuses,
            userInfo,
            module: location.pathname,
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            status: statusFilter,
            multiStatus: multiStatusFilter,
            search: searchcs,
          });

        const totalcount = await fetchReceiptCount({
          expectedStatuses,
          userInfo,
          status: statusFilter,
          multiStatus: multiStatusFilter,
          searchcs: searchcs,
        });

        setReceiptsCount(totalcount.receipts_count);
        setAllReceipts(filteredReceipts);
        setReqMrno(reqMrValues);
        setReceipts(categorizedReceipts);
        setMrno(mrValues);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };

    fetchReceipts();
  }, [
    deleted,
    pagination.pageSize,
    pagination.pageIndex,
    statusFilter,
    multiStatusFilter,
    searchcs,
  ]);

  // useEffect(() => {
  //   if (!Array.isArray(allreceipts) || allreceipts.length === 0) return;
  //   if (!userInfo?.token) return;

  //   const needsEnrichment = allreceipts.some((r) => {
  //     const details = r.formData?.approverdetails;
  //     return !Array.isArray(details) || details.length === 0;
  //   });

  //   if (!needsEnrichment) return;

  //   const fetchApproversComments = async () => {
  //     try {
  //       const settledResults = await Promise.allSettled(
  //         allreceipts.map(async (receipt) => {
  //           if (receipt?.formData?.comments_count > 0) {
  //             try {
  //               const config = {
  //                 headers: {
  //                   "Content-Type": "application/json",
  //                   Authorization: `Bearer ${userInfo.token}`,
  //                 },
  //               };
  //               const res = await axios.get(
  //                 `${REACT_SERVER_URL}/receipts/approverdetails/${receipt.formData.id}`,
  //                 config
  //               );
  //               return {
  //                 ...receipt,
  //                 formData: {
  //                   ...receipt.formData,
  //                   approverdetails: res.data || [],
  //                 },
  //               };
  //             } catch (err) {
  //               console.error(
  //                 `Error fetching approver for ${receipt.formData.id}`,
  //                 err
  //               );
  //               return {
  //                 ...receipt,
  //                 formData: { ...receipt.formData, approverdetails: [] },
  //               };
  //             }
  //           }
  //           return {
  //             ...receipt,
  //             formData: { ...receipt.formData, approverdetails: [] },
  //           };
  //         })
  //       );
  //       console.log(settledResults.map((res, i) => res));

  //       const enrichedReceipts = settledResults.map((res, i) =>
  //         res.status === "fulfilled"
  //           ? res.value
  //           : {
  //               ...allreceipts[i],
  //               formData: { ...allreceipts[i].formData, approverdetails: [] },
  //             }
  //       );
  //       setAllReceipts(enrichedReceipts);
  //       setReceipts((prevReceipts) =>
  //         prevReceipts.map((r) => {
  //           const enriched = enrichedReceipts.find(
  //             (er) => er?.formData?.id === r?.formData?.id
  //           );
  //           return {
  //             ...r,
  //             formData: {
  //               ...r.formData,
  //               approverdetails: enriched?.formData?.approverdetails || [],
  //             },
  //           };
  //         })
  //       );
  //       setApproverDetails(enrichedReceipts);
  //       setApproversFetched(true);
  //     } catch (err) {
  //       console.error("Error enriching receipts:", err);
  //     }
  //   };

  //   fetchApproversComments();
  // }, [
  //   statusFilter,
  //   userInfo,
  //   approversFetched,
  //   !approversFetched ? allreceipts : "",
  // ]);

  const handleDelete = async (mr) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        `${REACT_SERVER_URL}/receipts/${mr}`,
        {},
        config
      );
      setShowToast(true);
      setErrormessage("");
      setDeleted();
      setTriggerdelete(false);
      setTimeout(() => {
        setShowToast(false);
        resetDeleted();
      }, 1500);
    } catch (error) {
      resetDeleted();
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
    }
  };
  const calculateTotals = (tableData, qty) => {
    if (!tableData || tableData.length === 0)
      return { totals: [], vats: [], netPrices: [] };

    const vendorCount = Object.keys(tableData[0].vendors || {}).length;
    const totals = new Array(vendorCount).fill(0);

    tableData.forEach((row, index) => {
      if (index === 0) return;
      if (
        ["RATING", "ICV SCORE"].includes(row.particulars?.trim().toUpperCase())
      )
        return;
      Object.entries(row.vendors).forEach(([_, val], vIdx) => {
        const value = parseFloat(val) || 0;
        totals[vIdx] += qty > 0 ? value * qty : value;
      });
    });

    const vatRate = sharedTableData.formData.vatRate ?? 0.05;
    const vats = totals.map((t) => parseFloat((t * vatRate).toFixed(2)));
    const netPrices = totals.map((t, idx) =>
      parseFloat((t + vats[idx]).toFixed(2))
    );

    return { totals, vats, netPrices };
  };

  const handlePrint = async (
    printcontents
    // totals,
    // vats,
    // netPrices,
    // currency
  ) => {
    const doc = new jsPDF();
    let { formData } = printcontents;

    const { formData: updatedFormData, tableData } = await fetchReceipt(
      formData.id,
      userInfo
    );
    const { totals, vats, netPrices } = calculateTotals(
      tableData,
      updatedFormData.qty
    );

    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 60;
    const logoHeight = 10;
    doc.setFontSize(14);
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 2;

    doc.addImage(galfarlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

    doc.setFontSize(12);
    if (updatedFormData.type != "asset") {
      doc.text(`COMPARATIVE STATEMENT `, 105, 22, { align: "center" });
      doc.text(` ${updatedFormData.hiringname}`, 105, 30, { align: "center" });
      doc.text(
        `(${updatedFormData?.type?.charAt(0).toUpperCase() + updatedFormData?.type?.slice(1)})`,
        105,
        updatedFormData.type == "hiring" ? 35 : 22,
        { align: "center" }
      );
    }
    if (updatedFormData.type === "asset") {
      const title = `COMPARATIVE STATEMENT - ${updatedFormData.hiringname}`;
      const subtitle = `Asset Purchase`;

      const maxWidth = 120;

      const wrappedTitle = doc.splitTextToSize(title, maxWidth);
      const wrappedSubtitle = doc.splitTextToSize(subtitle, maxWidth);

      const centerX = 105;

      const titleY = 35;
      const subtitleY = titleY + wrappedTitle.length * 7 + 1;

      doc.text(wrappedTitle, centerX, titleY, { align: "center" });
      doc.text(wrappedSubtitle, centerX, subtitleY, { align: "center" });
    }
    doc.setFontSize(10);
    if (updatedFormData.type != "asset") {
      doc.text(`Project: ${updatedFormData.projectvalue}`, 14, 52);
      doc.text(`Location: ${updatedFormData.locationvalue}`, 14, 46);
    }
    doc.text(`Quantity: ${updatedFormData.qty}`, 14, 40);
    if (updatedFormData.type != "asset") {
      doc.text(`EQUIP MR NO: ${updatedFormData.equipmrnovalue}`, 105, 42, {
        align: "center",
      });
      doc.text(`EM REF NO: ${updatedFormData.emrefnovalue}`, 105, 48, {
        align: "center",
      });
      doc.text(
        `Required date: ${new Date(updatedFormData.requireddatevalue).toLocaleDateString()}`,
        200,
        46,
        { align: "right" }
      );
      doc.text(
        `Required Duration: ${updatedFormData.requirementdurationvalue}`,
        200,
        52,
        {
          align: "right",
        }
      );
    }
    doc.text(`CS NO: ${updatedFormData.id}`, 200, 32, {
      align: "right",
    });
    doc.text(
      `Date: ${new Date(updatedFormData.datevalue).toLocaleDateString()}`,
      200,
      40,
      { align: "right" }
    );

    const activeVendorIndexes = totals
      .map((t, idx) => (t > 0 ? idx : -1))
      .filter((idx) => idx !== -1);

    const vendorNames = Object.values(tableData[0].vendors || {});
    const vendorHeaders = activeVendorIndexes.map((i) => vendorNames[i]);

    const headerRow1 = [
      { content: "Particulars", rowSpan: 2 },
      ...vendorHeaders.map((_, idx) => ({ content: `Vendor ${idx + 1}` })),
    ];
    const headerRow2 = vendorHeaders;
    const tableHead = [headerRow1, headerRow2];
    //  const vendors = Object.values(row.vendors || {});
    //     let rowvalues = [];
    //     if (row.particulars === "Recommendation (If Any)") {
    //       Object.entries(row.vendors || {}).forEach(([key, value]) => {
    //         const vendorIndex = Number(key.split("_")[1]);
    //         if (vendorIndex === updatedFormData.selectedvendorindex) {
    //           rowvalues.push(updatedFormData.selectedvendorreason);
    //         } else {
    //           rowvalues.push(value == 0 ? "--" : value);
    //         }
    //       });
    //     }
    const tableBody = tableData
      .filter((row, idx) => idx !== 0)
      .map((row, i) => {
        let rowvalues = [];
        const vendors = Object.values(row.vendors || {});

        rowvalues = activeVendorIndexes.map((i) => vendors[i] || 0);

        return [row.particulars, ...rowvalues];
      });
    const vendorRanks = activeVendorIndexes
      .map((i) => ({ index: i, value: totals[i] }))
      .filter((v) => v.value > 0)
      .sort((a, b) => a.value - b.value)
      .map((vendor, rank) => ({ ...vendor, rank: rank + 1 }));
    const getRankLabel = (i) => {
      const vendor = vendorRanks.find((v) => v.index === i);
      return vendor ? `L${vendor.rank}` : "--";
    };

    const leftMargin = 8;
    const rightMargin = 8;
    const availableWidth = pageWidth - leftMargin - rightMargin;

    const vendorCount = activeVendorIndexes.length;

    const minParticulars = 55;
    const desiredParticulars = 80;

    let particularsWidth = Math.min(
      desiredParticulars,
      Math.max(minParticulars, availableWidth - vendorCount * 22)
    );

    let vendorWidth = Math.floor(
      (availableWidth - particularsWidth) / Math.max(1, vendorCount)
    );

    const minVendorWidth = 22;
    if (vendorWidth < minVendorWidth) {
      vendorWidth = minVendorWidth;
      particularsWidth = Math.max(
        minParticulars,
        availableWidth - vendorCount * minVendorWidth
      );
    }

    const columnStyles = { 0: { cellWidth: particularsWidth } };
    for (let c = 0; c < vendorCount; c++)
      columnStyles[c + 1] = { cellWidth: vendorWidth };

    tableBody.push(
      [
        `Total (Excl. VAT) ${updatedFormData.currency ?? ""}`,
        ...activeVendorIndexes.map((i) => totals[i].toFixed(2)),
      ],
      [
        `VAT @5% ${updatedFormData.currency ?? ""}`,
        ...activeVendorIndexes.map((i) => vats[i].toFixed(2)),
      ],
      [
        `Net Price (Incl. VAT) ${updatedFormData.currency ?? ""}`,
        ...activeVendorIndexes.map((i) => netPrices[i].toFixed(2)),
      ],
      ["Rating", ...activeVendorIndexes.map((i) => getRankLabel(i))],
      [
        {
          content: "Selected",
          styles: { fontStyle: "bold" },
        },
        ...activeVendorIndexes.map((_, idx) => ({
          content: idx === updatedFormData.selectedvendorindex ? "Yes" : "--",
          styles: {
            fontStyle:
              idx === updatedFormData.selectedvendorindex ? "bold" : "normal",
            textColor:
              idx === updatedFormData.selectedvendorindex
                ? [0, 128, 0]
                : [0, 0, 0],
            fontSize: idx === updatedFormData.selectedvendorindex ? 9 : 8,
          },
        })),
      ]
      // [
      //   "Recommendation",
      //   ...activeVendorIndexes.map((_, idx) =>
      //     idx == updatedFormData.selectedvendorindex
      //       ? updatedFormData.selectedvendorreason
      //       : "--"
      //   ),
      // ]
    );
    autoTable(doc, {
      startY: 65,
      head: tableHead,
      body: tableBody,
      margin: { left: leftMargin, right: rightMargin },
      tableWidth: availableWidth,
      styles: { fontSize: 10, overflow: "linebreak", cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0 },
      columnStyles,
    });

    let startYLabel =
      doc.previousAutoTable?.finalY || doc.lastAutoTable?.finalY || 65;
    const pageHeight = doc.internal.pageSize.height;
    const labelWidth = 60;
    const spacing = 10;
    const approvalHeight = 60; // approximate space needed for approvals
    // If not enough space on current page, add a new page
    if (startYLabel + approvalHeight > pageHeight) {
      doc.addPage();
      startYLabel = 2; // top margin for new page
    }

    const roleDisplayMap = {
      hod: "Mr.Pramoj.R",
      gm: "Mr.Vijayan.C",
      ceo: "Mr.Sridhar. C",
    };
    const approvalsStatus =
      formData?.approverdetails?.reduce((acc, d) => {
        if (d.action !== "review") {
          acc[d.role] = d.action;
        }
        return acc;
      }, {}) || {};

    const rolesToShow = ["hod", "gm", "ceo"];
    rolesToShow.forEach((dbRole, index) => {
      const rawStatus = approvalsStatus[dbRole] || "--";
      const status =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
      const displayName = roleDisplayMap[dbRole] || dbRole;
      const displayRole = `(${dbRole.toUpperCase()})`;

      const labelX = 20 + index * (labelWidth + spacing);
      const labelY = startYLabel + 25;

      let textColor = [0, 0, 0];
      if (status === "Approved") {
        textColor = [0, 128, 0];
      } else if (status === "Rejected") {
        textColor = [200, 0, 0];
      } else {
        textColor = [255, 165, 0];
      }

      const offsetY = 10;
      const statusWidth = doc.getTextWidth(status);
      const roleWidth = doc.getTextWidth(displayName);

      const lineWidth = Math.max(statusWidth, roleWidth);

      const statusX = labelX + (lineWidth - statusWidth) / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.text(status, statusX, labelY + offsetY);

      doc.line(
        labelX,
        labelY + offsetY + 1.5,
        labelX + lineWidth,
        labelY + offsetY + 1.5
      );
      const roleX = labelX + (lineWidth - roleWidth) / 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(displayName, roleX, labelY + offsetY + 6);
      doc.text(displayRole, roleX + 5, labelY + offsetY + 12);
    });
    const rightText = `Generated on: ${new Date().toLocaleString()}`;
    const footerPadding = 6;
    const pageCount = doc.internal.getNumberOfPages();
    const rightWidth = doc.getTextWidth(rightText);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);

      doc.text(
        `System Generated Comparative Statement `,
        14,
        pageHeight - footerPadding
      );

      doc.text(
        rightText,
        pageWidth - rightWidth - 48,
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
  const handleSearch = (e) => {
    (setSearchCS(e.target.value),
      setStatusFilter("All"),
      setMultiStatusFilter([]));
    setPageIndex(0);
  };
  // const filteredReceiptsOnstatus = async(() => {
  //   // const respose = await;
  //   // if (!Array.isArray(allreceipts)) return [];
  //   // let filteredreceipts = receipts;
  //   // if (statusFilter !== "All" && searchcs == "") {
  //   //   if (statusFilter === "review") {
  //   //     filteredreceipts = receipts.filter(
  //   //       (r) => r.formData.status == "review"
  //   //     );
  //   //   }
  //   //   if (multiStatusFilter && multiStatusFilter.length > 0) {
  //   //     filteredreceipts = receipts.filter((r) =>
  //   //       multiStatusFilter
  //   //         .filter((status) => status !== "Approved" && status !== "Rejected")
  //   //         .map((status) => status?.toLowerCase())
  //   //         .includes(r?.formData?.status?.toLowerCase())
  //   //     );
  //   //   } else {
  //   //     filteredreceipts = receipts.filter(
  //   //       (r) =>
  //   //         r?.formData?.status?.toLowerCase() === statusFilter?.toLowerCase()
  //   //     );
  //   //   }
  //   // }
  //   // if (searchcs.trim() !== "") {
  //   //   filteredreceipts = receipts.filter((r) =>
  //   //     r.formData.id?.toString().includes(searchcs)
  //   //   );
  //   // }
  //   // return filteredreceipts;
  // }, [allreceipts, statusFilter, multiStatusFilter, searchcs]);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.formData?.id, {
      id: "mrno",
      header: "CS NO",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor(
      (row) =>
        row?.formData?.type.charAt(0).toUpperCase() +
        row?.formData?.type.slice(1),
      {
        id: "type",
        header: "Statement Type",
        cell: (info) => info.getValue() || "-",
      }
    ),

    columnHelper.accessor((row) => row?.formData?.hiringname, {
      id: "hiring.name",
      header: "Hiring/Asset Name",
      meta: { className: "w-80 max-w-xs whitespace-pre-wrap break-words" },
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData?.qty, {
      id: "quantity",
      header: "Quantity",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData?.status, {
      id: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() || "";
        const rowData = info.row.original.formData || {};
        const approverDetails = rowData.approverdetails || [];

        const rejectedby =
          approverDetails.length > 0 &&
          approverDetails
            .map((rej) => rej.rejectedby)
            .filter((r) => r && r.trim() !== "" && r !== null && r.length > 0)
            .filter((r) => r.length > 0);

        const progress = statusProgress[status] || 0;

        const progressColor =
          status === "Rejected"
            ? "bg-red-500"
            : status === "Approved"
              ? "bg-green-500"
              : status === "review"
                ? "bg-amber-500"
                : status === "Pending For HOD"
                  ? "bg-yellow-400"
                  : status === "Pending for GM"
                    ? "bg-yellow-500"
                    : status === "Pending for CEO"
                      ? "bg-yellow-600"
                      : "bg-gray-300";

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">
              {status === "review" ? (
                <>
                  <IoWarningOutline className="text-yellow-500" size={18} />
                  <span>To be Reviewed</span>
                </>
              ) : status === "Rejected" &&
                rejectedby &&
                typeof rejectedby === "string" ? (
                <span>{"Rejected By " + rejectedby.toUpperCase()}</span>
              ) : (
                <span>{status || "Not Sent For Approval"}</span>
              )}
            </span>

            <div className="relative max-w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-2 ${progressColor} rounded-full transition-all duration-500`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor(
      (row) => {
        const commentsArray = row?.formData.approverdetails
          ?.filter((item) => item.comments && item.comments.trim() !== "{}")
          ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((item) => {
            return (
              <span key={item.id} className="block">
                <span className="font-bold ">{item.role.toUpperCase()}</span>:{" "}
                {item.comments}
              </span>
            );
          });

        return commentsArray?.length > 0 ? commentsArray : "-";
      },
      {
        id: "comments",
        header: "Comments",
        meta: { className: "w-80 max-w-xs whitespace-pre-wrap break-words" },
        cell: (info) => (
          <span className="whitespace-pre-wrap">{info.getValue() || "-"}</span>
        ),
      }
    ),
  ];

  const table = useReactTable({
    data: receipts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPageSize,
    pageCount: Math.ceil(receiptscount / pagination.pageSize),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full px-5 flex-grow">
      <div className="flex border-b  border-gray-300 mb-4">
        {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
          (tab) => {
            // if (tab == "Under Review" && !userInfo?.is_admin) return null;
            const isActive =
              (tab === "All" && statusFilter === "All") ||
              (tab === "Approved" && statusFilter === "Approved") ||
              (tab === "Rejected" && statusFilter === "Rejected") ||
              (tab === "Under Review" && statusFilter === "review") ||
              (tab === "Pending" && multiStatusFilter.length > 0);

            let activeColor = "border-blue-500 text-blue-600";
            let inactiveColor =
              "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

            if (tab === "Approved") {
              activeColor = "border-green-500 text-green-600";
              inactiveColor =
                "border-transparent text-gray-500 hover:text-green-500";
            } else if (tab === "Rejected") {
              activeColor = "border-red-500 text-red-600";
              inactiveColor =
                "border-transparent text-gray-500 hover:text-red-500";
            } else if (tab === "Pending") {
              activeColor = "border-yellow-500 text-yellow-600";
              inactiveColor =
                "border-transparent text-gray-500 hover:text-yellow-500";
            } else if (tab === "Under Review") {
              activeColor = "border-cyan-500 text-cyan-600";
              inactiveColor =
                "border-transparent text-gray-500 hover:text-cyan-500";
            }

            return (
              <button
                key={tab}
                onClick={() => {
                  switch (tab) {
                    case "All":
                      setStatusFilter("All");
                      setMultiStatusFilter([]);
                      setPageIndex(0);
                      break;
                    case "Approved":
                      setStatusFilter("Approved");
                      setMultiStatusFilter([]);
                      setPageIndex(0);
                      break;
                    case "Rejected":
                      setStatusFilter("Rejected");
                      setMultiStatusFilter([]);
                      setPageIndex(0);
                      break;
                    case "Pending":
                      setStatusFilter("");
                      setMultiStatusFilter(pendingStatuses);
                      setPageIndex(0);
                      break;
                    case "Under Review":
                      setStatusFilter("review");
                      setMultiStatusFilter([]);
                      setPageIndex(0);
                      break;
                  }
                }}
                className={`px-4 py-2 -mb-px border-b-2 font-medium cursor-pointer transition-colors ${
                  isActive ? activeColor : inactiveColor
                }`}
              >
                {tab}
              </button>
            );
          }
        )}
        <div className="flex justify-between ml-auto">
          {isLogistics && isPlant && (
            <div className="flex px-4 py-2 -mb-px items-center justify-center ml-auto">
              <DashboardButton />
            </div>
          )}
          <div className="mb-1 ml-auto">
            <label className="  ml-auto text-sm font-medium text-gray-700 ">
              CS Number:
            </label>
            <input
              type="text"
              name="search"
              className="border  h-8 flex border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <div
        className="overflow-y-auto  bg-white shadow rounded border border-gray-200"
        style={{ height: `calc(93vh - 140px)` }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="top-0 z-10 sticky  bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </th>
                ))}
                <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Action
                </th>
                <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Created On
                </th>
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-gray-500"
                >
                  No Statements found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="even:bg-white odd:bg-gray-50 hover:bg-blue-100 "
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`border-b  border-gray-300 px-4 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Link
                        className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                        to={`/receipts/${row.original?.formData?.id}`}
                        onClick={() =>
                          row.original.formData.type == "hiring"
                            ? resetasset()
                            : toggleasset()
                        }
                      >
                        View <FaArrowAltCircleRight />
                      </Link>
                      <IoPrint
                        className={` ${
                          !userInfo?.is_admin
                            ? "text-gray-400 pointer-events-none cursor-not-allowed"
                            : "text-black cursor-pointer"
                        }`}
                        size={25}
                        onClick={() => {
                          // const { totals, vats, netPrices } = calculateTotals(
                          //   row.original.tableData,
                          //   row.original.formData.qty
                          // );
                          handlePrint(
                            row.original
                            // totals,
                            // vats,
                            // netPrices,
                            // row.original.formData.currency
                          );
                        }}
                      />
                      <FaTrash
                        className={`mr-1 text-red-500  ${!userInfo?.is_admin ? "hidden" : row.original.formData.status === "Approved" ? "cursor-not-allowed  opacity-50 scale-95" : "cursor-pointer"} `}
                        size={16}
                        onClick={() => {
                          if (row.original.formData.status === "Approved")
                            return;
                          setdeleteMr(row.original.formData.id);
                          setTriggerdelete(true);
                        }}
                      />
                    </div>
                  </td>
                  <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                    {new Date(
                      row.original.formData?.created_at
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={`flex justify-between`}>
          <div className="ml-2 flex items-center text-sm text-gray-700 font-medium">
            Total Number of Records: {receiptscount}
          </div>

          <div className="flex items-center gap-2 p-2 justify-end ">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 ">
              <button
                onClick={() => setPageIndex(0)}
                disabled={pagination.pageIndex == 0}
                className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 cursor-pointer ${pagination.pageIndex == 0 ? "cursor-auto" : "cursor-pointer"}`}
              >
                «
              </button>

              <button
                onClick={() => setPageIndex(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex == 0}
                className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${pagination.pageIndex != 0 ? "cursor-pointer" : ""}`}
              >
                ‹ Prev
              </button>

              <span className="text-sm px-2">
                Page{" "}
                <strong>
                  {receiptscount != 0 ? pagination.pageIndex + 1 : 0}
                </strong>{" "}
                of{" "}
                <strong>
                  {Math.ceil(receiptscount / pagination.pageSize)}
                </strong>
              </span>

              <button
                onClick={() => setPageIndex(pagination.pageIndex + 1)}
                disabled={
                  pagination.pageIndex + 1 >=
                  Math.ceil(receiptscount / pagination.pageSize)
                }
                className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
                  pagination.pageIndex + 1 >=
                  Math.ceil(receiptscount / pagination.pageSize)
                    ? "cursor-auto"
                    : "cursor-pointer"
                }`}
              >
                Next ›
              </button>

              <button
                onClick={() =>
                  setPageIndex(
                    Math.ceil(receiptscount / pagination.pageSize) - 1
                  )
                }
                disabled={
                  pagination.pageIndex ==
                  Math.max(
                    Math.ceil(receiptscount / pagination.pageSize) - 1,
                    0
                  )
                }
                className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
                  pagination.pageIndex ==
                  Math.max(
                    Math.ceil(receiptscount / pagination.pageSize) - 1,
                    0
                  )
                    ? "cursor-auto"
                    : "cursor-pointer"
                }`}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(deleteMr)}
        />
      )}
      {showToast && !errormessage && deleted && (
        <div className="z-[9999] fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Statement successfully Deleted!!
        </div>
      )}
    </div>
  );
};

export default Dashboard;
