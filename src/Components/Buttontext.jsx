import { useToggleModal } from "../store/brStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { formatwords } from "../Helpers/helperfunctions";

const Buttontext = ({ issentforapproval, nextstatus, data }) => {
  const userInfo = useUserInfo();
  const { showmodal, setShowModal, resetShowModal } = useToggleModal();

  const buttontxt = issentforapproval
    ? nextstatus
    : data.status == "created"
      ? "Sent for Approval"
      : "Create Document";

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

  return (
    <div>
      <div
        className={` text-white rounded  shadow items-center font-semibold  transition-colors ${buttonclass}`}
        onClick={() => setShowModal()}
      >
        {formatwords(buttontxt)}
      </div>
    </div>
  );
};

export default Buttontext;
