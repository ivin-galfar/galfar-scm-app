import { useMutation } from "@tanstack/react-query";
import { useBrTableData, useToggleModal } from "../store/brStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import ApprovalModalBR from "./ApprovalModalBR";
import Alerts from "./Alerts";
import { updatebrstatements } from "../APIs/api";
import { expectedstatusplant } from "../Helpers/statusfinder";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";

const ApproveButton = () => {
  const { brtabledata, setbrtabledata } = useBrTableData();

  const userInfo = useUserInfo();
  const { showmodal, setShowModal, resetShowModal } = useToggleModal();
  const { setErrorMessage, errormessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const updateStatement = async (cs_id, changestatus) => {
    try {
      await updatebrstatements({ cs_id, status: changestatus, userInfo });
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

  const nextstatus = brtabledata?.status?.includes(userInfo.role.toLowerCase())
    ? "Approve/Reject"
    : brtabledata?.status == "created"
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
    buttontxt == "rejected"
      ? "px-10 py-2  bg-gray-400 cursor-not-allowed"
      : buttontxt != ""
        ? "px-10 py-2 bg-blue-600  hover:bg-blue-700 cursor-pointer"
        : "";
  const isDisabled =
    buttonclass.includes("bg-gray-400") ||
    buttontxt == "approved" ||
    buttontxt == "rejected";

  const changestatus = expectedstatusplant(userInfo?.role.toLowerCase());

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
