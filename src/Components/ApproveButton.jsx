import { useMutation } from "@tanstack/react-query";
import { useBrTableData, useToggleModal } from "../store/brStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import ApprovalModalBR from "./ApprovalModalBR";
import Alerts from "./Alerts";
import { BrEmailAlert, updatebrstatements } from "../APIs/api";
import { expectedstatusplant } from "../Helpers/statusfinder";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { is_buyrent } from "../Helpers/dept_helper";

const ApproveButton = () => {
  const { brtabledata, setbrtabledata } = useBrTableData();

  const userInfo = useUserInfo();
  const { showmodal, setShowModal, resetShowModal } = useToggleModal();
  const { setErrorMessage, clearErrorMessage } = useErrorMessage();
  const { setShowToast, resetshowtoast } = useToast();
  const dept = is_buyrent(userInfo?.dept_code) ? "buyvsrent" : "";

  const updateStatement = async (cs_id, changestatus) => {
    let file = "";
    let filename = "";
    if (brtabledata.file != "") {
      file = brtabledata.file;
      filename = brtabledata.filename;
    }
    try {
      await updatebrstatements({
        cs_id,
        status: changestatus,
        userInfo,
        file,
        filename,
      });
      BrEmailAlert(cs_id, userInfo, dept, brtabledata).catch((err) => {
        const message = err?.response?.data || err?.message || "Email failed";
        setErrorMessage(message);
      });

      setShowToast();
      setbrtabledata((prev) => ({
        ...prev,
        status: changestatus,
        sentforapproval: "yes",
      }));
      setTimeout(() => {
        resetshowtoast();
        resetShowModal();
      }, 1500);
    } catch (error) {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 1500);
    }
  };

  const nextstatus = userInfo.role?.some((role) =>
    brtabledata?.status?.toLowerCase()?.includes(role.toLowerCase()),
  )
    ? "Approve/Reject"
    : brtabledata?.status === "created"
      ? "Sent for Approval"
      : brtabledata?.status || "";

  const isentforapproval = brtabledata.sentforapproval;
  const buttontxt = isentforapproval
    ? nextstatus
    : brtabledata.status == "created"
      ? "Sent for Approval"
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

  const changestatus = expectedstatusplant(userInfo?.role);

  return (
    <>
      <button
        className={`  text-white rounded  shadow items-center font-semibold  transition-colors ${buttonclass}`}
        onClick={() => setShowModal()}
        disabled={isDisabled}
      >
        {buttontxt
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </button>
      {showmodal && userInfo?.is_admin && (
        <Alerts
          message={"Are you sure to Sent this statement for Approval?"}
          onCancel={() => resetShowModal()}
          onConfirm={() => updateStatement(brtabledata.id, changestatus)}
        />
      )}
      {showmodal && !userInfo?.is_admin && <ApprovalModalBR />}
    </>
  );
};

export default ApproveButton;
