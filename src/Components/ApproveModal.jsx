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
import { is_plant } from "../Helpers/dept_helper";
import { useClickFromDashboard, useComments } from "../store/helperStore";
import { generatePDFHire } from "../Helpers/helperfunctions";
import { fetchReceiptsApproverDetails } from "../APIs/api";
import { statusMapping } from "../Helpers/roles_helper";

const ApproveModal = ({ setShowmodal, cs_id, doc_no }) => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [lastAction, setLastAction] = useState("");
  const dept = is_plant(userInfo?.dept_code) ? "plant" : "";

  const {
    setSharedTableData,
    sharedTableData,
    setIsMRSelected,
    setSelectedMr,
    setMultiStatusFilter,
  } = useContext(AppContext);

  const { setClearTable } = useClearStatementTable();
  const { resetSortVendors } = useSortVendors();
  const { comments, setComments, resetComments } = useComments();
  const navigate = useNavigate();
  const { isClicked } = useClickFromDashboard();

  const expectedStatuses = (userInfo?.role || []).flatMap((role) =>
    (statusMapping[role.toLowerCase()] || []).map((s) => s.toLowerCase()),
  );
  const pendingStatuses = !userInfo?.is_admin
    ? expectedStatuses.filter(
        (s) =>
          s.startsWith("pending") &&
          userInfo.role?.some((r) => s.includes(r.toLowerCase())),
      )
    : expectedStatuses.filter((s) => s.startsWith("pending"));

  const submitApproval = async (cs_id, status) => {
    let finalStatus = "";
    let rejectedBy = "";
    let approverDetails = [];
    let generatedPdfUrl = "";
    if (status === "rejected") {
      finalStatus = "Rejected";
      rejectedBy = userInfo.role;
    } else if (userInfo.role?.includes("hod") && status === "approved") {
      finalStatus = "Pending for GM";
    } else if (userInfo.role?.includes("gm") && status === "approved") {
      finalStatus = "Pending for CEO";
    } else if (userInfo.role?.includes("ceo") && status === "approved") {
      approverDetails = await fetchReceiptsApproverDetails(
        sharedTableData.formData.id,
        userInfo,
      );

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
      const currentApproval = await axios.put(
        `${REACT_SERVER_URL}/receipts/approver/${cs_id}`,
        {
          userId: userInfo.id,
          role: userInfo.role[0],
          approverstatus: finalStatus,
          action: status,
          approverComments: comments,
          rejectedby: rejectedBy,
          status: finalStatus,
        },
        config,
      );
      approverDetails.push(currentApproval.data[0]);
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        if (isClicked) {
          navigate("/pendingdashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        setMultiStatusFilter(pendingStatuses);
        setShowToast(false);
        resetComments();
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
        navigate("/dashboard", { replace: true });
        setMultiStatusFilter(pendingStatuses);
        setShowToast(true);
        setErrormessage("");
        setTimeout(() => {
          setShowmodal(false);
          setShowToast(false);
        }, 1500);
      } else {
        const updatedSharedTableData = {
          ...sharedTableData,
          formData: {
            ...sharedTableData.formData,
            status: finalStatus,
            approverstatus: finalStatus,
            rejectedby: rejectedBy,
            approverComments: comments,
            approverdetails: approverDetails,
          },
        };

        setSharedTableData(updatedSharedTableData);
        generatedPdfUrl = await generatePDFHire(
          updatedSharedTableData,
          userInfo,
          true,
        );
      }

      axios
        .post(
          `${REACT_SERVER_URL}/emailnotify/${cs_id}?dept=${dept}`,
          {
            userInfo,
            formData: sharedTableData.formData,
            status: finalStatus,
            doc_no: doc_no,
            approvedPdfUrl: generatedPdfUrl,
          },
          config,
        )
        .then((res) => console.log("✅ Email sent:", res.data))
        .catch((err) =>
          console.error("❌ Email send failed:", err.response.data.message),
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
                <div className="flex gap-2 justify-center items-center">
                  <RxCross1 /> You have Rejected this Statement!
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
