import { useEffect, useState } from "react";
import {
  usecolumns,
  useFreeze,
  useIsEditing,
  useNewStatement,
  useParticularValues,
  useSelectCS,
  useSelectCSValue,
  useStatement,
} from "../store/logisticsStore";
import { EmailAlert, feedlgstatement } from "../APIs/api";
import { useMutation } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { MdOutlineErrorOutline } from "react-icons/md";
import { SiTicktick } from "react-icons/si";
import Alerts from "./Alerts";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { expectedstatus } from "../Helpers/statusfinder";
import { useNavigate, useParams } from "react-router-dom";
import ApproveModallog from "./ApproveModallog";
import { handleRemoveFile } from "../Helpers/helperfunctions";
import { is_logistics } from "../Helpers/dept_helper";

const LogisticsTable = () => {
  // const [columns, setColumns] = useState(["Forwarder"]);
  const { columns, setColumns, resetcolumns } = usecolumns();
  const [newVendor, setNewVendor] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { csselected, resetCsSelected } = useSelectCS();
  const { setCsSelectedval } = useSelectCSValue();
  // const [reqapproval, setReqApproval] = useState(false);
  const [showmodal, setShowmodal] = useState(false);
  const userInfo = useUserInfo();
  const [columnvalues, setColumnvalues] = useState([]);
  const { particularvalue } = useParticularValues();
  const { newstatement, resetnewStatement, setNewStatement } =
    useNewStatement();
  const { isEditing } = useIsEditing();
  const dept = is_logistics ? "logistics" : "";

  const { tableData, formData, setFormData, resetData, setTableData } =
    useStatement();
  const { setErrorMessage, errormessage, clearErrorMessage } =
    useErrorMessage();
  const { cs_no } = useParams();
  const navigate = useNavigate();
  const { isFreeze } = useFreeze();

  // const [selectedVendor, setSelectedVendor] = useState(0);
  // const { selectedindex, setSelectedIndex } = useSelectedIndex();
  const { mutate: feedstatement, isPending: isLoading } = useMutation({
    mutationFn: feedlgstatement,
    onSuccess: (data) => {
      // setShowToast();
      setShowmodal(true);
      // setCsSelectedval(data.data.receipts.id);
      // clearErrorMessage();
      // setTimeout(() => {
      //   resetshowtoast();
      // }, 1500);
      // resetCsSelected();
      // resetData();
      // setColumns(["Forwarder"]);
      resetnewStatement();
      // resetcolumns();
      // console.log(data.data.receipts.id);

      navigate(`/lstatements/${data.data.receipts.id}`, { replace: true });
    },
    onError: (error) => {
      const message = error?.response?.data.message || error.message;
      setShowToast();
      setShowmodal(false);
      setErrorMessage(message);
    },
  });

  const handleSubmit = () => {
    const requiredFields = {
      cargo_details: "Cargo Details",
      gross_weight: "Gross Weight",
      chargeable_weight: "Chargeable Weight",
      description: "Description",
      supplier: "Supplier",
      scopeofwork: "Scope of Work",
      mode: "Mode",
      shipment_no: "Shipment Number",
      date: "Date",
      po: "PO Number",
      project: "Project",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (key === "shipment_no") {
        const parsed = Number(formData[key]);
        if (!Number.isInteger(parsed)) {
          setShowToast(true);
          setErrorMessage(`${label} must be an integer!`);
          setTimeout(() => {
            resetshowtoast();
            clearErrorMessage();
          }, 1000);
          return;
        }
      }
      if (
        !formData[key] ||
        (typeof formData[key] === "string" && formData[key].trim() === "")
      ) {
        setShowToast(true);
        setErrorMessage(`${label} is required!`);
        setTimeout(() => {
          resetshowtoast();
          clearErrorMessage();
          setNewStatement();
          setShowmodal(false);
        }, 1000);
        return;
      }
    }

    const updatedFormData = {
      ...formData,
      status: "created",
      sentforapproval: true,
    };

    setFormData(updatedFormData);
    feedstatement({ formData: updatedFormData, tableData, userInfo });
    setShowToast();
    setTimeout(() => {
      setShowmodal(false);
      resetshowtoast();
    }, 1500);

    // resetData();
  };
  const addColumn = () => {
    setSubmitted(true);
    if (newVendor.trim() == "") return;
    setColumns([...columns, newVendor.trim()]);
    setNewVendor("");
    setSubmitted(false);
  };
  const getIndex = (id) => id?.split("_")[1];
  const handleChange = (rowIndex, colIndex, value, particular, column) => {
    setTableData((prev) => {
      const exists = prev.some(
        (row) => getIndex(row.r_id) === getIndex(rowIndex)
      );
      if (exists) {
        return prev.map((row) =>
          row.r_id === rowIndex
            ? {
                ...row,
                particulars: particular,
                forwarders: { ...row.forwarders, [column]: value },
              }
            : row
        );
      } else {
        return [
          ...prev,
          {
            r_id: rowIndex,
            particulars: particular,
            forwarders: { [column]: value },
          },
        ];
      }
    });
  };

  useEffect(() => {
    if ((csselected && !newstatement) || cs_no) {
      const fetchedColumns = tableData?.map((t) => t.forwarders ?? {});

      const columnNames =
        fetchedColumns?.length > 0
          ? [
              ...new Set(
                fetchedColumns.flatMap((obj) => Object.keys(obj ?? {}))
              ),
            ]
          : [];

      setColumns(["Forwarder", ...columnNames]);
      // const columnValues =
      //   fetchedColumns.length > 0
      //     ? fetchedColumns.map((obj) => Object.values(obj))
      //     : [];

      // setColumnvalues(columnValues);
    }
  }, [tableData]);
  const removeColumn = (column, index) => {
    const updatedColumns = columns.filter((col) => col != column);
    setColumns(updatedColumns);

    const updatedTableData = tableData.map((row) => {
      const { [column]: _, ...remainingForwarders } = row.forwarders;
      return {
        ...row,
        forwarders: remainingForwarders,
      };
    });

    setTableData(updatedTableData);
  };

  const updateStatement = async (
    cs_id,
    updatedstatus,
    sentforapproval,
    selected_vendor_index,
    recommendation_reason
  ) => {
    const updatedFormData = {
      ...formData,
      status: updatedstatus,
      sentforapproval: sentforapproval,
      selected_vendor_index: selected_vendor_index,
      recommendation_reason: recommendation_reason,
    };
    try {
      setShowmodal(true);
      setShowToast();
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        `${REACT_SERVER_URL}/logistics/updatestatement/${cs_id}`,
        {
          updatedstatus,
          sentforapproval,
          selected_vendor_index,
          recommendation_reason,
        },
        config
      );

      clearErrorMessage();
      setFormData(updatedFormData);
      setTimeout(() => {
        setShowmodal(false);
        resetshowtoast();
      }, 1500);
    } catch (error) {
      const message = error?.response?.data || error.message;

      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        setShowmodal(false);
        clearErrorMessage();
      }, 1000);
      return;
    }

    try {
      const email_response = await EmailAlert(
        cs_id,
        userInfo,
        dept,
        updatedFormData
      );
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";

      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        setShowmodal(false);
      }, 1000);
      return;
    }
  };

  const changestatus = expectedstatus(userInfo.role.toLowerCase());

  const nextstatus = formData?.status?.includes(userInfo.role.toLowerCase())
    ? "Approve/Reject"
    : formData?.status == "created"
      ? "Sent for Approval"
      : formData?.status || "";

  const isentforapproval = formData.sentforapproval;
  // const status = formData.status == "created" ? "Created" : changestatus;
  const buttontxt = isentforapproval
    ? nextstatus
    : formData.status == "created"
      ? "Sent for Approval"
      : "";
  const buttonclass =
    (buttontxt?.toLowerCase().includes("pending") &&
      nextstatus != "Approve/Reject") ||
    buttontxt == "approved" ||
    buttontxt == "rejected"
      ? "px-10 py-2  bg-gray-400 cursor-not-allowed"
      : buttontxt != ""
        ? "px-10 py-2 bg-blue-600  hover:bg-blue-700 cursor-pointer"
        : "";
  const isDisabled =
    buttonclass.includes("bg-gray-400") || buttontxt == "approved";

  return (
    <div className=" ">
      {showtoast &&
        showmodal &&
        !errormessage &&
        formData.status == "pending for incharge" && (
          <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
            <SiTicktick /> Sent for approval Successfully!
          </div>
        )}
      {showtoast &&
        !errormessage &&
        showmodal &&
        formData.status == "created" && (
          <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
            <SiTicktick /> Statement Created successfully!
          </div>
        )}
      {showtoast && !errormessage && formData.edited_count > 0 && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <SiTicktick /> Statement Edited successfully!
        </div>
      )}

      {showtoast && errormessage && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <MdOutlineErrorOutline /> {errormessage}
        </div>
      )}
      {newstatement && (
        <div className="flex gap-2 mb-2 text-center items-center">
          <div className="flex flex-col  w-64">
            <input
              type="text"
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              placeholder="Enter the forwarder name"
              className="border rounded-lg px-3 py-2 w-full"
            />
            <span className="text-red-500 text-xs text-start h-2">
              {submitted && newVendor.trim() === ""
                ? "Enter the Forwarder Name"
                : ""}
            </span>{" "}
          </div>
          <button
            onClick={addColumn}
            className=" px-2 py-1  bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            + Add Vendor
          </button>
        </div>
      )}
      <div className="flex w-full gap-10">
        {" "}
        <table
          className={`table border border-gray-300 ${
            columns.length > 1 ? "w-3/4" : "w-1/3"
          } overflow-x-auto max-w-full text-sm`}
        >
          <thead className="text-center bg-gray-100">
            {columns.length > 2 && (
              <tr className="text-center font-semibold border border-gray-300 rounded-lg bg-white shadow-sm">
                <td className="px-4 py-2"></td>
                {columns.slice(1).map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 border-l text-center font-semibold bg-blue-50"
                  >
                    L{colIndex + 1}
                  </td>
                ))}
              </tr>
            )}
            <tr className="border-b">
              {columns.map((column, index) => (
                <th key={index} className="p-2 relative justify-between ">
                  {column}
                  <span
                    className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 ${(!newstatement || column == "Forwarder") && "invisible"}`}
                    onClick={() => removeColumn(column, index)}
                  >
                    X
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {particularvalue.map((particular, index) => {
              const rowIndex = `row_${index}`;
              return (
                <tr key={index} className="border-b text-center">
                  <td className="px-4 py-2">{particular}</td>
                  {columns.slice(1).map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border-l">
                      {userInfo.is_admin ? (
                        <input
                          type="text"
                          disabled={formData.sentforapproval || isFreeze}
                          value={
                            tableData.find((r) => r?.r_id === rowIndex)
                              ?.forwarders?.[column] ?? ""
                          }
                          className={`w-1/2 px-2 py-1 text-center  font-semibold border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder:text-gray-400`}
                          onChange={(e) =>
                            handleChange(
                              rowIndex,
                              colIndex,
                              e.target.value,
                              particular,
                              column
                            )
                          }
                        />
                      ) : (
                        <>
                          {" "}
                          <div className="max-w-2xl px-2 py-1 text-center break-words whitespace-normal ">
                            {tableData.find((r) => r?.r_id === rowIndex)
                              ?.forwarders?.[column] ?? "-"}
                          </div>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr className="text-center bg-gray-50 font-semibold">
              <td
                className={`border px-4 py-2 font-semibold bg-green-50 text-green-800 text-center ${columns.length < 2 ? "invisible" : ""}`}
              >
                Selected Vendor
              </td>

              {columns.slice(1).map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-2 border-l border-t">
                  <label
                    className={`flex flex-col items-center gap-2 ${(!formData.sentforapproval && isEditing) || !formData.status?.includes("pending") ? "cursor-pointer" : "cursor-auto"} `}
                  >
                    <input
                      type="radio"
                      name="selectedVendor"
                      value={column}
                      checked={formData.selected_vendor_index === colIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selected_vendor_index: colIndex,
                        })
                      }
                      disabled={formData.sentforapproval && isFreeze}
                      className="accent-green-600 w-4 h-4 sr-only"
                    />

                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border shadow-sm transition-colors duration-200 ${
                        formData.selected_vendor_index === colIndex
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      {formData.selected_vendor_index === colIndex
                        ? "✅ Selected"
                        : "⭕ Select"}
                    </span>
                  </label>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {formData?.file?.length > 0 && (
          <div className="w-1/3 p-4 bg-gray-50 rounded-xl shadow-inner overflow-y-auto max-h-[40vh]">
            <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
              Uploaded Files{" "}
              {formData?.filename?.length > 0
                ? `(${formData?.filename?.length})`
                : ""}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {formData?.file || formData?.filename?.length > 0 ? (
                formData?.filename?.map((file, index) => {
                  const url = formData.file?.[index];
                  return (
                    <div
                      key={index}
                      className="relative flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
                    >
                      <button
                        onClick={() =>
                          handleRemoveFile(index, formData, setFormData)
                        }
                        disabled={formData?.created_at != ""}
                        className={`absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs font-bold ${formData?.created_at != "" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        title="Remove file"
                      >
                        ✕
                      </button>

                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                        📄
                      </div>

                      <p className="text-xs mt-2 text-gray-600 text-center truncate w-full">
                        {file}
                      </p>

                      <a
                        href={url}
                        target="_blank"
                        download
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Download
                      </a>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-gray-500 text-sm">
                  No files uploaded yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {particularvalue.length > 0 && (
        <div className="mt-10 p-2  max-w-xl">
          <label
            htmlFor="notes"
            className="block text-lg font-semibold text-gray-700 mb-2"
          >
            Notes:
          </label>
          <textarea
            id="notes"
            className=" w-full border h-32 border-gray-300 focus:ring-2 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="Add your notes here..."
            onChange={(e) =>
              setFormData({
                ...formData,
                recommendation_reason: e.target.value,
              })
            }
            value={formData.recommendation_reason}
            disabled={formData.sentforapproval && isFreeze}
          />
        </div>
      )}

      {newstatement &&
        formData.status !== "created" &&
        (formData.project != "" || formData.po != "") && (
          <div className="flex justify-end p-5 gap-4">
            <button
              type="submit"
              className="flex items-center font-semibold px-10 py-2 bg-blue-600 text-white rounded  shadow cursor-pointer"
              onClick={() => setShowmodal(true)}
            >
              Create
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
            </button>
            <button
              type="submit"
              className="flex items-center font-semibold px-10 py-2 bg-blue-600 text-white rounded  shadow cursor-pointer "
              onClick={() => resetnewStatement()}
            >
              Reset
            </button>
          </div>
        )}

      <div className="flex justify-end p-5 gap-4">
        <button
          type="submit"
          className={`flex items-center font-semibold ${isEditing ? "invisible" : ""} text-white rounded  shadow  ${buttonclass}`}
          onClick={() => setShowmodal(true)}
          disabled={isDisabled}
        >
          {buttontxt
            .split(" ")
            .map((txt) => txt.charAt(0).toUpperCase() + txt.slice(1))
            .join(" ")}
        </button>
      </div>

      {showmodal && userInfo.is_admin && formData.id == null && (
        <Alerts
          message={"Are you sure to create the statement?"}
          onCancel={() => setShowmodal(false)}
          onConfirm={() => handleSubmit()}
        />
      )}
      {showmodal && userInfo.is_admin && formData.id != null && (
        <Alerts
          message={"Are you sure to Sent this statement for Approval?"}
          onCancel={() => setShowmodal(false)}
          onConfirm={() =>
            updateStatement(
              formData.id,
              changestatus,
              true,
              formData.selected_vendor_index,
              formData.recommendation_reason
            )
          }
        />
      )}
      {showmodal && !userInfo.is_admin && (
        <ApproveModallog setShowmodal={setShowmodal} cs_id={formData.id} />
      )}
    </div>
  );
};

export default LogisticsTable;
