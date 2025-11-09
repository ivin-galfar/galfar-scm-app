import { useContext, useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { AppContext } from "./Context";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useNavigate } from "react-router-dom";
import { LuRotateCcwSquare } from "react-icons/lu";
import {
  useClearStatementTable,
  useSortVendors,
} from "../store/statementStore";
import { RxCross1 } from "react-icons/rx";

const ApproveModal = ({ setShowmodal, cs_id }) => {
  const [comments, setComments] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [lastAction, setLastAction] = useState("");

  const {
    setSharedTableData,
    sharedTableData,
    setIsMRSelected,
    setSelectedMr,
  } = useContext(AppContext);

  const { setClearTable } = useClearStatementTable();
  const { resetSortVendors } = useSortVendors();
  const userInfo = useUserInfo();
  const navigate = useNavigate();
  const submitApproval = async (cs_id, status) => {
    let finalStatus = "";
    let rejectedBy = "";
    if (status === "rejected") {
      finalStatus = "Rejected";
      rejectedBy = userInfo.role;
    } else if (userInfo.role === "hod" && status === "approved") {
      finalStatus = "Pending for GM";
    } else if (userInfo.role === "gm" && status === "approved") {
      finalStatus = "Pending for CEO";
    } else if (userInfo.role === "ceo" && status === "approved") {
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
      await axios.put(
        `${REACT_SERVER_URL}/receipts/approver/${cs_id}`,
        {
          userId: userInfo.id,
          role: userInfo.role,
          approverstatus: finalStatus,
          action: status,
          approverComments: comments,
          rejectedby: rejectedBy,
          status: finalStatus,
        },
        config
      );
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
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
        navigate("/receipts", { replace: true });
        setShowToast(true);
        setComments("");
        setErrormessage("");
        setTimeout(() => {
          setShowmodal(false);
        }, 500);
        setTimeout(() => {
          setShowToast(false);
        }, 1500);
      } else {
        setSharedTableData((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            status: finalStatus,
            approverstatus: finalStatus,
            rejectedby: rejectedBy,
            approverComments: comments,
          },
        }));
      }

      axios
        .post(
          `${REACT_SERVER_URL}/emailnotify/${cs_id}`,
          {
            userInfo,
            formData: sharedTableData.formData,
            status: finalStatus,
          },
          config
        )
        .then((res) => console.log("✅ Email sent:", res.data.emailInfo))
        .catch((err) =>
          console.error("❌ Email send failed:", err.response.data.message)
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
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
            onClick={() => setShowmodal(false)}
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
              onClick={() => submitApproval(cs_id, "approved")}
            >
              Approve
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
              onClick={() => submitApproval(cs_id, "rejected")}
            >
              Reject
            </button>
            <button
              className="px-4 py-2 flex items-center gap-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer"
              onClick={() => submitApproval(cs_id, "review")}
            >
              <LuRotateCcwSquare /> Send For Review
            </button>
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
                <div className="flex items-center gap-2">
                  <RxCross1 />
                  <span>You have Rejected this Statement!</span>
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
    </div>
  );
};

export default ApproveModal;
