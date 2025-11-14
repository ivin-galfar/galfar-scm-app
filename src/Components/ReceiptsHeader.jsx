import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import { AppContext } from "./Context";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { TiTick } from "react-icons/ti";
import { RxCrossCircled } from "react-icons/rx";
import { FaFileUpload } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import fetchParticulars from "../APIs/ParticularsApi";
import { FaTrash } from "react-icons/fa";
import Alerts from "../Components/Alerts";
import { useNavigate, useParams } from "react-router-dom";
import {
  useClearStatementTable,
  useDeleteStatement,
  useSortVendors,
  useUpdateQuantity,
} from "../store/statementStore";

const TableHeader = ({ isAdmin }) => {
  const inputRef = useRef(null);
  const {
    setSharedTableData,
    sharedTableData,
    reqmrno,
    mrno,
    setIsMRSelected,
    setMrno,
    selectedmr,
    setSelectedMr,
    particulars,
    setParticularName,
    particularname,
    setParticulars,
    setNewMr,
    newMr,
    setfreezeQuantity,
    freezequantity,
  } = useContext(AppContext);

  const formData = sharedTableData?.formData;
  const userInfo = useUserInfo();
  const [editing, setEditing] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [triggerdelete, setTriggerdelete] = useState(false);
  const navigate = useNavigate();
  const { mrnumber } = useParams();
  const { setQuantity } = useUpdateQuantity();
  const { setSortVendors, resetSortVendors } = useSortVendors();
  const { setClearTable } = useClearStatementTable();
  const { deleted, resetDeleted, setDeleted } = useDeleteStatement();

  const Asset =
    userInfo.role == "inita" || formData.type == "asset" ? true : false;

  useEffect(() => {
    const loadParticulars = async () => {
      try {
        const particulars = await fetchParticulars(
          userInfo,
          userInfo?.dept_code?.[0]
        );
        setParticulars(particulars.Particulars);
        setfreezeQuantity(false);
      } catch (error) {
        console.log(error);
      }
    };
    loadParticulars();
  }, []);

  useEffect(() => {
    if (userInfo?.is_admin) {
      setEditing(true);
    }
  }, [userInfo]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    if (field === "qty") {
      setQuantity(value);
    }

    setSharedTableData((prev) => {
      const updatedForm = {
        ...prev.formData,
        [field]: value,
      };

      return {
        ...prev,
        formData: updatedForm,
      };
    });
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    setSharedTableData((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        currency: value,
      },
    }));
  };

  const fetchReceipt = async (id) => {
    const receiptid = id || mrnumber;
    if (id && id !== mrnumber) {
      navigate(`/receipts/${id}`, { replace: true });
    }
    setSortVendors();
    if (id && id != "default") {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/receipts/${receiptid}`,
          config
        );
        const receipt = response.data;
        setSharedTableData({
          formData: receipt.formData || {},
          tableData: receipt.tableData || [],
        });
        setfreezeQuantity(receipt.formData?.status !== "review");
      } catch (error) {
        console.log(error);
      }
    } else {
      setClearTable();
      setSharedTableData({
        formData: {},
        tableData: [],
      });
    }
  };

  useLayoutEffect(() => {
    if (!userInfo?.is_admin) {
      if (mrnumber && mrnumber !== "default") {
        fetchReceipt(mrnumber);
        setIsMRSelected(true);
        setSelectedMr(mrnumber);
      }
      // default navigating to latest cs
      //  else {
      //   const defaultMr = mrno[0];
      //   if (defaultMr) fetchReceipt(defaultMr);
      // }
    }
  }, []);
  useEffect(() => {
    if (mrnumber) {
      fetchReceipt(mrnumber);
      setIsMRSelected(true);
      setSelectedMr(mrnumber);
      setNewMr(false);
    } else {
      resetSortVendors();
      setClearTable();
      setIsMRSelected(false);
      setSelectedMr("");
      setSharedTableData({
        formData: {
          datevalue: new Date().toISOString().split("T")[0],
          type: userInfo.role == "inita" ? "asset" : "hiring",
        },
        tableData: [],
      });
    }
  }, [mrnumber]);

  let statusLogo = null;
  const status = sharedTableData.formData.status ?? null;
  let latestapproverComment = sharedTableData.formData.approverdetails?.length
    ? sharedTableData.formData.approverdetails[
        sharedTableData.formData.approverdetails.length - 1
      ].comments
    : "";
  let RejectedBy = sharedTableData.formData.approverdetails?.length
    ? sharedTableData.formData.approverdetails[
        sharedTableData.formData.approverdetails.length - 1
      ].rejectedby
    : "";

  let approvedBy = sharedTableData.formData.approverdetails?.length
    ? sharedTableData.formData.approverdetails[
        sharedTableData.formData.approverdetails.length - 1
      ].role
    : "";

  if (status === "Approved") {
    statusLogo = (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full w-fit">
        <TiTick className="text-green-600 text-2xl" />
        <span className="font-medium text-sm">Approved</span>
      </div>
    );
  } else if (status === "Rejected") {
    statusLogo = (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100  text-red-600 rounded-full w-fit">
        <RxCrossCircled className="text-red-600 text-2xl" />
        <span className="font-medium text-sm">Rejected</span>
      </div>
    );
  } else {
    statusLogo = "";
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const formData = new FormData();
      files.forEach((file) => {
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
        config
      );

      const newFiles = response.data.uploadedFiles.map((file) => file.fileUrl);
      const newFileNames = response.data.uploadedFiles.map(
        (file) => file.fileName
      );
      setSharedTableData((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          file: [...(prev.formData.file || []), ...newFiles],
          filename: [...(prev.formData.filename || []), ...newFileNames],
        },
      }));
    } catch (error) {
      setShowToast(true);
      setErrormessage(error.message);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };
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
        setDeleted(false);
      }, 1500);
      setParticularName([]);
      setIsMRSelected(false);
      setSelectedMr(null);
      resetSortVendors();
      setClearTable();
      setSharedTableData({ formData: {}, tableData: [] });
    } catch (error) {
      resetDeleted();
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
    }
  };

  return (
    <div className="text-center mb-6 space-y-2">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setClearTable();
              setSharedTableData({
                formData: {
                  equipmrnovalue: "",
                  emrefnovalue: "",
                  hiringname: "",
                  locationvalue: "",
                  projectvalue: "",
                  requirementdurationvalue: "",
                  file: [],
                  filename: [],
                  qty: "",
                  currency: "",
                  requireddatevalue: new Date(),
                  datevalue: new Date(),
                  type: userInfo.role == "inita" ? "asset" : "hiring",
                },
                tableData: [],
              });
              resetSortVendors();
              setNewMr(true);
              setSelectedMr(null);
              setParticularName([]);
              setIsMRSelected(false);
              setfreezeQuantity(false);
              navigate("/receipts", { replace: true });
            }}
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl shadow-md transition duration-200 cursor-pointer ${
              !userInfo?.is_admin ? "hidden" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Statement
          </button>
          <div
            className={`flex items-center gap-2 ${!newMr ? "invisible" : ""}`}
          >
            {
              <div className="flex items-center gap-2">
                <label
                  htmlFor="templateSelect"
                  className="text-sm font-medium text-gray-700 ml-5"
                >
                  Choose Template:
                </label>{" "}
                <div className="w-full max-w-xs">
                  {" "}
                  <select
                    id="templateSelect"
                    value={particularname}
                    onChange={(e) => setParticularName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white overflow-hidden"
                  >
                    <option value="">Select Template</option>
                    {Array.isArray(particulars) &&
                      particulars.map((template, index) => (
                        <option key={template.id} value={template.id}>
                          {template.template}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="flex-1 flex justify-center mr-35">
          <h2 className="text-xl font-medium uppercase text-center p-2 ml-25">
            GALFAR ENGINEERING & CONTRACTING WLL EMIRATES
          </h2>
        </div>

        <div className="w-[250px]" />
      </div>
      <div className="flex justify-between items-center w-full relative">
        <div className="w-1/3" />

        <h3 className="text-md font-medium text-center absolute left-1/2 transform -translate-x-1/2 italic">
          COMPARATIVE STATEMENT
        </h3>

        <div className="flex w-1/4 justify-between">
          {userInfo?.is_admin ? (
            <div className="flex items-center gap-2">
              <label
                htmlFor="receiptfile"
                className={`flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-all`}
              >
                Upload File
                <FaFileUpload size={20} />
                {Array.isArray(sharedTableData.formData?.file) &&
                  sharedTableData.formData?.file?.filter((f) => f.trim() !== "")
                    .length > 0 && (
                    <span className="relative -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                      {sharedTableData.formData?.file.length}
                    </span>
                  )}
                <input
                  id="receiptfile"
                  type="file"
                  multiple
                  accept="image/*"
                  className={`hidden ${sharedTableData.formData?.created_at != null ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onChange={handleFileUpload}
                  disabled={
                    sharedTableData.formData?.created_at != null &&
                    sharedTableData.formData?.status != "review"
                  }
                  // disabled={sharedTableData.formData?.file?.length > 0}
                />
              </label>
            </div>
          ) : (
            <>
              {Array.isArray(sharedTableData.formData?.file) &&
                sharedTableData.formData.file?.filter((f) => f.trim() !== "")
                  .length > 0 &&
                (sharedTableData.formData?.file?.length <= 2 ? (
                  <div className="relative flex items-center gap-2">
                    {sharedTableData.formData.file.map((fileurl, index) => (
                      <a
                        key={index}
                        href={fileurl}
                        target="_blank"
                        download
                        className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-all"
                      >
                        Download Attachment {index + 1}
                        <FaFileDownload size={20} className="relative" />
                      </a>
                    ))}
                    <span className="absolute -top-6 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                      {sharedTableData.formData?.file.length}
                    </span>
                  </div>
                ) : (
                  <div className="relative flex flex-wrap gap-2 max-w-full">
                    {sharedTableData.formData.file
                      ?.slice(0, 4)
                      .map((fileurl, index) => (
                        <a
                          key={index}
                          href={fileurl}
                          target="_blank"
                          download
                          className="flex items-center gap-10 text-xs bg-blue-100 text-blue-700 px-2 py-1 max-w-[48%] rounded-md cursor-pointer hover:bg-blue-200 transition-all flex-shrink min-w-0 truncate"
                        >
                          <span>Attachment {index + 1}</span>
                          <FaFileDownload size={16} />
                        </a>
                      ))}
                    <span className="absolute -top-6 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                      {sharedTableData.formData.file?.length}
                    </span>
                  </div>
                ))}
            </>
          )}
          <div className="w-full flex justify-end">
            <h4 className="text-sm font-normal flex items-center gap-5">
              Date:{" "}
              {isAdmin ? (
                <input
                  type="date"
                  value={
                    formData?.datevalue
                      ? new Date(formData.datevalue).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={handleChange("datevalue")}
                  readOnly
                  className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              ) : (
                <span>
                  {formData?.datevalue
                    ? new Date(formData.datevalue).toISOString().split("T")[0]
                    : "N/A"}
                </span>
              )}
            </h4>
          </div>
        </div>
      </div>
      <div className="flex items-center w-full p-0.5">
        <div className="space-y-1 px-4 flex items-start gap-10 text-sm font-medium w-full max-w-md">
          {particularname == "" ? (
            <div className="flex flex-col flex-grow ">
              <label htmlFor="mrNo" className=" text-left text-gray-700 mb-1">
                Choose CS No.
              </label>
              <select
                id="mrNo"
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={formData?.id || mrnumber || "default"}
                onChange={(e) => {
                  handleChange("equipmrnovalue")(e);
                  if (e.target.value !== "default") {
                    fetchReceipt(e.target.value);
                    setIsMRSelected(true);
                    setSelectedMr(e.target.value);
                    setfreezeQuantity(true);
                  } else {
                    resetSortVendors();
                    setClearTable();
                    setIsMRSelected(false);
                    setSelectedMr(e.target.value);
                    setSharedTableData({ formData: {}, tableData: [] });
                    navigate("/receipts", { replace: true });
                  }
                }}
              >
                <option value="default">Select an option</option>
                {(isAdmin ? mrno : reqmrno)?.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex w-full gap-15">
              <div className="flex items-center gap-2 flex-1">
                <span>Currency:</span>
                <select
                  value={sharedTableData.formData?.currency || ""}
                  onChange={handleCurrencyChange}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="AED">د.إ AED</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>
          )}
          <div className="font-medium flex flex-col gap-1 text-sm  items-center  ">
            <span>Quantity:</span>
            <input
              type="number"
              min={0}
              step={1}
              value={formData?.qty ?? ""}
              disabled={freezequantity}
              onChange={handleChange("qty")}
              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative group mt-6">
            {statusLogo}
            {latestapproverComment && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {RejectedBy || approvedBy}: {latestapproverComment}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center text-sm font-medium w-1/2 ml-0 ">
          {isAdmin ? (
            <>
              <span>
                {!Asset || sharedTableData.formData.type != "asset"
                  ? "Hiring - "
                  : "Asset - "}
              </span>
              <input
                type="text"
                value={formData?.hiringname ?? ""}
                ref={inputRef}
                onChange={handleChange("hiringname")}
                className="border-b border-gray-500 outline-none text-sm font-medium text-center px-2 py-1"
              />
            </>
          ) : (
            <p className="text-sm font-medium">
              {formData?.projectvalue ? "Hiring -" : "Asset - "}
              <span className="font-medium">{formData?.hiringname ?? ""}</span>
            </p>
          )}
        </div>
        <div className="w-1/3 flex justify-end">
          {isAdmin &&
            selectedmr !== "" &&
            selectedmr !== null &&
            selectedmr !== "default" && (
              <button
                onClick={() => setTriggerdelete(true)}
                aria-label="Delete selected MR"
                className="flex items-center px-2 py-0.5 bg-red-500 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition cursor-pointer"
                type="button"
              >
                <FaTrash className="mr-1" size={14} />
                Delete Statement
              </button>
            )}
        </div>
      </div>

      {!Asset && (
        <div className="flex justify-between mt-4 px-4">
          <div className="flex flex-col space-y-1 text-left w-1/3">
            <p>
              <span className="font-medium">Project:</span>{" "}
              {isAdmin ? (
                <input
                  type="text"
                  value={formData?.projectvalue ?? ""}
                  onChange={handleChange("projectvalue")}
                  className="border-b border-gray-400 outline-none px-1 text-sm"
                />
              ) : (
                formData?.projectvalue
              )}
            </p>
            <div className="inline-flex items-center space-x-20">
              <p>
                <span className="font-medium">Location:</span>{" "}
                {isAdmin ? (
                  <input
                    type="text"
                    value={formData?.locationvalue ?? ""}
                    onChange={handleChange("locationvalue")}
                    className="border-b border-gray-400 outline-none px-1 text-sm"
                  />
                ) : (
                  formData?.locationvalue
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-1 text-center w-1/3">
            <p>
              <span className="font-medium">Equip Mr No:</span>{" "}
              {isAdmin ? (
                <input
                  type="text"
                  value={formData?.equipmrnovalue ?? ""}
                  onChange={handleChange("equipmrnovalue")}
                  className="border-b border-gray-400 outline-none px-1 text-sm"
                />
              ) : (
                formData?.equipmrnovalue
              )}
            </p>
            <p>
              <span className="font-medium">Em Ref No:</span>{" "}
              {isAdmin ? (
                <input
                  type="text"
                  value={formData?.emrefnovalue ?? ""}
                  onChange={handleChange("emrefnovalue")}
                  className="border-b border-gray-400 outline-none px-1 text-sm"
                />
              ) : (
                formData?.emrefnovalue
              )}
            </p>
          </div>

          <div className="flex flex-col space-y-2 text-sm w-1/3">
            <div className="flex items-center justify-between">
              <label className="font-medium whitespace-nowrap mr-2 ml-50">
                Required Date:
              </label>
              {isAdmin ? (
                <input
                  type="date"
                  value={
                    formData?.requireddatevalue
                      ? new Date(formData.requireddatevalue)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleChange("requireddatevalue")}
                  className="border-b border-gray-400 outline-none px-1 text-sm w-full max-w-[160px]"
                />
              ) : (
                <span>
                  {formData.requireddatevalue
                    ? new Date(formData.requireddatevalue)
                        .toISOString()
                        .split("T")[0]
                    : ""}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="font-medium whitespace-nowrap mr-2 ml-50">
                Requirement Durations:
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  value={formData?.requirementdurationvalue ?? ""}
                  onChange={handleChange("requirementdurationvalue")}
                  className="border-b border-gray-400 outline-none px-1 text-sm w-full max-w-[160px]"
                />
              ) : (
                <span>{formData?.requirementdurationvalue ?? ""}</span>
              )}
            </div>
          </div>
        </div>
      )}
      {showToast && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Attachments uploaded!
        </div>
      )}
      {showToast && errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          {errormessage}
        </div>
      )}
      {showToast && !errormessage && deleted && (
        <div className="z-[9999] fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Statement successfully Deleted!!
        </div>
      )}
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(selectedmr)}
        />
      )}
    </div>
  );
};

export default TableHeader;
