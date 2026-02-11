import { useMutation } from "@tanstack/react-query";
import { updatebrstatements } from "../APIs/api";
import { useBrTableData, useToggleModal } from "../store/brStore";
import { LuRotateCcwSquare } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { useToast } from "../store/toastStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useErrorMessage } from "../store/errorStore";
import { expectedstatusplant } from "../Helpers/statusfinder";
import { useComments } from "../store/helperStore";

const ApprovalModalBR = () => {
  const { setShowModal, resetShowModal } = useToggleModal();
  const { setErrorMessage, errormessage } = useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const userInfo = useUserInfo();
  const { brtabledata: data, setbrtabledata } = useBrTableData();
  const { comments, setComments, resetComments } = useComments();

  const { mutate: updatestatement } = useMutation({
    mutationFn: updatebrstatements,
    onSuccess: () => {
      setShowToast();
      setTimeout(() => {
        // resetshowtoast();
        resetShowModal();
        resetComments();
      }, 1500);
    },

    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
    },
  });

  const submitApproval = (cs_id, status) => {
    let updatedstatus = "";
    if (status == "approved") {
      updatedstatus = expectedstatusplant(userInfo?.role);
      setbrtabledata((prev) => ({
        ...prev,
        status: updatedstatus,
      }));
    } else if (status == "rejected") {
      updatedstatus = "rejected";
      setbrtabledata((prev) => ({
        ...prev,
        status: updatedstatus,
      }));
    } else {
      updatedstatus = "review";
    }
    updatestatement({ cs_id, status: updatedstatus, userInfo, comments });
  };
  console.log(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
          onClick={() => resetShowModal()}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Approve/Reject
        </h2>
        <div className="flex w-full">
          <textarea
            rows={3}
            placeholder="Enter your comments here..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            onClick={() => submitApproval(data.id, "approved")}
          >
            Approve
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
            onClick={() => submitApproval(data.id, "rejected")}
          >
            Reject
          </button>
          <button
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer"
            onClick={() => submitApproval(data.id, "review")}
          >
            <LuRotateCcwSquare /> Send For Review
          </button>
        </div>
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

export default ApprovalModalBR;
