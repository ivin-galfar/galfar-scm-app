/* eslint-disable react/prop-types */
import { useState } from "react";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { useStatement, useStatusFilter } from "../store/logisticsStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { expectedstatus, role_finder } from "../Helpers/statusfinder";
import { RxCross1 } from "react-icons/rx";
import { api, EmailAlert } from "../APIs/api";
import { is_logistics } from "../Helpers/dept_helper";
import { useNavigate } from "react-router-dom";
import {
  LuCheck,
  LuClipboardCheck,
  LuRotateCcwSquare,
  LuX,
} from "react-icons/lu";
import { generatePDFLG } from "../Helpers/helperfunctions";
import { useClickFromDashboard } from "../store/helperStore";

const ApproveModallog = ({ setShowmodal, cs_id }) => {
  const { setErrorMessage, errormessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { formData, setFormData, tableData } = useStatement();
  const [comments, setComments] = useState("");
  const userInfo = useUserInfo();
  const dept = is_logistics(userInfo?.dept_code) ? "logistics" : "";
  const navigate = useNavigate();
  const { setStatusFilter } = useStatusFilter();
  const { isClicked } = useClickFromDashboard();

  const submitApproval = async (cs_id, status) => {
    let definedprojects = [
      7092, 7112, 7099, 7110, 7111, 7114, 7108, 7105, 7097, 7102, 7104, 7106, 1,
      7115,
    ];
    let project = Number(formData.project?.trim());
    if (!definedprojects.includes(project)) {
      setShowToast();
      setErrorMessage(
        "Mentioned Project not found. Please contact initiator!!",
      );
      setTimeout(() => {
        resetshowtoast();
        setShowmodal(false);
        clearErrorMessage();
      }, 1000);
      return;
    }
    let updatedstatus = "";

    if (status == "approved") {
      updatedstatus = expectedstatus(userInfo.role, project);
    } else if (status == "review") {
      updatedstatus = "review";
    } else {
      updatedstatus = "rejected";
    }
    let updatedFormData = {
      ...formData,
      status: updatedstatus,
      created_at: new Date(formData.created_at).toLocaleDateString("en-AE"),
      comments,
    };

    if (updatedstatus.toLowerCase() === "approved") {
      const { fileUrl: pdfUrl, fileName: pdfName } = await generatePDFLG(
        updatedFormData,
        tableData,
        userInfo,
      );
      updatedFormData.approvedPdfUrl = pdfUrl;
      updatedFormData.approvedpdfName = pdfName;
    }

    let comments_role = role_finder(userInfo.role);
    try {
      await api.post(
        `/logistics/updatestatement/${cs_id}`,
        {
          updatedstatus,
          [comments_role]: comments,
          rejectedby:
            updatedstatus === "rejected" ? userInfo.role[0] : undefined,
          role: userInfo.role[0],
          project: project,
        },
      );

      if (updatedstatus?.toLowerCase() == "rejected") {
        updatedFormData = {
          ...updatedFormData,
          rejectedby: userInfo.role?.[0] ?? "",
          status: updatedstatus,
          project: project,
        };
      }

      setFormData(updatedFormData);
      setShowToast();
      setTimeout(() => {
        setShowmodal(false);
        resetshowtoast();
        if (isClicked) {
          navigate("/pendingdashboard", { replace: true });
        } else {
          navigate("/dashboardlg", { replace: true });
        }
        setStatusFilter("Pending");
      }, 1500);
      setComments("");
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
      await EmailAlert(cs_id, userInfo, dept, updatedFormData);
    } catch (error) {
      const message = error?.response?.data.message;
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

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logistics-approval-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LuClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2
                id="logistics-approval-title"
                className="text-lg font-semibold text-slate-900"
              >
                Logistics Statement Approval
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
        {showtoast &&
          !errormessage &&
          formData.status !== "rejected" &&
          formData.status !== "review" && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              ✅ You have Approved this Statement!
            </div>
          )}{" "}
        {showtoast && formData.status == "rejected" && !errormessage && (
          <div className="fixed  top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            <div className="flex gap-2 justify-center items-center">
              <RxCross1 /> You have Rejected this Statement!
            </div>
          </div>
        )}
        {showtoast && formData.status == "review" && !errormessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            You have successfully sent back the statement for Review!!
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveModallog;
