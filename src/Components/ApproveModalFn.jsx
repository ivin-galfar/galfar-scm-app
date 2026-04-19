import { useToggleModal } from "../store/brStore";
import { LuRotateCcwSquare } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { useToast } from "../store/toastStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useErrorMessage } from "../store/errorStore";
import { statusExpected } from "../Helpers/statusfinder";
import { FnEmailAlert, updatefilenotevalues } from "../APIs/api";
import { useComments } from "../store/helperStore";
import { is_plant } from "../Helpers/dept_helper";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const ApproveModalFn = ({ selectedvalue: data, setSelectedValue }) => {
  const userInfo = useUserInfo();
  const { resetShowModal } = useToggleModal();
  const { clearErrorMessage, setErrorMessage, errormessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { setComments, comments, resetComments } = useComments();
  const [isreviewclicked, setIsReviewClicked] = useState(false);

  const dept = is_plant(userInfo?.dept_code) ? "plant" : "";
  const { mutate: updatestatement } = useMutation({
    mutationFn: updatefilenotevalues,
    onSuccess: async (data) => {
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        resetShowModal();
        resetComments();
      }, 1500);
      try {
        await FnEmailAlert(data.id, userInfo, dept, data);
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
  const submitApproval = (status) => {
    let updatedstatus = "";
    if (status == "approved") {
      updatedstatus = statusExpected(
        userInfo?.role,
        null,
        data.type,
        data.category,
      );

      setSelectedValue((prev) => ({
        ...prev,
        status: updatedstatus,
      }));
    } else if (status == "rejected") {
      updatedstatus = "rejected";
      setSelectedValue((prev) => ({
        ...prev,
        status: updatedstatus,
      }));
    } else {
      updatedstatus = "review";
      setSelectedValue((prev) => ({
        ...prev,
        status: updatedstatus,
      }));
    }

    updatestatement({
      status: updatedstatus,
      fnid: data.id,
      userInfo,
      comments,
      type: data.type,
      category: data.category,
    });
  };

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
        {isreviewclicked && (
          <div className="flex w-full">
            <textarea
              rows={3}
              placeholder="Enter your comments here..."
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              onChange={(e) => setComments(e.target.value)}
              value={comments}
            />
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            onClick={() => submitApproval("approved")}
          >
            Approve
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
            onClick={() => submitApproval("rejected")}
          >
            Reject
          </button>
          <button
            className={`px-4 py-2 flex items-center gap-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition ${isreviewclicked && !comments?.trim() ? "cursor-pointer" : "cursor-pointer"}`}
            onClick={() => {
              if (isreviewclicked) {
                submitApproval("review");
              } else {
                setIsReviewClicked(true);
              }
            }}
          >
            <LuRotateCcwSquare /> Send For Review
          </button>
        </div>
        {showtoast && !errormessage && data.status == "review" && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have send this Statement for review!
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
