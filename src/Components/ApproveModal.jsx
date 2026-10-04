/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { AppContext } from "./Context";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useNavigate } from "react-router-dom";
import {
  LuCheck,
  LuClipboardCheck,
  LuRotateCcwSquare,
  LuX,
} from "react-icons/lu";
import {
  useClearStatementTable,
  useSortVendors,
} from "../store/statementStore";
import { RxCross1 } from "react-icons/rx";
import { is_plant } from "../Helpers/dept_helper";
import { useClickFromDashboard, useComments } from "../store/helperStore";
import { generatePDFHire } from "../Helpers/helperfunctions";
import { fetchReceiptsApproverDetails } from "../APIs/api";
import { statusMapping } from "../Helpers/roles_helper";

const ApproveModal = ({ setShowmodal, cs_id, doc_no }) => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [lastAction, setLastAction] = useState("");
  const dept = is_plant(userInfo?.dept_code) ? "plant" : "";

  const {
    setSharedTableData,
    sharedTableData,
    setIsMRSelected,
    setSelectedMr,
    setMultiStatusFilter,
  } = useContext(AppContext);

  const { setClearTable } = useClearStatementTable();
  const { resetSortVendors } = useSortVendors();
  const { comments, setComments, resetComments } = useComments();
  const navigate = useNavigate();
  const { isClicked } = useClickFromDashboard();

  const expectedStatuses = (userInfo?.role || []).flatMap((role) =>
    (statusMapping[role.toLowerCase()] || []).map((s) => s.toLowerCase()),
  );
  const pendingStatuses = !userInfo?.is_admin
    ? expectedStatuses.filter(
        (s) =>
          s.startsWith("pending") &&
          userInfo.role?.some((r) => s.includes(r.toLowerCase())),
      )
    : expectedStatuses.filter((s) => s.startsWith("pending"));

  const submitApproval = async (cs_id, status) => {
    let finalStatus = "";
    let rejectedBy = "";
    let approverDetails = [];
    let generatedPdfUrl = "";
    if (status === "rejected") {
      finalStatus = "Rejected";
      rejectedBy = userInfo.role;
    } else if (userInfo.role?.includes("hod") && status === "approved") {
      finalStatus = "Pending for GM";
    } else if (userInfo.role?.includes("gm") && status === "approved") {
      finalStatus = "Pending for CEO";
    } else if (userInfo.role?.includes("ceo") && status === "approved") {
      approverDetails = await fetchReceiptsApproverDetails(
        sharedTableData.formData.id,
        userInfo,
      );

      finalStatus = "Approved";
    } else if (status === "review") {
      finalStatus = "review";
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const currentApproval = await axios.put(
        `${REACT_SERVER_URL}/receipts/approver/${cs_id}`,
        {
          userId: userInfo.id,
          role: userInfo.role[0],
          approverstatus: finalStatus,
          action: status,
          approverComments: comments,
          rejectedby: rejectedBy,
          status: finalStatus,
        },
        config,
      );
      approverDetails.push(currentApproval.data[0]);
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        if (isClicked) {
          navigate("/pendingdashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        setMultiStatusFilter(pendingStatuses);
        setShowToast(false);
        resetComments();
      }, 1500);
      setTimeout(() => {
        setShowmodal(false);
      }, 1500);
      setLastAction(finalStatus);
      if (finalStatus === "review") {
        resetSortVendors();
        setClearTable();
        setIsMRSelected(false);
        setSelectedMr("default");
        setSharedTableData({
          formData: {
            hiringname: "",
            datevalue: "",
            projectValue: "",
            locationValue: "",
            equipMrNoValue: "",
            emRegNoValue: "",
            requireddatevalue: "",
            requirementdurationvalue: "",
            selectedvendorreason: "",
            currency: "",
            qty: "",
            file: [],
            filename: [],
          },
          tableData: [],
        });
        navigate("/dashboard", { replace: true });
        setMultiStatusFilter(pendingStatuses);
        setShowToast(true);
        setErrormessage("");
        setTimeout(() => {
          setShowmodal(false);
          setShowToast(false);
        }, 1500);
      } else {
        const updatedSharedTableData = {
          ...sharedTableData,
          formData: {
            ...sharedTableData.formData,
            status: finalStatus,
            approverstatus: finalStatus,
            rejectedby: rejectedBy,
            approverComments: comments,
            approverdetails: approverDetails,
          },
        };

        setSharedTableData(updatedSharedTableData);
        generatedPdfUrl = await generatePDFHire(
          updatedSharedTableData,
          userInfo,
          true,
        );
      }

      axios
        .post(
          `${REACT_SERVER_URL}/emailnotify/${cs_id}?dept=${dept}`,
          {
            userInfo,
            formData: sharedTableData.formData,
            status: finalStatus,
            doc_no: doc_no,
            approvedPdfUrl: generatedPdfUrl,
          },
          config,
        )
        .then((res) => console.log("✅ Email sent:", res.data))
        .catch((err) =>
          console.error("❌ Email send failed:", err.response.data.message),
        );
    } catch (error) {
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="statement-approval-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LuClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2
                id="statement-approval-title"
                className="text-lg font-semibold text-slate-900"
              >
                Statement Approval
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Choose an action to move this statement through the approval
                workflow.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setShowmodal(false)}
            aria-label="Close approval modal"
          >
            <LuX size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Comments
            </span>
            <textarea
              rows={4}
              placeholder="Add a clear note for the initiator or next approver..."
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 p-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(e) => setComments(e.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowmodal(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => submitApproval(cs_id, "approved")}
            >
              <LuCheck aria-hidden="true" /> Approve
            </button>
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              onClick={() => submitApproval(cs_id, "rejected")}
            >
              <LuX aria-hidden="true" /> Reject
            </button>
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              onClick={() => submitApproval(cs_id, "review")}
            >
              <LuRotateCcwSquare /> Send For Review
            </button>
          </div>
        </div>
        {showToast &&
          (sharedTableData.formData.status == "Approved" ||
            sharedTableData.formData.status == "Pending for CEO" ||
            sharedTableData.formData.status == "Pending for GM") &&
          !errormessage && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              ✅ You have Approved this Statement!
            </div>
          )}{" "}
        {showToast &&
          sharedTableData.formData.status == "Rejected" &&
          !errormessage && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              <div className="flex gap-2 justify-center items-center">
                <RxCross1 /> You have Rejected this Statement!
              </div>
            </div>
          )}
        {showToast && lastAction == "review" && !errormessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            You have successfully sent back the statement to Initiator for
            Review!!
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveModal;
