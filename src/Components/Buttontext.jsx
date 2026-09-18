import { useToggleModal } from "../store/brStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import {
  compareWefDate,
  formatDateDMY,
  formatwords,
} from "../Helpers/helperfunctions";
import { useState } from "react";
import { IoWarningSharp } from "react-icons/io5";
import { SPECIAL_PROJECTS } from "../../config/ENV";
import { TiMediaFastForwardOutline } from "react-icons/ti";

const Buttontext = ({ issentforapproval, nextstatus, data }) => {
  const userInfo = useUserInfo();
  const { setShowModal } = useToggleModal();
  const [wefNoticeStep, setWefNoticeStep] = useState(null);

  const buttontxt = issentforapproval
    ? nextstatus
    : data.status == "created"
      ? "Sent for Approval"
      : data.status != "review" && data.status != "edit"
        ? "Create Document"
        : "";

  const buttonclass =
    (buttontxt?.toLowerCase().includes("pending") &&
      nextstatus != "Approve/Reject") ||
    buttontxt == "approved" ||
    buttontxt == "rejected" ||
    buttontxt == "review" ||
    buttontxt == "reverted"
      ? "px-10 py-2  bg-gray-400 cursor-not-allowed"
      : buttontxt != ""
        ? "px-10 py-2 bg-blue-600  hover:bg-blue-700 cursor-pointer"
        : "";
  const isDisabled =
    buttonclass.includes("bg-gray-400") ||
    buttontxt == "approved" ||
    buttontxt == "review" ||
    buttontxt == "reverted" ||
    buttontxt == "rejected";
  const isSpecialProject = SPECIAL_PROJECTS?.includes(
    Number(data?.project_code),
  );
  const isDemob = data?.category == "Demob";
  const finalDemobApprover =
    isDemob &&
    ((isSpecialProject && userInfo?.role?.includes("pd")) ||
      (!isSpecialProject && userInfo?.role?.includes("pm")));
  const requiresWefNotice =
    isDemob &&
    (buttontxt === "Sent for Approval" || buttontxt === "Approve/Reject");
  const { wefChanged, updatedDate } = compareWefDate(data["w.e.f"]);
  const isPassedDateNotice = wefNoticeStep === "date";

  const handleClick = () => {
    if (requiresWefNotice) {
      setWefNoticeStep("general");
      return;
    }
    setShowModal();
  };

  return (
    <div>
      <button
        className={` text-white rounded  shadow items-center font-semibold  transition-colors ${buttonclass}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {formatwords(buttontxt)}
      </button>
      {wefNoticeStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className={`w-full max-w-md rounded-xl border-t-4 bg-white p-6 shadow-xl ${
              isPassedDateNotice ? "border-red-500" : "border-amber-500"
            }`}
          >
            <span className="mb-4 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isPassedDateNotice
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {isPassedDateNotice ? (
                  <IoWarningSharp size={22} />
                ) : (
                  <IoWarningSharp size={22} />
                )}
              </span>
              <h2
                className={`flex flex-1 items-center justify-between text-lg font-semibold ${
                  isPassedDateNotice ? "text-red-800" : "text-amber-800"
                }`}
              >
                {isPassedDateNotice
                  ? "Warning: Late Approval Detected"
                  : "Important Note"}{" "}
                <button
                  className="cursor-pointer text-gray-400 transition hover:text-gray-700"
                  onClick={() => setWefNoticeStep(null)}
                  aria-label="Close notice"
                >
                  ✕
                </button>
              </h2>
            </span>
            {isPassedDateNotice ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-gray-700">
                <p>
                  The selected demobilization date has passed in the IOC.
                  Approving this IOC will automatically update the Actual
                  Demobilization Date to
                  {finalDemobApprover ? (
                    <strong className="text-red-700">
                      {" "}
                      {"today (" + formatDateDMY(updatedDate) + ")"}.
                    </strong>
                  ) : (
                    " final approval date."
                  )}
                </p>
              </div>
            ) : (
              <p className="mb-6 text-gray-600">
                Delayed approval will automatically set the Actual
                Demobilization Date to the Final Approval Date.
              </p>
            )}

            <div className="flex justify-end ">
              <button
                type="button"
                onClick={() => {
                  if (wefNoticeStep === "general" && wefChanged) {
                    setWefNoticeStep("date");
                    return;
                  }

                  setWefNoticeStep(null);
                  setShowModal();
                }}
                className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 cursor-pointer"
              >
                Continue
                <TiMediaFastForwardOutline size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buttontext;
