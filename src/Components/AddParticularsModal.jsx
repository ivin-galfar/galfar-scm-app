import React, { useContext, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import useUserInfo from "../CustomHooks/useUserInfo";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { MdOutlineErrorOutline } from "react-icons/md";
import { AppContext } from "./Context";
import { useStatementupdated } from "../store/statementStore";
import { useParams } from "react-router-dom";

const AddParticularsModal = ({ setShowmodal }) => {
  const [fields, setFields] = useState(Array(5).fill(""));
  const [templatename, setTemplateName] = useState("");
  const userInfo = useUserInfo();
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { setshowupdated } = useStatementupdated();
  const { dept_id } = useParams();

  const name = userInfo?.email.split("@")[0];
  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const handleSubmit = async (e) => {
    const filteredfields = fields.filter((f) => f.trim() !== "");
    if (templatename == "" || fields == "") {
      setShowToast(true);
      setErrormessage("Please fill the required fields!!");
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      return;
    }
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        `${REACT_SERVER_URL}/particulars`,
        {
          created: {
            owner: formattedName,
          },
          template: {
            name: templatename,
            particulars: filteredfields,
          },
          dept_code: dept_id,
        },
        config
      );

      setShowToast(true);
      setshowupdated();
      setTimeout(() => {
        setShowmodal(false);
        setShowToast(false);
      }, 1500);
    } catch (error) {
      let message = error?.response?.data;
      setErrormessage(message ? message : error.message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  const addField = () => {
    setFields((prev) => [...prev, ""]);
  };

  const updateField = (index, val) => {
    setFields((prev) => {
      if (!val || val.trim() === "") return;
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
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
            Add New Template
          </h2>

          <div className="max-h-[400px] space-y-4 overflow-y-auto overflow-x-hidden min-h-14 px-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                name="name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Template name"
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            {fields?.map((val, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Particulars - Field {index + 1}
                  </label>
                  <input
                    name={`particular-${index}`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter value for Field ${index + 1}`}
                    value={val}
                    onChange={(e) => updateField(index, e.target.value)}
                  />
                </div>
                {index == fields.length - 1 && (
                  <button
                    className="px-4 py-2 cursor-pointer"
                    onClick={addField}
                  >
                    <CiCirclePlus size={20} />{" "}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setShowmodal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
        {showToast && !errormessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ Particular template saved successfully!
          </div>
        )}
        {showToast && errormessage && (
          <div className="flex gap-2 items-center  fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            <MdOutlineErrorOutline /> {errormessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddParticularsModal;
