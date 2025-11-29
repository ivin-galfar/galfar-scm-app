import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AppContext } from "./Context";
import useUserInfo from "../CustomHooks/useUserInfo";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import VendorSelectionTooltip from "./VendorSelectionTooltip";
import Currency from "../Helpers/Currency";
import {
  useClearStatementTable,
  useEdit,
  useSortVendors,
  useUpdate,
} from "../store/statementStore";

export default function VerticalTable({ showcalc }) {
  const {
    sharedTableData,
    setSharedTableData,
    setHasInputActivity,
    particularname,
    newMr,
    hasInputActivity,
    selectedVendorIndex,
    setSelectedVendorIndex,
    selectedmr,
    freezequantity,
    currency,
    isMRSelected,
    selectedVendorReason,
  } = useContext(AppContext);
  const [particular, setParticular] = useState([]);
  const { cleartable, resetCleartable } = useClearStatementTable();
  const { sortvendors } = useSortVendors();
  const { isEdit } = useEdit();
  const { isupdated } = useUpdate();

  useEffect(() => {
    if (sharedTableData.formData.sentforapproval !== "pending") {
      setSelectedVendorIndex(sharedTableData.formData.selectedvendorindex ?? 0);
    }
  }, [sharedTableData.formData.selectedvendorindex, selectedmr]);
  const currencysymbol = Currency(sharedTableData.formData.currency || "");

  const fetchParticular = async (particularname) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get(
        `${REACT_SERVER_URL}/particulars/${particularname}`,
        config
      );
      setParticular(response.data.particular.particulars);
    } catch (error) {
      setParticular([]);
    }
  };

  useEffect(() => {
    if (particularname?.length === 0) {
      return;
    }
    fetchParticular(particularname);
  }, [particularname]);

  useEffect(() => {
    if (Array.isArray(particular) && particular.length > 0) {
      const newTableData = createData();
      setTableData(newTableData);
      setSharedTableData((prev) => ({ ...prev, tableData: newTableData }));
    } else {
      setTableData([]);
      setSharedTableData((prev) =>
        prev.tableData.length > 0
          ? { ...prev, formData: {}, tableData: [] }
          : prev
      );
    }
  }, [particular]);
  const rawData = [
    { id: 1, company: "" },
    { id: 2, company: "" },
    { id: 3, company: "" },
    { id: 4, company: "" },
  ];
  const createData = () =>
    particular.map((descRow, idx) => {
      const row = {
        id: `row_${idx}`,
        sl: 1,
        particulars: descRow,
        vendors: {},
      };
      rawData.forEach((_, vIdx) => {
        row.vendors[`vendor_${vIdx}`] = "";
      });
      return row;
    });
  const shouldSkipRow = (particulars) => {
    const skipLabels = [
      "NET PRICE",
      "RATING",
      "REMARKS",
      "COMPANY NAME",
      "NOTE",
      "VENDOR NAME",
      "NAME",
      "ICV SCORE",
    ];
    return skipLabels.includes(particulars?.trim().toUpperCase());
  };
  const columnHelper = createColumnHelper();
  const [tableData, setTableData] = useState(() =>
    sharedTableData?.tableData?.length
      ? sharedTableData.tableData
      : createData()
  );

  const userInfo = useUserInfo();
  const [vatRate] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (sharedTableData?.tableData?.length) {
      setTableData(sharedTableData.tableData);
    }
  }, [sharedTableData.tableData]);

  //may create infinite renders, monitor this
  useEffect(() => {
    if (cleartable && !isMRSelected) {
      const clearedTableData = tableData.map((row) => ({
        ...row,
        vendors: Object.fromEntries(
          Object.keys(row.vendors).map((key) => [key, ""])
        ),
      }));
      setTableData(clearedTableData);
      resetCleartable();
    }
  }, [cleartable, tableData]);

  const vendorInfoWithTotal = useMemo(() => {
    const vendors = rawData.map((vendor, vIdx) => ({
      ...vendor,
      total: tableData.reduce((sum, row) => {
        if (shouldSkipRow(row.particulars)) return sum;
        const value = parseFloat(row.vendors?.[`vendor_${vIdx}`] || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0),
      index: vIdx,
    }));

    if (
      sortvendors &&
      sharedTableData.formData?.status !== "review" &&
      sharedTableData.formData.receiptupdated == null
    ) {
      const positiveVendors = vendors.filter((v) => v.total > 0);

      const sortedPositive = positiveVendors
        .slice()
        .sort((a, b) => a.total - b.total);

      return [...sortedPositive];
    } else {
      return vendors;
    }
  }, [tableData, sortvendors, sharedTableData.formData.qty, selectedmr]);

  const vatRowIndex = tableData.findIndex(
    (row) => row.particulars.trim().toUpperCase() === "VAT @5%"
  );

  const vendorTotals = vendorInfoWithTotal.map((vendor) => {
    return (
      tableData.reduce((sum, row, idx) => {
        if (shouldSkipRow(row.particulars)) return sum;
        if (idx >= vatRowIndex && vatRowIndex !== -1) return sum;
        if (row.isRating) return sum;
        const value = parseFloat(row.vendors?.[`vendor_${vendor.index}`] || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0) * Number(sharedTableData.formData.qty || 1)
    );
  });
  useEffect(() => {
    if (vendorTotals.some((val) => val > 0) && selectedVendorIndex === null) {
      setSelectedVendorIndex(0);
    }
  }, [vendorTotals]);
  const columns = useMemo(() => {
    const descriptionColumns = [
      columnHelper.accessor("sl", {
        header: "Sl. No.",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("particulars", {
        header: "Particulars",
        cell: (info) => info.getValue(),
      }),
    ];

    const vendorColumns = vendorInfoWithTotal.map((vendor, index) => {
      const vendorKey = `vendor_${vendor.index}`;
      return {
        id: vendorKey,
        header: () => null,
        accessorFn: (row) => row.vendors?.[vendorKey] || "",
        cell: ({ row, getValue }) => {
          const value = getValue() || "";
          const isAvailability =
            row.original.particulars.trim().toUpperCase() === "AVAILABILITY";
          const isCompanyname =
            row.original.particulars.trim().toUpperCase() === "VENDOR NAME";
          const isRemarks =
            row.original.particulars.trim().toUpperCase() === "REMARKS";
          const isRecommendation =
            row.original.particulars.trim() === "Recommendation (If Any)";
          const getPlaceholder = () => {
            if (isCompanyname) return "Vendor name";
            if (isRemarks) return "--Remarks--";
            if (isRecommendation) return "-Add Reason-";
          };
          const isReadOnly = !userInfo?.is_admin;
          if (isAvailability) {
            if (!userInfo?.is_admin) {
              return <div className="text-center">{value || "-"}</div>;
            }
            return (
              <select
                value={value || ""}
                onChange={(e) =>
                  handleInputChange(row.index, vendorKey, e.target.value)
                }
                disabled={isReadOnly}
                className={`w-full px-2 py-1 ${
                  isReadOnly
                    ? "cursor-not-allowed bg-gray-200"
                    : "border rounded bg-gray-100"
                }`}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            );
          }

          return (
            <>
              {isReadOnly ? (
                <div
                  className={`max-w-2xl px-2 py-1 text-center break-words whitespace-normal ${isCompanyname ? "font-bold" : ""}`}
                  style={{ maxWidth: "150px" }}
                >
                  {value}
                </div>
              ) : (
                <input
                  key={`${row.id}_${vendorKey}`}
                  type="text"
                  value={value}
                  placeholder={getPlaceholder()}
                  disabled={
                    (freezequantity &&
                      !isEdit &&
                      sharedTableData.formData.status != "review") ||
                    (sharedTableData.formData.status == null && isupdated)
                  }
                  onChange={(e) =>
                    handleInputChange(row.index, vendorKey, e.target.value)
                  }
                  className={`w-full px-2 py-1 text-center  font-semibold border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder:text-gray-400`}
                  aria-label={
                    isCompanyname
                      ? "Vendor name"
                      : isRemarks
                        ? "Remarks"
                        : "Input"
                  }
                />
              )}
            </>
          );
        },
      };
    });

    return [
      {
        header: "Description",
        columns: descriptionColumns,
      },
      ...vendorColumns,
    ];
  }, [
    userInfo?.is_admin,
    sortvendors,
    selectedmr == "default" ||
    selectedmr == "" ||
    selectedmr === null ||
    isEdit ||
    sharedTableData.formData?.status == "review" ||
    sharedTableData.formData?.status == null
      ? ""
      : vendorInfoWithTotal,
  ]);
  const vendorVATs = useMemo(() => {
    if (
      !Array.isArray(vendorInfoWithTotal) ||
      vendorInfoWithTotal.length === 0 ||
      (newMr && !hasInputActivity)
    ) {
      return Array(vendorInfoWithTotal.length).fill(0);
    }

    return vendorInfoWithTotal.map((vendor) => {
      const total = parseFloat(vendor.total || 0);
      const vat = ((total * vatRate) / 100) * sharedTableData.formData.qty;
      return isNaN(vat) ? 0 : vat;
    });
  }, [vendorInfoWithTotal, vatRate, newMr, hasInputActivity]);

  const vendorNetPrices = vendorTotals.map(
    (total, idx) => total + vendorVATs[idx]
  );

  const handleInputChange = (rowIndex, vendorKey, newValue) => {
    setTableData((prevData) => {
      const updated = [...prevData];
      updated[rowIndex] = {
        ...updated[rowIndex],
        vendors: {
          ...updated[rowIndex].vendors,
          [vendorKey]: newValue,
        },
      };
      const hasInput = updated.some((row) =>
        Object.values(row.vendors).some((val) => val && val.trim() !== "")
      );
      setHasInputActivity(hasInput);
      setSharedTableData((prev) => ({ ...prev, tableData: updated }));
      return updated;
    });
  };

  useEffect(() => {
    const hasInput = tableData.some((row) =>
      Object.values(row.vendors).some((val) => val && val.trim() !== "")
    );
    setHasInputActivity(hasInput);
  }, [tableData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const ranks = [...vendorNetPrices]
    .map((v, i) => ({ value: v, index: i }))
    .filter((item) => item.value > 0)
    .sort((a, b) => a.value - b.value)
    .map((item, rank) => ({ ...item, rank: rank + 1 }));
  const l1Vendor = ranks.find((r) => r.rank === 1);
  const l1Index = l1Vendor ? l1Vendor.index : null;
  if (l1Index !== null && sharedTableData.formData.sentforapproval == null) {
    setSelectedVendorIndex(l1Index);
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="table border-collapse border border-gray-300 w-4xl text-sm">
        <thead className="text-center bg-gray-100">
          <tr>
            <th colSpan={2} className="border px-4 py-2 align-bottom w-64">
              Description
            </th>
            {vendorInfoWithTotal.map((vendor) => (
              <th key={vendor.id} className="border px-4 py-2 w-40">
                <div className="flex flex-col items-center">
                  <span className="font-medium">Vendor {vendor.id}</span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="border px-4 py-2 w-20 whitespace-nowrap">Sl. No.</th>
            <th className="border px-4 py-2 w-96 whitespace-nowrap">
              Particulars
            </th>

            {vendorInfoWithTotal.map((vendor) => (
              <th
                key={vendor.id}
                className="border px-4 py-2 text-xs text-gray-600 w-40"
              >
                <div className="flex justify-center gap-1">
                  <span>UNIT PRICE</span>
                  <span className="text-xs font-medium w-4 text-gray-500">
                    {currencysymbol}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => {
            const isTotalRow =
              row.original.particulars.trim().toUpperCase() === "NET PRICE";
            const cells = row.getVisibleCells();
            return (
              <tr key={row.id}>
                {rowIndex === 0 && (
                  <td
                    rowSpan={table.getRowModel().rows.length}
                    className="border px-4 py-2 align-top text-center font-semibold"
                  >
                    1
                  </td>
                )}

                {cells
                  .filter((cell) => cell.column.id !== "sl")
                  .map((cell, colIndex) => {
                    const isVendorColumn =
                      cell.column.id?.startsWith("vendor_");
                    const vendorIndex = vendorInfoWithTotal.findIndex(
                      (v) => `vendor_${v.index}` === cell.column.id
                    );

                    return (
                      <td
                        key={cell.id}
                        className={`border px-4 py-2 align-top whitespace-nowrap  ${
                          isTotalRow ? "bg-yellow-100" : ""
                        }`}
                      >
                        {isTotalRow && isVendorColumn
                          ? vendorTotals[vendorIndex]?.toFixed(2)
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                      </td>
                    );
                  })}
              </tr>
            );
          })}
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold bg-yellow-50  text-center gap-2"
            >
              Total Price (Excl. VAT)
              {sharedTableData.formData?.currency && (
                <span className="ml-2  text-xs tracking-wide font-medium text-gray-500 align-middle">
                  ({sharedTableData.formData.currency})
                </span>
              )}
            </td>
            {vendorTotals.map((val, idx) => (
              <td
                key={`total_${idx}`}
                className="border px-4 py-2 font-semibold text-center bg-yellow-100"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              VAT @5%
            </td>
            {vendorVATs.map((val, idx) => (
              <td
                key={`vat_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>

          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              Net Price (Incl. VAT)
              {sharedTableData.formData?.currency && (
                <span className="ml-2  text-xs tracking-wide font-medium text-gray-500 align-middle">
                  ({sharedTableData.formData.currency})
                </span>
              )}
            </td>
            {vendorNetPrices.map((val, idx) => (
              <td
                key={`net_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              Rating
            </td>
            {vendorNetPrices.map((val, idx) => {
              const rank = ranks.find((r) => r.index === idx)?.rank;
              return (
                <td
                  key={`rating_${idx}`}
                  className="border px-4 py-2 font-semibold text-center"
                >
                  {isMRSelected && rank ? `L${rank}` : "-"}
                </td>
              );
            })}
          </tr>

          {(sharedTableData.formData.sentforapproval == "yes" ||
            sharedTableData.formData.sentforapproval == "pending" ||
            !userInfo?.is_admin ||
            sortvendors) &&
            vendorTotals.some((val) => val > 0) && (
              <tr>
                <td
                  colSpan={2}
                  className="border px-4 py-2 font-semibold bg-green-50 text-green-800 text-center"
                >
                  Selected Vendor
                </td>
                {vendorTotals.map((_, index) => (
                  <td
                    key={index}
                    className={`border px-4 py-2 text-center font-semibold ${
                      index === selectedVendorIndex
                        ? "bg-green-100 text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    <label
                      className={`relative group inline-block select-none ${
                        sharedTableData.formData.sentforapproval === "yes" &&
                        sharedTableData.formData?.status !== "review" &&
                        sharedTableData.formData?.status !== "reverted"
                          ? "cursor-auto"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedVendor"
                        checked={selectedVendorIndex === index}
                        onChange={() => {
                          if (
                            sharedTableData.formData.sentforapproval !==
                              "yes" ||
                            sharedTableData.formData?.status === "review" ||
                            sharedTableData.formData?.status === "reverted" ||
                            sharedTableData.formData?.status ===
                              "Pending For HOD"
                          ) {
                            setSelectedVendorIndex(index);
                          }
                        }}
                        disabled={
                          sharedTableData.formData.sentforapproval === "yes" &&
                          selectedVendorIndex !== null &&
                          sharedTableData.formData?.status !== "review" &&
                          selectedVendorIndex !== index
                        }
                        className="sr-only "
                      />
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          selectedVendorIndex === index
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700  hover:bg-gray-300"
                        } ${sharedTableData.formData.sentforapproval === "yes" && sharedTableData.formData?.status !== "review" && sharedTableData.formData?.status !== "reverted" ? "cursor-auto" : ""}`}
                      >
                        {selectedVendorIndex === index ? (
                          <span className="flex  items-center ">
                            <>Selected </>
                            {sharedTableData.formData.selectedvendorreason && (
                              <>
                                <IoMdInformationCircleOutline
                                  className="pl-2 "
                                  size={25}
                                  onClick={() => setShowTooltip(true)}
                                />
                                {showTooltip && (
                                  <VendorSelectionTooltip
                                    setShowTooltip={setShowTooltip}
                                    message={
                                      "The reason for choosing this vendor will be in Recommendation row!!"
                                    }
                                  />
                                )}
                              </>
                            )}
                          </span>
                        ) : (
                          <span
                            className={`${sharedTableData.formData.sentforapproval === "yes" && sharedTableData.formData?.status !== "review" && sharedTableData.formData?.status !== "reverted" && sharedTableData.formData?.status !== "Pending For HOD" ? "cursor-not-allowed" : ""}`}
                          >
                            Select
                          </span>
                        )}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}
