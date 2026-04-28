import { useEditorInfo } from "../CustomHooks/useEditorInfo";
import { SimpleEditor } from "../@/components/tiptap-templates/simple/simple-editor";
import { useMutation } from "@tanstack/react-query";
import {
  createfilenote,
  fetchlastid,
  FnEmailAlert,
  updatefilenotevalues,
} from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { act, useEffect, useState } from "react";
import FileNoteDropDown from "../Components/FileNoteDropDown";
import { FaPlus } from "react-icons/fa6";
import { data, useNavigate } from "react-router-dom";
import Buttontext from "../Components/Buttontext";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { statusExpected } from "../Helpers/statusfinder";
import { useImageSaved, useToggleModal } from "../store/brStore";
import Alerts from "../Components/Alerts";
import { useDatasaved } from "../store/brStore";
import { BsAsterisk } from "react-icons/bs";
import ApproveModalFn from "../Components/ApproveModalFn";
import { format } from "date-fns";
import {
  dept_finder,
  dept_finder_asadmin,
  is_plant,
} from "../Helpers/dept_helper";
import { fileNoteTemplate } from "../Helpers/filenote_template";
import { useQuery } from "@tanstack/react-query";
import AttachmentsContainer from "../Components/AttachmentContainer";
import {
  useAttachments,
  useCategories,
  useComments,
  usenewfn,
  useProjectCodes,
  useSelectedProject,
} from "../store/helperStore";
import { getcategory } from "../Helpers/category_helper";
import {
  getCategoryforUI,
  getCCValue,
  getCMFromValue,
  getType,
} from "../Helpers/helperfunctions";
import TypeFilter from "../Components/TypeFilter";
import { IoSave } from "react-icons/io5";
import { MdModeEdit } from "react-icons/md";
import { FaUndoAlt } from "react-icons/fa";

