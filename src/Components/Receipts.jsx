import { useContext, useEffect } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import TableHeader from "./ReceiptsHeader";
import MyTable from "./Table";
import { AppContext } from "./Context";
import { useState } from "react";
import ApproveModal from "./ApproveModal";
import ReasonForSelection from "./ReasonForSelection";
import fetchStatments from "../APIs/StatementsApi";
import { useMutation } from "@tanstack/react-query";
import { feedReceipt, updateReceipt } from "../APIs/api";
import { useEdit, useSortVendors } from "../store/statementStore";
import { useNavigate } from "react-router-dom";

const Receipts = () => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showcalc, setShowcalc] = useState(false);
  const [showmodal, setShowmodal] = useState(false);
  const { isEdit, resetIsEdit } = useEdit();
  const navigate = useNavigate();
  const {
    sharedTableData,
    setSharedTableData,
    setNewMr,
    setMrno,
    selectedmr,
    hasInputActivity,
    isMRSelected,
    reqApprovalstatus,
    setreqApprovalstatus,
    setReqMrno,
    setIsMRSelected,
    selectedVendorIndex,
    setParticularName,
    setfreezeQuantity,
    selectedVendorReason,
    setSelectedVendorReason,
    freezequantity,
  } = useContext(AppContext);
  const Asset = userInfo.role == "inita" ? true : false;

  const { setSortVendors, resetSortVendors } = useSortVendors();
  const ReceiptMutation = useMutation({
    mutationFn: feedReceipt,
    onMutate: () => {
      setErrormessage("");
      setfreezeQuantity(false);
    },
    onSuccess: (data) => {
      setShowToast(true);
      setSortVendors();
      setIsMRSelected(true);
      setNewMr(false);
      setParticularName([]);
      setSelectedVendorReason("");
      setSharedTableData((prev) => ({
        ...prev,
        formData: data.receipt.receipt,
      }));
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      navigate(`/receipts/${data.receipt.receipt.id}`, { replace: true });
    },
    onError: (error) => {
      setShowToast(true);
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    },
  });

  const updateReceiptMutation = useMutation({
    mutationFn: updateReceipt,
    onMutate: () => {
      setErrormessage("");
      setfreezeQuantity(false);
    },
    onSuccess: (data) => {
      resetIsEdit();
      setShowToast(true);
      resetSortVendors();
      setIsMRSelected(true);
      setNewMr(false);
      setParticularName([]);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      setSharedTableData((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          receiptupdated: new Date().toISOString(),
        },
      }));
    },
    onError: (error) => {
      setShowToast(true);
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    },
  });

  const handleSubmit = async () => {
    const {
      equipmrnovalue,
      emrefnovalue,
      locationvalue,
      projectvalue,
      requireddatevalue,
      requirementdurationvalue,
      currency,
      hiringname,
    } = sharedTableData.formData;

    const isReview = sharedTableData.formData.status === "review";
    if (
      !isReview &&
      !Asset &&
      (!equipmrnovalue ||
        !emrefnovalue ||
        !locationvalue ||
        !projectvalue ||
        !hiringname ||
        !requireddatevalue ||
        !requirementdurationvalue ||
        !currency)
    ) {
      setShowToast(true);
      setErrormessage("Please fill all required fields!!");
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      return;
    }

    if (Asset && (!hiringname || !currency)) {
      setShowToast(true);
      setErrormessage("Please fill all required fields!!");
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      return;
    }
    if (!isReview) {
      ReceiptMutation.mutate({ sharedTableData, userInfo });
    } else {
      updateReceiptMutation.mutate({
        sharedTableData,
        selectedVendorIndex,
        selectedVendorReason,
        userInfo,
      });
    }
  };

  const handleRemoveFile = (index) => {
    const upadatedFilenames = [...sharedTableData.formData.filename];
    const updatedFiles = [...sharedTableData.formData.file];

    upadatedFilenames.splice(index, 1);
    updatedFiles.splice(index, 1);
    setSharedTableData((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        filename: upadatedFilenames,
        file: updatedFiles,
      },
    }));
  };
  const handleReset = () => {
    window.location.reload();
  };
  const statusMapping = {
    initiator: [],
    hod: ["Pending For HOD", "Approved", "Rejected"],
    gm: ["Pending for GM", "Approved", "Rejected"],
    ceo: ["Pending for CEO", "Approved", "Rejected"],
  };

  const expectedStatuses =
    statusMapping[userInfo?.role]?.map((s) => s.toLowerCase()) || [];

  useEffect(() => {
    const fetchMR = async () => {
      try {
        const { reqMrValues, mrValues } = await fetchStatments({
          expectedStatuses,
          userInfo,
        });

        setReqMrno(reqMrValues);
        setMrno(mrValues);
      } catch (error) {
        let message = error?.response?.data?.message;
        setErrormessage(message ? message : error.message);
      }
    };
    fetchMR();
  }, [sharedTableData.formData.id, isMRSelected]);

  const isSentForApproval =
    sharedTableData.formData?.sentforapproval === "yes" &&
    sharedTableData.formData.status !== "review";

  const isStatusSet = sharedTableData.formData.status;

  let statusclass = "";
  if (
    (isStatusSet == "Pending for CEO" && userInfo.role != "ceo") ||
    (isStatusSet == "Pending for GM" && userInfo.role != "gm") ||
    (isStatusSet == "Pending For HOD" && userInfo.role != "hod") ||
    (isStatusSet == "reverted" &&
      userInfo.role !== "inita" &&
      userInfo.role !== "inith") ||
    isStatusSet == "Approved" ||
    isStatusSet == "Rejected"
  ) {
    statusclass = "bg-gray-400 cursor-not-allowed";
  }

  const buttonClass = isSentForApproval
    ? statusclass
      ? statusclass
      : sharedTableData.formData.status !== "reverted"
        ? "bg-blue-600 cursor-pointer"
        : ""
    : sharedTableData.formData?.type !== null &&
        isStatusSet !== undefined &&
        isStatusSet !== "review"
      ? !isEdit
        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        : ""
      : sharedTableData.formData.receiptupdated != null &&
          isStatusSet !== "review"
        ? "bg-blue-600 rounded shadow  cursor-pointer"
        : !isEdit && sharedTableData?.formData?.status !== undefined
          ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          : "";

  const buttonText = isSentForApproval
    ? isStatusSet
      ? isStatusSet.toLowerCase().includes(userInfo.role?.toLowerCase())
        ? "Approve / Reject"
        : sharedTableData.formData.status === "approved"
          ? "Approved"
          : sharedTableData.formData.status !== "reverted"
            ? sharedTableData.formData.status
            : ""
      : "Already Requested"
    : sharedTableData.tableData.length == 0
      ? ""
      : !isEdit
        ? "Request Approval"
        : "";
  const isReview = sharedTableData.formData.status === "review";

  return (
    <div className="pt-1 pl-10 pr-5 pb-28 relative  flex-grow">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.is_admin} />
      </h1>
      <div className="flex w-full gap-4">
        <div className="w-2/3">
          <MyTable showcalc={showcalc} />
        </div>

        {sharedTableData.formData?.filename?.length > 0 && (
          <div className="w-1/3 p-4 bg-gray-50 rounded-xl shadow-inner overflow-y-auto max-h-[40vh]">
            <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
              Uploaded Files{" "}
              {sharedTableData.formData?.filename?.length > 0
                ? `(${sharedTableData.formData?.filename?.length})`
                : ""}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {sharedTableData.formData?.file ||
              sharedTableData.formData?.filename?.length > 0 ? (
                sharedTableData.formData?.filename?.map((file, index) => {
                  const url = sharedTableData.formData.file?.[index];
                  return (
                    <div
                      key={index}
                      className="relative flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
                    >
                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={
                          sharedTableData.formData?.created_at != null &&
                          !isEdit &&
                          sharedTableData.formData?.status != "review"
                        }
                        className={`absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs font-bold ${sharedTableData.formData?.created_at != null && !isEdit && sharedTableData.formData?.status != "review" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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
      <div
        className={` z-50 flex justify-between items-center gap-3.5 pt-3 flex-wrap`}
      >
        {userInfo?.is_admin ? (
          <div className="flex gap-3.5 min-w-[280px]">
            {sharedTableData.formData.selectedVendorReason ? (
              <>
                <div className="w-100 p-2 inline-block bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible">
                  <h1 className="text-black">Recommendation points:</h1>
                  {sharedTableData.formData.selectedVendorReason
                    ? sharedTableData.formData.selectedVendorReason
                    : ""}
                </div>
              </>
            ) : (
              <div className="w-100 inline-block px-3 py-1 bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible"></div>
            )}
            {(hasInputActivity && !sharedTableData.formData.id) ||
            isMRSelected ? (
              <>
                {selectedmr != "default" && sharedTableData.formData?.id ? (
                  <button
                    onClick={() => {
                      setShowmodal(true);
                    }}
                    disabled={statusclass != ""}
                    className={`px-4 py-2 ${buttonText == "Approved" || buttonText == "Rejected" ? "ml-96" : "ml-80"} max-h-10 text-white font-semibold  ${
                      buttonClass
                    } ${buttonText == "Already Requested" ? "cursor-not-allowed" : ""} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75  transition duration-300 ease-in-out"
                  `}
                  >
                    {buttonText === "Request Approval" && isReview
                      ? sharedTableData.formData.receiptupdated != null
                        ? buttonText
                        : ""
                      : buttonText}
                  </button>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>
                <button className="px-4 py-2 invisible">calculate</button>
                <button className="px-4 py-2 invisible">
                  Reset Calculation
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-3.5 min-w-[280px]">
              {sharedTableData.formData.selectedVendorReason ? (
                <>
                  <div className="w-100 p-2 inline-block bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible">
                    <h1 className="text-black">Recommendation points:</h1>
                    {sharedTableData.formData.selectedVendorReason
                      ? sharedTableData.formData.selectedVendorReason
                      : ""}
                  </div>
                </>
              ) : (
                <div className="w-100 inline-block px-3 py-1 bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible"></div>
              )}

              {sharedTableData.formData.status !== "" &&
              sharedTableData.formData.status !== "review" ? (
                <div className="justify-end flex">
                  <button
                    disabled={statusclass != ""}
                    className={`px-10 py-2  text-white font-semibold rounded max-h-10 ${buttonText === "Approved" || buttonText === "Rejected" ? "ml-86" : "ml-70"}  ${buttonClass}`}
                    onClick={() => setShowmodal(true)}
                  >
                    {buttonText}
                  </button>
                </div>
              ) : (
                sharedTableData.formData.equipMrNoValue &&
                sharedTableData.formData.status !== "review" && (
                  <div className="justify-end flex ml-68 ">
                    <button
                      className="px-10 py-2 bg-blue-600 text-white font-semibold rounded ml-110 shadow cursor-pointer"
                      onClick={() => setShowmodal(true)}
                    >
                      Approve/Reject
                    </button>
                  </div>
                )
              )}
            </div>
          </>
        )}
        {userInfo?.is_admin ? (
          <div className="justify-end  flex gap-3.5">
            <button
              onClick={handleSubmit}
              className={` ${(isMRSelected || !hasInputActivity) && sharedTableData.formData.status !== "review" ? "hidden" : ""} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer ${sharedTableData.tableData?.sentforapproval == "yes" ? sharedTableData.formData.status !== "review" : "hidden" ? "Update" : ""}`}
            >
              {sharedTableData.formData.status !== "review"
                ? "Create"
                : !isEdit
                  ? "update"
                  : ""}
            </button>
            <button
              onClick={handleReset}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${isMRSelected ? "invisible" : ""} cursor-pointer`}
            >
              Reset
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
      {showToast && errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          {errormessage}
        </div>
      )}
      {showToast && isMRSelected && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Receipt details added successfully!
        </div>
      )}{" "}
      {showToast && isMRSelected && !errormessage && isReview && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Receipt details has been updated successfully!
        </div>
      )}
      {!isReview && showToast && reqApprovalstatus && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have succesfully requested for Approval!
        </div>
      )}
      {showmodal && !userInfo?.is_admin && (
        <ApproveModal
          setShowmodal={setShowmodal}
          cs_id={sharedTableData?.formData?.id}
        />
      )}
      {showmodal && userInfo?.is_admin && (
        <ReasonForSelection
          setShowmodal={setShowmodal}
          reqApprovalMR={sharedTableData.formData.id}
          setShowToast={setShowToast}
          setErrormessage={setErrormessage}
          setreqApprovalstatus={setreqApprovalstatus}
          selectedVendorIndex={selectedVendorIndex}
        />
      )}
    </div>
  );
};

export default Receipts;
