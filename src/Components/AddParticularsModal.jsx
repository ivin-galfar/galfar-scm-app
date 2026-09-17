import { useState } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { MdOutlineErrorOutline } from "react-icons/md";
import { useStatementupdated } from "../store/statementStore";
import { useParams } from "react-router-dom";
import {
  LuCheck,
  LuChevronDown,
  LuChevronUp,
  LuGripVertical,
  LuLayoutTemplate,
  LuListChecks,
  LuPlus,
  LuX,
} from "react-icons/lu";

const AddParticularsModal = ({ setShowmodal, editTemplate }) => {
  const existingFields = editTemplate?.particulars ?? [];
  const [fields, setFields] = useState(() => [
    ...existingFields,
    ...Array(Math.max(0, 5 - existingFields.length)).fill(""),
  ]);
  const [templatename, setTemplateName] = useState(
    editTemplate?.template ?? "",
  );
  const userInfo = useUserInfo();
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const { setshowupdated } = useStatementupdated();
  const { dept_id } = useParams();

  const name = userInfo?.email.split("@")[0];
  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredfields = fields.filter((f) => f.trim() !== "");
    if (templatename.trim() === "" || filteredfields.length === 0) {
      setShowToast(true);
      setErrormessage("Please fill the required fields!!");
      setTimeout(() => {
        setShowToast(false);
        setErrormessage("");
      }, 1500);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const payload = {
        created: {
          owner: formattedName,
        },
        template: {
          name: templatename.trim(),
          particulars: filteredfields,
        },
        dept_code: dept_id,
      };

      if (editTemplate) {
        console.log("con");

        await axios.put(
          `${REACT_SERVER_URL}/particulars/${editTemplate.id}`,
          payload,
          config,
        );
      } else {
        await axios.post(`${REACT_SERVER_URL}/particulars`, payload, config);
      }

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
        setErrormessage("");
      }, 1500);
    }
  };

  const addField = () => {
    setFields((prev) => [...prev, ""]);
  };

  const updateField = (index, val) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const moveField = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= fields.length) return;
    console.log(fromIndex);
    console.log(toIndex);

    setFields((prev) => {
      const updated = [...prev];

      const [movedField] = updated.splice(fromIndex, 1);

      updated.splice(toIndex, 0, movedField);

      return updated;
    });
  };

  const handleDrop = (toIndex) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      moveField(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <LuLayoutTemplate size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {editTemplate ? "Edit Template" : "Create Template"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {editTemplate
                ? "Update the template name and its particulars."
                : "Add a reusable template and define its particulars."}
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            onClick={() => setShowmodal(false)}
          >
            <LuX size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Template Name
              <span className="ml-1 text-rose-500">*</span>
            </label>
            <input
              name="name"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
              placeholder="Enter a clear template name"
              value={templatename}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuListChecks className="text-slate-500" size={17} />
                <h3 className="text-sm font-semibold text-slate-800">
                  Particular fields
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {fields.length} fields
              </span>
            </div>

            <div className="space-y-2.5">
              {fields?.map((val, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`flex items-center gap-2.5 rounded-lg transition ${
                    dragOverIndex === index && draggedIndex !== index
                      ? "border-t-2 border-blue-500 pt-1"
                      : ""
                  } ${draggedIndex === index ? "opacity-50" : ""}`}
                >
                  <button
                    type="button"
                    aria-label={`Drag particular field ${index + 1}`}
                    title="Drag to reorder"
                    className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                  >
                    <LuGripVertical size={17} />
                  </button>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
                    {index + 1}
                  </span>
                  <input
                    name={`particular-${index}`}
                    aria-label={`Particular field ${index + 1}`}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                    placeholder={`Enter particular ${index + 1}`}
                    value={val}
                    onChange={(e) => updateField(index, e.target.value)}
                  />
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      aria-label={`Move particular field ${index + 1} up`}
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => moveField(index, index - 1)}
                      className="flex size-5 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <LuChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move particular field ${index + 1} down`}
                      title="Move down"
                      disabled={index === fields.length - 1}
                      onClick={() => moveField(index, index + 1)}
                      className="flex size-5 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <LuChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              onClick={addField}
            >
              <LuPlus size={15} /> Add another field
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          <button
            onClick={() => setShowmodal(false)}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
          >
            <LuCheck size={17} strokeWidth={2.4} />
            {editTemplate ? "Update" : "Submit"}
          </button>
        </div>
        {showToast && !errormessage && (
          <div className="animate-slide-in fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-lg border border-green-600 bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300">
            ✅ Particular template {editTemplate ? "updated " : "saved "}
            successfully!
          </div>
        )}
        {showToast && errormessage && (
          <div className="animate-slide-in fixed left-1/2 top-5 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-rose-600 bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300">
            <MdOutlineErrorOutline /> {errormessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddParticularsModal;