const FileNote = () => {
  const editorinfo = useEditorInfo();
  const userInfo = useUserInfo();
  const dept_id = userInfo.dept_code[0];
  const [name, setName] = useState("");
  const { newfn, setNewfn } = usenewfn();
  const [selectedfnvalue, setSelectedFnValue] = useState("");
  const [selectedvalue, setSelectedValue] = useState("");
  const [dataupdated, setDataUpdated] = useState(false);
  const [recall, setRecall] = useState(false);
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const navigate = useNavigate();
  const { showmodal, setShowModal, resetShowModal } = useToggleModal();
  const { setDataSaved, resetDataSaved } = useDatasaved();
  const isPlant = is_plant(userInfo?.dept_code);
  const [type, settype] = useState("");
  const [category, setCategory] = useState("");
  const { attachments, setAttachments } = useAttachments();
  const { imagesaved } = useImageSaved();
  const { projectcodes, setProjectCodes } = useProjectCodes();
  const { selectedproject, setSelectedProject, resetSelectedproject } =
    useSelectedProject();
  const { categories, setCategories } = useCategories();
  const dept = is_plant(userInfo?.dept_code) ? "plant" : "";
  const isReview = selectedvalue.status == "review";
  const isEdit = selectedvalue.status == "edit";

  const { data: doc_no, isLoading: isDocLoading } = useQuery({
    queryKey: ["doc_no", userInfo, type, category, selectedproject],
    queryFn: () =>
      fetchlastid({ dept_id, userInfo, type, category, selectedproject }),
    enabled: !!userInfo && !!type,
    staleTime: 0,
    gcTime: 0,
  });

  const { mutate: newfilenote } = useMutation({
    mutationFn: createfilenote,
    onSuccess: (data) => {
      navigate(`/filenote/${data.id}`);
      setErrorMessage("");
      setShowToast();
      setSelectedValue(data);
      setDataSaved();
      setNewfn(false);
      setTimeout(() => {
        resetshowtoast();
        resetSelectedproject();
        resetShowModal();
        setName("");
        resetDataSaved();
      }, 1500);
    },
    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetShowModal();
      }, 1500);
    },
  });

  const { mutate: updatefilenote } = useMutation({
    mutationFn: updatefilenotevalues,
    onSuccess: async (data) => {
      if (data.status == "created") setDataUpdated(true);
      setSelectedValue(data);
      setErrorMessage("");
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetShowModal();
        setDataUpdated(false);
      }, 1500);
      try {
        await FnEmailAlert(data.id, userInfo, dept, data);
      } catch (err) {
        console.log(err);

        const message =
          err?.response?.data?.message || err?.message || "Email failed";
        setErrorMessage(message);
      }
    },

    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetShowModal();
      }, 1500);
    },
  });

  const generateTemplate = async (category, type) => {
    if (!doc_no || doc_no.last_no == null) return "";
    const dept = isPlant ? "P&E" : "Logistics";
    const typedefined = type === "file_note" ? "FN" : "IOC";
    const ref_no = [
      typedefined ?? "",
      category !== "Demob" ? dept || "" : "",
      category ?? "",
      selectedproject ?? "",
      (doc_no?.last_no ?? 0) + 1,
    ]
      .filter(Boolean)
      .join("/");
    const date = new Date().toDateString();
    const formattedDate = format(date, "do MMMM yyyy");
    const cleanCategory = category?.trim();
    const ccvalue = selectedproject
      ? await getCCValue(category, selectedproject, userInfo)
      : "";
    const cmname = selectedproject
      ? await getCMFromValue(category, selectedproject, userInfo)
      : "";

    return fileNoteTemplate(
      ref_no,
      name || " ",
      formattedDate,
      type,
      cleanCategory,
      ccvalue,
      cmname,
    );
  };

  useEffect(() => {
    if (userInfo?.role.includes("initpr") && category == "Demob" && !name) {
      setName("Demobilization of Vehicle/Equipment");
    } else if (userInfo.role.includes("initfn") && category == "ADTSRen") {
      setName("ADTS Payments for CICPA Renewal -   Units (  Months)");
    } else if (userInfo.role.includes("initfn") && category == "ADTSNew") {
      setName("ADTS Payments for Al Dhafra New Vehicle -  Units (  months)");
    } else if (userInfo.role.includes("initfn") && category == "PR") {
      setName("Return of Police Vehicle");
    } else if (userInfo.role.includes("initfn") && category == "FC") {
      setName("ADNOC Fuel Chip (Petrol)");
    } else if (userInfo.role.includes("initfn") && category == "Insurance") {
      setName("Insurance for ");
    } else if (userInfo.role.includes("initfn") && category == "TFW") {
      setName(
        "Approval Request for Traffic fine paid/to be paid by Galfar for ADNOC allotted/Galfar Vehicles ",
      );
    } else if (userInfo.role.includes("initfn") && category == "DPR") {
      setName("Request for ");
    } else if (userInfo.role.includes("initdc") && category == "FWA") {
      setName("Friday Work Approval - ");
    } else {
      setName("");
    }
  }, [category, userInfo]);

  useEffect(() => {
    let cat = [];
    if (userInfo.role.includes("initpr")) {
      cat = getcategory(type).filter((c) => c.includes("Demob"));
    } else if (userInfo.role.includes("initdc")) {
      cat = getcategory(type).filter((c) => c.includes("FWA"));
    } else {
      cat = getcategory(type).filter(
        (c) => !c.includes("Demob") && !c.includes("FWA"),
      );
    }

    setCategories(cat);

    if (type && newfn && !isDocLoading && doc_no) {
      generateTemplate(category, type).then((template) => {
        setSelectedFnValue(template);
        localStorage.setItem("editorContent", JSON.stringify(template));
      });
    } else if (!type) {
      setProjectCodes([]);
      resetSelectedproject();
      setSelectedFnValue("");
    }
  }, [type, category, selectedproject, doc_no, isDocLoading, newfn, name]);

  const nextstatus = userInfo.role.some((r) =>
    selectedvalue?.status?.toLowerCase().includes(r?.toLowerCase()),
  )
    ? "Approve/Reject"
    : selectedvalue?.status == "created"
      ? "Sent for Approval"
      : selectedvalue?.status !== "review"
        ? selectedvalue.status
        : "" || "";

  const handleSave = (action) => {
    const files = JSON.parse(localStorage.getItem("editorAttachments")) || [];

    const file_names = files.map((file) => file.name);
    const file_urls = files.map((file) => file.url);
    let status = "";
    if (action != "update") {
      // status = statusExpected(userInfo?.role, "save", type, category);

      if (
        (category == "Demob" || category == "FWA") &&
        selectedproject.length == 0
      ) {
        setErrorMessage("Please select the Project");
        setShowToast();
        setTimeout(() => {
          resetshowtoast();
          clearErrorMessage();
          resetShowModal();
        }, 1500);
        return;
      }
      newfilenote({
        name,
        type,
        category,
        content: editorinfo,
        file_names,
        file_urls,
        dept_id,
        userInfo,
        project: selectedproject,
        sentforapproval: null,
      });
    } else {
      const editorinfo = useEditorInfo();
      status = statusExpected(
        userInfo?.role,
        isReview || isEdit ? "update" : "save",
        selectedvalue.type,
        selectedvalue.category,
      );

      updatefilenote({
        status: status,
        fnid: selectedvalue.id,
        userInfo,
        sentforapproval: "yes",
        type: selectedvalue.type,
        category: selectedvalue.category,
        action: "save",
        content: editorinfo,
        attachments,
      });
      setRecall(false);
    }
  };
  const hasComments = (selectedvalue.approver_info || []).some(
    (v) => v.comment,
  );
  useEffect(() => {
    const files = selectedvalue?.file || [];
    const names = selectedvalue?.file_name || [];

    const newAttachments = files.map((url, index) => ({
      url,
      name: names[index] ?? "Unnamed file",
    }));

    setAttachments(newAttachments);
  }, [selectedvalue?.file, selectedvalue?.file_name]);

  const handleEdit = () => {
    updatefilenote({
      status: "edit",
      fnid: selectedvalue.id,
      userInfo,
    });
    setDataSaved();
  };

  return (
    <div className="flex flex-grow flex-col ">
      <div className="flex gap-4 p-4 items-center">
        {userInfo?.is_admin && (
          <div className="w-1/7 py-2 gap-10 flex p-4">
            <button
              type="button"
              onClick={() => {
                setNewfn();
                setSelectedFnValue("");
                setSelectedValue("");
                setName("");
                navigate("/filenote");
                setCategory("");
                setAttachments("");
                settype("");
              }}
              className="flex items-center justify-center gap-2 w-full h-12 p-4 
               bg-blue-600 hover:bg-blue-700 
               text-white font-semibold text-sm 
               rounded-xl shadow-sm hover:shadow-md 
               transition-all duration-200 cursor-pointer"
            >
              {!newfn && <FaPlus className="text-sm" />}
              {newfn ? "View Document" : "Create FN/IOC"}
            </button>
          </div>
        )}
        <div className="items-start flex">
          {!newfn && (
            <FileNoteDropDown
              setSelectedFnValue={setSelectedFnValue}
              setSelectedValue={setSelectedValue}
            />
          )}
        </div>

        {selectedvalue?.id != null && !newfn && (
          <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg shadow-md p-4 ">
            <div className="flex gap-6 w-full">
              <div className="flex-1 flex flex-col items-center justify-center   bg-white rounded-lg border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Type
                </span>
                <span className="text-blue-700 font-bold text-base text-center">
                  {getType(selectedvalue.type)}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-lg border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Category
                </span>
                <span className="text-green-700 font-bold text-base">
                  {getCategoryforUI(selectedvalue.category)}
                </span>
              </div>

              {selectedvalue.doc_no !== 0 && selectedvalue.doc_no && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-lg border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    Doc ID
                  </span>
                  <span className="text-purple-700 font-bold text-base">
                    {selectedvalue.doc_no}
                  </span>
                </div>
              )}

              {selectedvalue.project_code && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-lg border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    Project
                  </span>
                  <span className="text-orange-700 font-bold text-base">
                    {selectedvalue.project_code || selectedvalue.project || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {userInfo?.is_admin && newfn && (
          <TypeFilter
            isDocLoading={isDocLoading}
            type={type}
            category={category}
            projectcodes={projectcodes}
            settype={settype}
            setCategory={setCategory}
            setProjectCodes={setProjectCodes}
            categories={categories}
            selectedproject={selectedproject}
            setSelectedProject={setSelectedProject}
          />
        )}
        {newfn && (
          <div className="flex items-center gap-1 p-4">
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
        {isDocLoading && newfn && (
          <div className="flex items-center justify-center gap-2 p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 font-medium">
              Fetching ID...
            </span>
          </div>
        )}
      </div>
      {selectedvalue.doc_no && (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-2 flex items-center">
          {selectedvalue.category !== "FWA" ? (
            <div className="flex-1 flex items-center justify-center gap-2">
              <>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  Department
                </span>

                <span className="text-gray-700 font-bold text-base px-4 py-2">
                  {userInfo.is_admin
                    ? dept_finder_asadmin(userInfo.dept_code)
                    : dept_finder(selectedvalue.department_id)}
                </span>
              </>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="flex flex-col">
                <span className=" text-base font-bold uppercase tracking-wide ">
                  PROJECT - P10{selectedvalue?.project_code || "-"}
                </span>
              </div>
            </div>
          )}
          {userInfo?.is_admin && (isReview || isEdit) && (
            <span className="text-gray-500 cursor-pointer hover:text-gray-700">
              <IoSave
                size={20}
                color="green"
                onClick={() => handleSave("update")}
              />
            </span>
          )}
          {selectedvalue.status == "created" && userInfo?.is_admin && (
            <span className="text-gray-500 cursor-pointer hover:text-gray-700">
              <MdModeEdit size={20} color="red" onClick={handleEdit} />
            </span>
          )}
          {userInfo?.is_admin &&
            selectedvalue.status !== "approved" &&
            selectedvalue.status !== "rejected" &&
            selectedvalue.status !== "edit" &&
            selectedvalue.status !== "created" && (
              <span className="text-gray-500 cursor-pointer hover:text-gray-700">
                <FaUndoAlt
                  size={20}
                  color="#2563EB"
                  onClick={() => {
                    (setRecall(true), handleEdit());
                  }}
                />{" "}
              </span>
            )}
        </div>
      )}
      <SimpleEditor
        content={selectedfnvalue}
        newfn={newfn}
        is_admin={userInfo.is_admin}
        isreview={isReview}
        isedit={isEdit}
      />
      {hasComments && (
        <div className="sticky bottom-5 flex px-25">
          <div className="ml-auto max-w-sm bg-indigo-50 text-indigo-900 px-5 py-4 rounded-xl shadow-md border border-indigo-100">
            <div className="text-xs font-semibold mb-1 opacity-70">
              Comments
            </div>
            {[...(selectedvalue.approver_info || [])]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((val) => {
                const role = val.role
                  ? val.role.charAt(0).toUpperCase() + val.role.slice(1)
                  : "";

                if (!val.comment) return null;
                const roleColors = {
                  Hod: "text-purple-600",
                  Cm: "text-green-600",
                  Pm: "text-red-600",
                  Ceo: "text-blue-600",
                  Gm: "text-teal-600",
                };
                return (
                  <div key={val.id || val.date}>
                    {role && (
                      <span
                        className={`font-semibold ${roleColors[role] || "text-orange-600"}`}
                      >
                        {role}:
                      </span>
                    )}{" "}
                    {val.comment}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <div className="flex justify-between pb-10">
        {(selectedvalue.id || newfn) && (
          <AttachmentsContainer
            file={
              Array.isArray(attachments) ? attachments.map((a) => a.url) : []
            }
            file_name={
              Array.isArray(attachments) ? attachments.map((a) => a.name) : []
            }
            newfn={newfn}
            isreview={isReview}
            setSelectedValue={setSelectedValue}
            isedit={isEdit}
          />
        )}

        {((newfn && name != "" && category) ||
          (!newfn && selectedvalue.id !== undefined)) && (
          <div className="flex mt-4 mr-20 p-5 justify-end items-end ">
            <div>
              <Buttontext
                issentforapproval={selectedvalue.sentforapproval}
                nextstatus={nextstatus}
                data={selectedvalue}
              />
            </div>
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
      {showtoast &&
        recall &&
        !errormessage &&
        userInfo?.is_admin &&
        !imagesaved &&
        isEdit && (
          <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ Statement reverted and swithced to Edit mode!
          </div>
        )}
      {showtoast &&
        !errormessage &&
        !recall &&
        userInfo?.is_admin &&
        !imagesaved &&
        isEdit && (
          <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ Statement changed to Edit mode!
          </div>
        )}
      {showtoast &&
        dataupdated &&
        userInfo?.is_admin &&
        !imagesaved &&
        !isEdit && (
          <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅Document updated successfully!!
          </div>
        )}

      {showtoast &&
        !errormessage &&
        userInfo?.is_admin &&
        !imagesaved &&
        selectedvalue.status !== null &&
        !dataupdated &&
        !isEdit && (
          <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have successfully created the File Note/IOC!
          </div>
        )}
      {showtoast && errormessage && userInfo?.is_admin && !imagesaved && (
        <div className="fixed top-5 left-1/2 z-60  transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          {errormessage}
        </div>
      )}
      {showtoast &&
        userInfo?.is_admin &&
        (selectedvalue.status == "pending for hod" ||
          selectedvalue.status == "pending for cm") && (
          <div className="fixed top-5 left-1/2 z-60 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
            ✅ You have requested the document for approval!{" "}
            {errormessage ? `but ${errormessage}` : ""}
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
