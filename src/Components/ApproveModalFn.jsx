/* eslint-disable react/prop-types */
import { useToggleModal } from "../store/brStore";
import {
  LuCheck,
  LuClipboardCheck,
  LuRotateCcwSquare,
  LuX,
} from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { useToast } from "../store/toastStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useErrorMessage } from "../store/errorStore";
import { statusExpected } from "../Helpers/statusfinder";
import { FnEmailAlert, updatefilenotevalues } from "../APIs/api";
import { compareWefDate, generatePDF } from "../Helpers/helperfunctions";
import {
  useChangingWefDate,
  useClickFromDashboard,
  useComments,
} from "../store/helperStore";
import { is_plant } from "../Helpers/dept_helper";
import { useMutation } from "@tanstack/react-query";
import { SPECIAL_PROJECTS } from "../../config/ENV";
import { useNavigate } from "react-router-dom";
import { useStatusFilter } from "../store/logisticsStore";

const ApproveModalFn = ({ selectedvalue: data, setSelectedValue }) => {
  const userInfo = useUserInfo();
  const { resetShowModal } = useToggleModal();
  const { clearErrorMessage, setErrorMessage, errormessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { setComments, comments, resetComments } = useComments();
  const { setIsChanged } = useChangingWefDate();
  const SpecialProjects = userInfo?.pr_code?.some((code) =>
    SPECIAL_PROJECTS.includes(Number(code)),
  );
  const { isClicked } = useClickFromDashboard();

  const navigate = useNavigate();
  const dept = is_plant(userInfo?.dept_code) ? "plant" : "";
  const { setStatusFilter } = useStatusFilter();
  const { mutate: updatestatement } = useMutation({
    mutationFn: updatefilenotevalues,
    onSuccess: async (responseData) => {
      const pdfUrl = await generatePDF(responseData, userInfo);
      const finalResponse = pdfUrl
        ? { ...responseData, exportedstatement: pdfUrl }
        : responseData;
      setSelectedValue(finalResponse);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        resetShowModal();
        resetComments();
        if (isClicked) {
          navigate("/pendingdashboard", { replace: true });
        } else {
          navigate("/dashboardfn", { replace: true });
        }
        setStatusFilter("Pending");
      }, 1500);
      try {
        await FnEmailAlert(finalResponse.id, userInfo, dept, finalResponse);
      } catch (err) {
        const message = err?.response?.data || err?.message || "Email failed";
        setErrorMessage(message);
      }
    },
    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetShowModal();
      }, 1500);
    },
  });
  const submitApproval = async (status) => {
    let updatedstatus = "";
    const updatedData = {
      ...data,
      status: data.status,
    };
    const isDemob = data.category === "Demob";

    let wef_changed = false;
    let updated_date = null;

    const isSpecialProject = SPECIAL_PROJECTS?.includes(
      Number(data?.project_code),
    );

    const finalDemobApprover =
      isDemob &&
      ((isSpecialProject && userInfo?.role?.includes("pd")) ||
        (!isSpecialProject && userInfo?.role?.includes("pm")));

    if (finalDemobApprover) {
      const { wefChanged, updatedDate } = compareWefDate(data["w.e.f"]);

      if (wefChanged) {
        wef_changed = wefChanged;
        updated_date = updatedDate;
        setIsChanged();
      }
    }

    if (status == "approved") {
      updatedstatus = statusExpected(
        userInfo?.role,
        null,
        data.type,
        data.category,
        data.project_code,
        SpecialProjects,
      );
      updatedData.status = updatedstatus;
      setSelectedValue(updatedData);
    } else if (status == "rejected") {
      updatedstatus = "rejected";
      updatedData.status = updatedstatus;
      setSelectedValue(updatedData);
    } else {
      updatedstatus = "review";
      updatedData.status = updatedstatus;
      setSelectedValue(updatedData);
    }

    const payload = {
      status: updatedstatus,
      fnid: data.id,
      userInfo,
      comments,
      type: data.type,
      category: data.category,
      sentforapproval: "yes",
      project_code: data.project_code,
      wefchanged: wef_changed,
      wefchangeddate: updated_date,
    };

    updatestatement(payload);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-note-approval-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LuClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2
                id="file-note-approval-title"
                className="text-lg font-semibold text-slate-900"
              >
                File Note Approval
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Choose an action to move this file note through the approval
                workflow.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => resetShowModal()}
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
              value={comments}
            />
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => resetShowModal()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => submitApproval("approved")}
            >
              <LuCheck aria-hidden="true" /> Approve
            </button>
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              onClick={() => submitApproval("rejected")}
            >
              <LuX aria-hidden="true" /> Reject
            </button>
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              onClick={() => submitApproval("review")}
            >
              <LuRotateCcwSquare /> Send For Review
            </button>
          </div>
        </div>
        {showtoast && !errormessage && data.status == "review" && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have sent this Statement for review!
          </div>
        )}{" "}
        {showtoast &&
          !errormessage &&
          data.status !== "rejected" &&
          data.status !== "review" && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              ✅ You have Approved this Statement!
            </div>
          )}{" "}
        {showtoast && data.status == "rejected" && !errormessage && (
          <div className="fixed  top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            <div className="flex gap-2 justify-center items-center">
              <RxCross1 /> You have Rejected this Statement!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveModalFn;
