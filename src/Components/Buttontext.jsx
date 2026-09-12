import { useToggleModal } from "../store/brStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import {
  compareWefDate,
  formatDateDMY,
  formatwords,
} from "../Helpers/helperfunctions";
import { useState } from "react";
import { IoArrowForward, IoWarningSharp } from "react-icons/io5";
import { SPECIAL_PROJECTS } from "../../config/ENV";
import { IoIosArrowForward } from "react-icons/io";
import { TiMediaFastForward, TiMediaFastForwardOutline } from "react-icons/ti";

const Buttontext = ({ issentforapproval, nextstatus, data }) => {
  const userInfo = useUserInfo();
  const { setShowModal } = useToggleModal();
  const [showWefNotice, setShowWefNotice] = useState(false);

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
  const shouldCheckWef =
    isDemob &&
    ((isSpecialProject && userInfo?.role?.includes("pd")) ||
      (!isSpecialProject && userInfo?.role?.includes("pm")));
  const requiresWefNotice =
    isDemob &&
    (buttontxt === "Sent for Approval" || buttontxt === "Approve/Reject");
  const { wefChanged, updatedDate } = compareWefDate(data["w.e.f"]);

  const handleClick = () => {
    if (requiresWefNotice) {
      setShowWefNotice(true);
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
      {showWefNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <span className="flex gap-2 items-center mb-4">
              <IoWarningSharp size={20} className="text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-800 justify-between flex flex-1">
                Important Note{" "}
                <button
                  className="cursor-pointer"
                  onClick={() => setShowWefNotice(false)}
                >
                  ✕
                </button>
              </h2>
            </span>
            <p className="mb-6 text-gray-600">
              {wefChanged ? (
                <>
                  {" "}
                  The W.E.F. date has been crossed. Therefore, the W.E.F date
                  will be updated from
                  <strong> {formatDateDMY(data["w.e.f"])} </strong>
                  <>
                    to&nbsp;
                    {shouldCheckWef ? (
                      <>
                        final approval date{" "}
                        <strong>({formatDateDMY(updatedDate)}).</strong>
                      </>
                    ) : (
                      <strong> final approval date.</strong>
                    )}
                  </>
                </>
              ) : (
                <>
                  If the final approval date is later than the W.E.F. date, the
                  W.E.F. date will be automatically changed based on the
                  approval date.
                </>
              )}
            </p>

            <div className="flex justify-end ">
              <button
                type="button"
                onClick={() => {
                  setShowWefNotice(false);
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
