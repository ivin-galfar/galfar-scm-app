import { useEditorInfo } from "../CustomHooks/useEditorInfo";
import { SimpleEditor } from "../@/components/tiptap-templates/simple/simple-editor";
import { useMutation } from "@tanstack/react-query";
import { createfilenote, fetchlastid, updatefilenotevalues } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { act, useEffect, useState } from "react";
import FileNoteDropDown from "../Components/FileNoteDropDown";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Buttontext from "../Components/Buttontext";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { statusExpected } from "../Helpers/statusfinder";
import { useImageSaved, useToggleModal } from "../store/brStore";
import Alerts from "../Components/Alerts";
import { useDatasaved } from "../store/brStore";
import { BsAsterisk } from "react-icons/bs";
import ApproveModalFn from "../Components/ApproveModalFn";
import {
  dept_finder,
  dept_finder_asadmin,
  is_plant,
} from "../Helpers/dept_helper";
import { fileNoteTemplate } from "../Helpers/filenote_template";
import { useQuery } from "@tanstack/react-query";
import AttachmentsContainer from "../Components/AttachmentContainer";
import { useAttachments } from "../store/helperStore";
import { getcategory } from "../Helpers/category_helper";
import { getType } from "../Helpers/helperfunctions";

const FileNote = () => {
  const editorinfo = useEditorInfo();
  const userInfo = useUserInfo();
  const dept_id = userInfo.dept_code[0];
  const [name, setName] = useState("");
  const [newfn, setNewfn] = useState(false);
  const [selectedfnvalue, setSelectedFnValue] = useState("");
  const [selectedvalue, setSelectedValue] = useState("");
  const { setErrorMessage, clearErrorMessage } = useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const navigate = useNavigate();
  const { showmodal, setShowModal, resetShowModal } = useToggleModal();
  const { setDataSaved, resetDataSaved } = useDatasaved();
  const isPlant = is_plant(userInfo?.dept_code);
  const [type, settype] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const { attachments, setAttachments } = useAttachments();
  const { imagesaved } = useImageSaved();

  const { data: doc_no } = useQuery({
    queryKey: ["doc_no", userInfo, type, category],
    queryFn: () => fetchlastid({ dept_id, type, category, userInfo }),
    enabled: !!userInfo && !!type,
  });

  const { mutate: newfilenote } = useMutation({
    mutationFn: createfilenote,
    onSuccess: (data) => {
      navigate(`/filenote/${data.id}`);
      setErrorMessage("");
      setShowToast();
      setSelectedValue(data);
      setDataSaved();
      setTimeout(() => {
        resetshowtoast();
        resetShowModal();
        setName("");
        resetDataSaved();
        setNewfn(false);
      }, 1500);
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

  const { mutate: updatefilenote } = useMutation({
    mutationFn: updatefilenotevalues,
    onSuccess: (data) => {
      setSelectedValue(data);
      setErrorMessage("");
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        resetshowtoast();
        clearErrorMessage();
        resetShowModal();
      }, 1500);
    },
    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
    },
  });

  const generateTemplate = () => {
    if (!doc_no || doc_no.last_no == null) return "";

    const dept = isPlant ? "P&E" : "Logistics";
    const categorytype = type === "file_note" ? "FN" : "IOC";
    console.log("doc_no_1");

    console.log(doc_no);
    console.log("doc_no");

    const ref_no = `${dept}/${categorytype}/${doc_no?.last_no + 1}`;
    const date = new Date().toDateString();

    return fileNoteTemplate(ref_no, name || " ", date);
  };
  // const handleDocumentType = (selectedtype) => {
  //   settype(selectedtype);
  //   // const dept = isPlant ? "P&E" : "Logistics";
  //   // const categorytype = selectedtype === "file_note" ? "FN" : "IOC";
  //   // const ref_no = `${dept}/${categorytype}/${doc_no.last_no + 1}`;
  //   // const date = new Date().toDateString();

  //   setCategories(getcategory(selectedtype));
  //   if (selectedtype === "file_note") {
  //     localStorage.setItem(
  //       "editorContent",
  //       JSON.stringify(fileNoteTemplate(ref_no, name, date)),
  //     );
  //     setSelectedFnValue(fileNoteTemplate(ref_no, name, date));
  //   } else {
  //     setSelectedFnValue("");
  //   }
  // };

  useEffect(() => {
    setCategories(getcategory(type));
    if (type === "file_note") {
      const template = generateTemplate();
      setSelectedFnValue(template);
      localStorage.setItem("editorContent", JSON.stringify(template));
    } else {
      setSelectedFnValue("");
    }
  }, [name, type, category, doc_no]);
  const handleDocumentcategorytype = (type) => {
    setCategory(type);
  };
  const nextstatus = userInfo.role.some((r) =>
    selectedvalue?.status?.toLowerCase().includes(r?.toLowerCase()),
  )
    ? "Approve/Reject"
    : selectedvalue?.status == "created"
      ? "Sent for Approval"
      : selectedvalue?.status || "";

  const handleSave = (action) => {
    const status = statusExpected(userInfo?.role, "save");
    const files = JSON.parse(localStorage.getItem("editorAttachments")) || [];

    const file_names = files.map((file) => file.name);
    const file_urls = files.map((file) => file.url);

    if (action != "update") {
      newfilenote({
        name,
        type,
        category,
        content: editorinfo,
        file_names,
        file_urls,
        dept_id,
        userInfo,
      });
    } else {
      updatefilenote({
        status: status,
        fnid: selectedvalue.id,
        userInfo,
        sentforapproval: selectedvalue.sentforapproval,
      });
    }
  };

  // const uploaded = JSON.parse(localStorage.getItem("editorAttachments")) || [];
  // const newfiles = uploaded.map((file) => file.url);
  // const newfilesnames = uploaded.map((file) => file.name);
  // console.log(attachments);

  return (
    <div className="flex flex-grow flex-col ">
      <div className="flex gap-5">
        {userInfo?.is_admin && (
          <div className="w-1/7 py-2 gap-10 flex p-4 items-center">
            <span className="flex ml-4  justify-center font-semibold text-sm px-2 py-2  gap-2 h-10 bg-blue-600 rounded-2xl text-white items-center cursor-pointer">
              {" "}
              {!newfn && <FaPlus />}
              <button
                className="text-white bg-brand border border-transparent hover:bg-brand-strong shadow-xs font-medium leading-5 rounded-lg text-sm px-2 py-2  focus:outline-none cursor-pointer "
                type="button"
                onClick={() => {
                  setNewfn(!newfn);
                  setSelectedFnValue("");
                  setSelectedValue("");
                  setName("");
                  navigate("/filenote/");
                  setCategory("");
                  setAttachments("");
                  settype("");
                }}
              >
                {!newfn ? "Create FN/IOC" : "View Document"}
              </button>
            </span>
          </div>
        )}
        {!newfn && (
          <FileNoteDropDown
            setSelectedFnValue={setSelectedFnValue}
            setSelectedValue={setSelectedValue}
          />
        )}

        {selectedvalue?.id != null && (
          <div className="flex justify-center items-center gap-8 px-4 py-2 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Type:</span>
              <span className="text-blue-600 font-semibold">
                {getType(selectedvalue.type)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Category:</span>
              <span className="text-blue-600 font-semibold">
                {selectedvalue?.category?.charAt(0).toUpperCase() +
                  selectedvalue?.category?.slice(1)}
              </span>
            </div>
          </div>
        )}
        {userInfo?.is_admin && newfn && (
          <div className="flex justify-center items-center gap-8  px-2 py-2 rounded-md">
            <label className="font-medium flex">
              Type: <BsAsterisk size={6} color="red" />{" "}
            </label>
            <select
              value={type}
              onChange={(e) => settype(e.target.value)}
              className="w-50 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-medium 
             text-gray-800 bg-white  cursor-pointer
             hover:border-blue-400 hover:shadow-lg transition-all duration-200
             focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
             bg-no-repeat bg-right pr-12"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.9rem center",
              }}
            >
              <option value="">📋 Select Type</option>
              <option value="file_note">File Note</option>
              <option value="ioc">Inter Office Correspondence</option>
            </select>
            <label className="font-medium flex">
              Category: <BsAsterisk size={6} color="red" />{" "}
            </label>
            <select
              value={category}
              onChange={(e) => handleDocumentcategorytype(e.target.value)}
              className="w-50 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-medium h-
             text-gray-800 bg-white  cursor-pointer
             hover:border-blue-400 hover:shadow-lg transition-all duration-200
             focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
             bg-no-repeat bg-right pr-12"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.9rem center",
              }}
            >
              <option value="">📋 -- Select Category -- </option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
        {newfn && selectedvalue.id == null && (
          <div className="flex items-center gap-2 p-4">
            <label className="font-medium flex">
              Subject: <BsAsterisk size={6} color="red" />
            </label>
            <input
              type="text"
              placeholder="Enter file note/IOC subject name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 border-gray-300 rounded-lg w-84"
            />
          </div>
        )}
        {selectedvalue.doc_no && (
          <div className="flex justify-center items-center gap-2  px-4 py-2 rounded-md ">
            <span className="text-gray-600 font-medium">Doc Id:</span>
            <span className="text-blue-600 font-semibold">
              {selectedvalue.doc_no}
            </span>
          </div>
        )}
      </div>
      {selectedvalue.doc_no && (
        <div className="flex justify-center items-center gap-2  px-4 py-2 rounded-md ">
          <span className="text-gray-600 font-medium">Department:</span>
          <span className="text-blue-600 font-semibold">
            {userInfo.is_admin
              ? dept_finder_asadmin(userInfo.dept_code)
              : dept_finder(selectedvalue.department_id)}
          </span>
        </div>
      )}
      <SimpleEditor
        content={selectedfnvalue}
        newfn={newfn}
        is_admin={userInfo.is_admin}
      />
      <div className="flex justify-between pb-10">
        {(selectedvalue.id || newfn) && (
          <AttachmentsContainer
            file={
              selectedvalue?.file ||
              (Array.isArray(attachments) ? attachments.map((a) => a.url) : [])
            }
            file_name={
              selectedvalue?.file_name ||
              (Array.isArray(attachments) ? attachments.map((a) => a.name) : [])
            }
          />
        )}

        {((newfn && name != "" && category) ||
          (!newfn && selectedvalue.id !== undefined)) && (
          <div className="flex mt-4 mr-20 p-5 justify-end items-end ">
            <button>
              <Buttontext
                issentforapproval={selectedvalue.sentforapproval}
                nextstatus={nextstatus}
                data={selectedvalue}
              />
            </button>
          </div>
        )}
      </div>

      {showmodal && userInfo?.is_admin && (
        <Alerts
          message={
            newfn
              ? "Are you sure to create the file note?"
              : "Are you confirm to send this filenote for approval?"
          }
          onCancel={() => resetShowModal()}
          onConfirm={() => handleSave(newfn ? "create" : "update")}
        />
      )}
      {showmodal && !userInfo?.is_admin && (
        <ApproveModalFn
          selectedvalue={selectedvalue}
          setSelectedValue={setSelectedValue}
        />
      )}

      {showtoast && userInfo?.is_admin && !imagesaved && (
        <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have successfully created the File Note/IOC!
        </div>
      )}
      {showtoast &&
        userInfo?.is_admin &&
        selectedvalue.status == "pending for hod" && (
          <div className="fixed top-5 left-1/2 z-60 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have requested the document for approval!
          </div>
        )}
      {showtoast &&
        !userInfo?.is_admin &&
        selectedvalue.status == "pending for fm" && (
          <div className="fixed top-5 left-1/2 z-60 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have approved the File Note/IOC!
          </div>
        )}
    </div>
  );
};

export default FileNote;
