import { useState } from "react";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { useStatement } from "../store/logisticsStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { expectedstatus, role_finder } from "../Helpers/statusfinder";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { EmailAlert } from "../APIs/api";
import { is_logistics } from "../Helpers/dept_helper";

const ApproveModallog = ({ setShowmodal, cs_id }) => {
  const { setErrorMessage, errormessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { formData, setFormData, setTableData } = useStatement();
  const [comments, setComments] = useState("");
  const userInfo = useUserInfo();
  const navigate = useNavigate();
  const dept = is_logistics ? "logistics" : "";

  const submitApproval = async (cs_id, status) => {
    let definedprojects = [
      7092, 7112, 7099, 7110, 7111, 7114, 7108, 7105, 7097, 7102, 7104, 7106, 1,
    ];
    let project = Number(formData.project?.trim());
    if (!definedprojects.includes(project)) {
      setShowToast();
      setErrorMessage(
        "Mentioned Project not found. Please contact initiator!!"
      );
      setTimeout(() => {
        resetshowtoast();
        setShowmodal(false);
        clearErrorMessage();
      }, 1000);
      return;
    }
    let updatedstatus = "";

    if (status == "approved") {
      updatedstatus = expectedstatus(userInfo.role.toLowerCase());
    } else {
      updatedstatus = "rejected";
    }
    let updatedFormData = {
      ...formData,
      status: updatedstatus,
    };

    let comments_role = role_finder(userInfo.role.toLowerCase());
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        `${REACT_SERVER_URL}/logistics/updatestatement/${cs_id}`,
        {
          updatedstatus,
          [comments_role]: comments,
          rejectedby: updatedstatus === "rejected" ? userInfo.role : undefined,
        },
        config
      );

      if (updatedstatus.toLowerCase() == "review") {
        updatedFormData = {
          cargo_details: "",
          gross_weight: "",
          chargeable_weight: "",
          description: "",
          supplier: "",
          scopeofwork: "",
          mode: "",
          date: "",
          po: "",
          project: "",
          shipment_no: "",
          status: "",
          sentforapproval: "",
          recommendation_reason: "",
          file: [],
          filename: [],
          created_at: "",
          edited_count: 0,
          lastupdated: null,
        };
        setTableData([]);
        navigate(`/lstatements`, { replace: true });
      }

      setFormData(updatedFormData);
      setShowToast();
      setTimeout(() => {
        setShowmodal(false);
        resetshowtoast();
      }, 1500);
      setComments("");
    } catch (error) {
      const message = error?.response?.data || error.message;
      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        setShowmodal(false);
        clearErrorMessage();
      }, 1000);
      return;
    }
    try {
      await EmailAlert(cs_id, userInfo, dept, updatedFormData);
    } catch (error) {
      const message = error?.response?.data.message;
      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        setShowmodal(false);
      }, 1000);
      return;
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
            {/* <button
              className="px-4 py-2 flex items-center gap-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer"
              onClick={() => submitApproval(cs_id, "review")}
            >
              <LuRotateCcwSquare /> Send For Review
            </button> */}
          </div>
          {showtoast &&
            !errormessage &&
            formData.status !== "rejected" &&
            formData.status !== "review" && (
              <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
                ✅ You have Approved this Statement!
              </div>
            )}{" "}
          {showtoast && formData.status == "rejected" && !errormessage && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              <RxCross1 /> You have Rejected this Statement!
            </div>
          )}
          {/* {showtoast && lastAction == "review" && !errormessage && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
              You have successfully sent back the statement to Initiator for
              Review!!
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ApproveModallog;
