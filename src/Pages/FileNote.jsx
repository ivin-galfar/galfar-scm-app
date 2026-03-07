import { useEditorInfo } from "../CustomHooks/useEditorInfo";
import { SimpleEditor } from "../@/components/tiptap-templates/simple/simple-editor";
import { useMutation } from "@tanstack/react-query";
import { createfilenote, updatefilenotevalues } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { act, useState } from "react";
import FileNoteDropDown from "../Components/FileNoteDropDown";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Buttontext from "../Components/Buttontext";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { statusExpected } from "../Helpers/statusfinder";
import { useToggleModal } from "../store/brStore";
import Alerts from "../Components/Alerts";
import { useDatasaved } from "../store/brStore";
import { BsAsterisk } from "react-icons/bs";

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
      setErrorMessage("");
      setShowToast(true);
      setTimeout(() => {
        resetshowtoast();
        setShowToast(false);
        clearErrorMessage();
        resetShowModal();
      }, 1500);
    },
    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
    },
  });

  const handleSave = (action) => {
    const status = statusExpected(userInfo?.role, "plant");
    if (action != "update") {
      newfilenote({ name, content: editorinfo, dept_id, userInfo });
    } else {
      updatefilenote({
        status: status,
        sentforapproval: selectedvalue.sentforapproval,
        fnid: selectedvalue.id,
        userInfo,
      });
    }
  };
  const nextstatus = selectedvalue?.status?.includes(
    userInfo.role.toLowerCase(),
  )
    ? "Approve/Reject"
    : selectedvalue?.status == "created"
      ? "Sent for Approval"
      : selectedvalue?.status || "";

  return (
    <div className="flex flex-grow flex-col ">
      <div className="flex gap-5">
        <div className="w-1/7 py-2 gap-10 flex p-4 items-center">
          <span className="flex ml-4  justify-center font-semibold text-sm px-2 py-2  gap-2 h-10 bg-blue-600 rounded-2xl text-white items-center cursor-pointer">
            {" "}
            {!newfn && <FaPlus />}
            <button
              className="text-white bg-brand border border-transparent hover:bg-brand-strong shadow-xs font-medium leading-5 rounded-lg text-sm px-2 py-2  focus:outline-none cursor-pointer"
              type="button"
              onClick={() => {
                setNewfn(!newfn);
                setSelectedFnValue("");
                setSelectedValue("");
                setName("");
                navigate("/filenote/");
              }}
            >
              {!newfn ? "Create File Note" : "Choose File Note"}
            </button>
          </span>
        </div>
        {!newfn && (
          <FileNoteDropDown
            setSelectedFnValue={setSelectedFnValue}
            setSelectedValue={setSelectedValue}
          />
        )}
        {newfn && selectedvalue.id == null && (
          <div className="flex items-center gap-4 p-4">
            <label className="font-medium flex">
              File Note: <BsAsterisk size={6} color="red" />
            </label>
            <input
              type="text"
              placeholder="Enter file note name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded-lg w-96"
            />
          </div>
        )}
      </div>
      <SimpleEditor content={selectedfnvalue} newfn={newfn} />
      {((newfn && name != "") ||
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

      {showtoast && userInfo?.is_admin && (
        <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have successfully created the File Note!
        </div>
      )}
      {showtoast &&
        userInfo?.is_admin &&
        selectedvalue.status == "pending for hod" && (
          <div className="fixed top-5 left-1/2 z-60 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have requested the Statement for approval!
          </div>
        )}
    </div>
  );
};

export default FileNote;
