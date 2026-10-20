import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { FaFileUpload, FaPlus, FaUndoAlt } from "react-icons/fa";
import {
  useAllParticulars,
  usecolumns,
  useFreeze,
  useIsEditing,
  useNewStatement,
  useParticular,
  useParticularValues,
  useSelectCS,
  useSelectCSValue,
  useStatement,
} from "../store/logisticsStore";
import { useRecallAlert, useRecallStatement } from "../store/helperStore";
import fetchParticulars from "../APIs/ParticularsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { api } from "../APIs/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchallid,
  recallStatementValues,
  updatelgstatement,
} from "../APIs/api";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import { IoMdSave } from "react-icons/io";
import { GrRevert } from "react-icons/gr";
import { IoSave } from "react-icons/io5";
import Alerts from "./Alerts";
import { LuUndo2 } from "react-icons/lu";

const StatementHeader = () => {
  const { formData, setFormData, setTableData, resetData, tableData } =
    useStatement();
  const { isEditing, resetIsEditing, setIsEditing } = useIsEditing();
  const userInfo = useUserInfo();
  const { newstatement, setNewStatement } = useNewStatement();
  const { particulars, setParticulars } = useAllParticulars();
  const { particular, setParticular } = useParticular();
  const { setParticularValue, resetparticularvalue } = useParticularValues();
  const { setErrorMessage, clearErrorMessage } = useErrorMessage();
  const { setShowToast, resetshowtoast } = useToast();
  const { isAlerted, setIsAlerted, resetIsAlerted } = useRecallAlert();
  const { setCsSelected } = useSelectCS();
  const { columns, resetcolumns } = usecolumns();
  const { cs_no } = useParams();
  const navigate = useNavigate();
  const { isFreeze, setFreeze, resetFreeze } = useFreeze();
  const location = useLocation();
  const { setIsRecalled, resetIsRecalled, isRecalled } = useRecallStatement();
  const isReview = formData.status == "review";

  const form = useForm({
    defaultValues: {
      ...formData,
    },
  });
  let dept_id = Array.isArray(userInfo?.dept_code)
    ? userInfo.dept_code.includes(2)
      ? 2
      : userInfo?.dept_code[0]
    : userInfo?.dept_code;

  useEffect(() => {
    // If there's no user info or token, redirect to login
    if (!userInfo || !userInfo.id) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    const fetchParticularsData = async () => {
      try {
        const allParticulars = await fetchParticulars(userInfo, dept_id);
        setParticulars(allParticulars?.Particulars);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchparticularvalues = async () => {
      try {
        const response = await api.get(`/particulars/${particular}`);
        setParticularValue(response.data.particular.particulars);
      } catch (error) {
        const message = error?.response?.data || error.message;
        setErrorMessage(message);
      }
    };

    if (newstatement && particular == "") {
      fetchParticularsData();
    }

    if (particular != "") {
      fetchparticularvalues();
    }
  }, [newstatement, particular]);

  const { data: csid } = useQuery({
    queryKey: ["csid", formData.status],
    queryFn: () => fetchallid(userInfo, location.pathname),
    enabled: !newstatement,
  });

  const fetchStatement = async (cs_id) => {
    if (cs_id != "default") {
      try {
        const response = await api.get(`/logistics/${cs_id}`);
        let filteredresponse = response;

        if (userInfo.role?.includes("pm")) {
          if (
            userInfo.pr_code.includes(1) &&
            response.data?.formData?.project == "plant"
          ) {
            filteredresponse = response;
          } else {
            filteredresponse = userInfo.pr_code.includes(
              Number(response.data?.formData?.project),
            )
              ? response
              : "";
          }
        }
        const allForwarderColumns = new Set();
        const normalizedTableData = filteredresponse.data?.tableData.map(
          (table) => ({
            id: table.id,
            r_id: table.row_id,
            particulars: table.particulars,
            forwarders: table.forwarders || {},
            vendorcol: table.vendorcol,
          }),
        );
        normalizedTableData.forEach((row) => {
          Object.keys(row.forwarders || {}).forEach((key) =>
            allForwarderColumns.add(key),
          );
        });
        //for avoid collapsing if empty cell is there in first row
        const sortedColumns = [...allForwarderColumns].sort();
        const fullyNormalized = normalizedTableData.map((row) => {
          const orderedForwarders = {};
          [...sortedColumns].forEach((col) => {
            orderedForwarders[col] = row.forwarders[col] ?? "";
          });
          return {
            ...row,
            forwarders: orderedForwarders,
          };
        });

        setTableData(fullyNormalized);
        setFormData(filteredresponse.data?.formData);
        const fetchedparticular = response.data.tableData.map(
          (table) => table.particulars,
        );

        setParticularValue(fetchedparticular);
      } catch (error) {
        const message = error?.response?.data || error.message;
        setShowToast();
        setErrorMessage(message);
        setTimeout(() => {
          resetshowtoast();
          clearErrorMessage();
        }, 1000);
      }
    } else {
      resetData("");
      form.reset({
        cargo_details: "",
        gross_weight: "",
        chargeable_weight: "",
        description: "",
        shipment_no: "",
        supplier: "",
        scopeofwork: "",
        mode: "",
        edited_count: 0,
        date: "",
        po: "",
        project: "",
        status: "",
        sentforapproval: "",
        recommendation_reason: "",
        file: [],
        filename: [],
        created_at: "",
        lastupdated: null,
        rejectedby: "",
        createdby: "",
        recalled_times: 0,
      });
    }
  };

  useEffect(() => {
    if (cs_no && cs_no != "default") {
      fetchStatement(cs_no);
    } else {
      resetData("");
      form.reset({
        cargo_details: "",
        gross_weight: "",
        chargeable_weight: "",
        shipment_no: "",
        description: "",
        supplier: "",
        scopeofwork: "",
        mode: "",
        edited_count: 0,
        date: "",
        po: "",
        project: "",
        status: "",
        sentforapproval: "",
        recommendation_reason: "",
        file: [],
        filename: [],
        created_at: "",
        lastupdated: null,
        rejectedby: "",
        createdby: "",
        recalled_times: 0,
      });
    }
  }, [cs_no]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });
      const response = await api.post(`/receipts/file`, formData);

      const newFiles = response.data.uploadedFiles.map((file) => file.fileUrl);
      const newFileNames = response.data.uploadedFiles.map(
        (file) => file.fileName,
      );

      setFormData((prev) => ({
        ...prev,
        file: [...(prev.file || []), ...newFiles],
        filename: [...(prev.filename || []), ...newFileNames],
      }));
    } catch (error) {
      setShowToast();
      setErrorMessage(error.message);
      setTimeout(() => {
        resetshowtoast();
      }, 1500);
    }
  };

  const updateStatement = useMutation({
    mutationFn: updatelgstatement,

    onMutate: () => {
      setErrorMessage("");
    },
    onSuccess: (data) => {
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
      }, 1500);
      setFormData({ ...formData, lastupdated: new Date().toISOString() });
    },
    onError: (error) => {
      setShowToast(true);
      let message = error?.response?.data?.message;
      setErrorMessage(message ? message : error.message);
      setTimeout(() => {
        resetshowtoast();
      }, 1500);
    },
  });

  const handleSave = () => {
    setFreeze();
    if (formData.created_at && formData.created_at.trim() !== "") {
      const updatedFormData = {
        ...formData,
        status: "created",
        edited_count: Number(formData.edited_count) + 1,
        lastupdated: new Date().toISOString(),
      };

      setFormData(updatedFormData);
      updateStatement.mutate({
        formData: updatedFormData,
        tableData,
        userInfo,
      });
    }
  };

  const recallStatement = () => {
    setIsRecalled();
    setIsEditing();
    recallStatementValues(formData.id, formData.recalled_times + 1);
    resetFreeze();
    setShowToast();
    resetIsAlerted();
    setTimeout(() => {
      resetshowtoast();
    }, 1500);
  };

  const inputClass = userInfo.is_admin
    ? "border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200 w-64"
    : "border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200 w-70";

  const createNewLogisticsStatement = () => {
    resetcolumns();
    resetData();
    setNewStatement();
    resetparticularvalue();
    form.reset({
      cargo_details: "",
      gross_weight: "",
      chargeable_weight: "",
      description: "",
      supplier: "",
      scopeofwork: "",
      mode: "",
      date: "",
      edited_count: "",
      shipment_no: "",
      po: "",
      project: "",
      status: "",
      sentforapproval: "",
      recommendation_reason: "",
      file: [],
      filename: [],
      lastupdated: null,
      created_at: "",
      rejectedby: "",
      createdby: "",
      recalled_times: 0,
    });
    navigate("/lstatements", { replace: true });
  };

  useEffect(() => {
    if (location.state?.createNew === "logistics") {
      createNewLogisticsStatement();
    }
  }, [location.state]);

  const showEditAction =
    formData.created_at != "" && formData.status === "created" && !isRecalled;
  const showRecallAction =
    formData.created_at != "" &&
    !["approved", "review", "rejected", "created"].includes(formData.status);

  return (
    <div>
      <form className="flex max-w-full h-1/4 p-5">
        <div className="absolute w-1/3  gap-10 flex ">
          {userInfo.role?.includes("initlg") && (
            <span
              className="flex   justify-center font-semibold text-sm px-2 py-2 gap-2 h-10 bg-blue-600 rounded-2xl text-white items-center cursor-pointer"
              onClick={createNewLogisticsStatement}
            >
              {" "}
              <FaPlus />
              Create Statement
            </span>
          )}
          {newstatement ? (
            <span className={`flex gap-2 `}>
              <span className="flex items-center font-semibold text-xs gap-5">
                Choose Template:
              </span>
              <select
                className=" px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white overflow-hidden"
                onChange={(e) => setParticular(e.target.value)}
                value={particular ?? ""}
                key="template"
              >
                <option value="">Select Template</option>
                {particulars.map((particular) => (
                  <option value={particular.id} key={particular.id}>
                    {particular.template}
                  </option>
                ))}
              </select>
            </span>
          ) : (
            <span className="flex items-center font-semibold text-xs ">
              Choose Doc. No:
              <select
                key="cs-select"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white overflow-hidden"
                value={cs_no || csid?.[0] || ""}
                onChange={(e) => {
                  setCsSelected();
                  if (e.target.value != "default") {
                    fetchStatement(e.target.value);
                    navigate(`/lstatements/${e.target.value}`, {
                      replace: true,
                    });
                  } else {
                    navigate(`/lstatements`, { replace: true });
                  }

                  // setCsSelectedval(e.target.value);
                }}
              >
                <option value="default">Select CS. No.</option>
                {csid?.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.id}
                  </option>
                ))}
              </select>
            </span>
          )}
        </div>
        <div className="flex w-1/3 h-56 items-center">
          <div>
            <form.Field
              name="shipment_no"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Shipment No." : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="p-1">
                    Shipment No:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.shipment_no ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        shipment_no: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="cargo_details"
              validators={{
                onChange: ({ value }) =>
                  value == "" ? "Enter the cargo details" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="p-1">
                    Cargo Details:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.cargo_details}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        cargo_details: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="gross_weight"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Gross weight" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="p-1">
                    Gross Weight:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.gross_weight ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        gross_weight: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="chargeable_weight"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Chargable weight" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="p-1">
                    Chargeable Weight:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.chargeable_weight ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        chargeable_weight: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
        <div className="flex flex-col items-center w-1/3  text-xl relative">
          <div className="top-0 text-center  font-semibold mb-5">
            Logistics Comparison Statement
          </div>
          <div className="flex flex-col w-100">
            <form.Field
              name="supplier"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Supplier Name" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-3">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Supplier:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.supplier ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value); // updates react-form state
                      setFormData((prev) => ({
                        ...prev,
                        supplier: value, // updates Zustand state
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="scopeofwork"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Scope of Work" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Scope of work:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.scopeofwork ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        scopeofwork: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="description"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Description" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-7">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Description:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.description ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        description: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="mode"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the mode of Work" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-16">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Mode:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.mode ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        mode: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
        <div className="flex h-56 min-w-0 w-1/3 flex-col pl-4">
          <div aria-hidden="true" className="h-12 shrink-0" />
          <div className="min-w-0">
            <form.Field
              name="date"
              validators={{
                onChange: ({ value }) =>
                  value == "" ? "Enter the Date" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Date:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.date ? formData.date.split("T")[0] : ""}
                    type="date"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value); // updates react-form state
                      setFormData((prev) => ({
                        ...prev,
                        date: value, // updates Zustand state
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="po"
              validators={{
                onChange: ({ value }) =>
                  value == "" ? "Enter the Date" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    PO:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.po ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        po: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="project"
              validators={{
                onChange: ({ value }) =>
                  value == "" ? "Enter the Date" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between   text-sm font-medium gap-2">
                  <label htmlFor={field.name} className="text-nowrap p-1">
                    Project:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.project ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        project: value,
                      }));
                    }}
                    className={inputClass}
                    disabled={isFreeze && !isReview}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="mt-2 flex min-w-0 gap-2 ">
            {userInfo?.is_admin && (
              <div className="flex min-w-0 w-full items-center gap-2 justify-between">
                <label
                  htmlFor="receiptfile"
                  className={`relative inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-blue-300 bg-blue-50 px-4 text-sm font-semibold text-blue-700 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 ${
                    formData?.created_at && isFreeze && !isReview
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-blue-400 hover:bg-blue-100"
                  }`}
                >
                  <FaFileUpload size={15} />
                  Upload File
                  {Array.isArray(formData?.file) &&
                    formData?.file?.filter((f) => f.trim() !== "").length >
                      0 && (
                      <span className="absolute -right-2 -top-2 z-10 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow">
                        {formData?.file.length}
                      </span>
                    )}
                </label>
                <input
                  id="receiptfile"
                  type="file"
                  multiple
                  accept="image/*"
                  className={`hidden `}
                  onChange={handleFileUpload}
                  disabled={isFreeze && !isReview}
                />
                <div className="flex items-center gap-2">
                  {showEditAction ? (
                    <button
                      type="button"
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-blue-300 bg-blue-50 px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-100"
                      onClick={() => {
                        resetFreeze();
                        setIsEditing();
                      }}
                    >
                      <MdModeEdit />
                      Edit Statement
                    </button>
                  ) : showRecallAction ? (
                    <button
                      type="button"
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                      onClick={setIsAlerted}
                    >
                      <LuUndo2 size={15} title="Recall" />
                      Recall
                    </button>
                  ) : null}
                  <button
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 shadow-sm transition hover:border-green-300 hover:bg-green-100 ${isEditing || isReview ? "cursor-pointer" : ""} ${(formData.created_at == "" || formData.status != "created") && !isRecalled && !isReview ? "invisible" : ""}`}
                    onClick={() => {
                      handleSave();
                      resetIsEditing();
                      resetIsRecalled();
                    }}
                    disabled={!isEditing && !isReview}
                  >
                    <IoSave size={20} color="green" title="save" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div />
        </div>
      </form>
      {isAlerted && (
        <Alerts
          message={"Do you need to recall the statement?"}
          onCancel={resetIsAlerted}
          onConfirm={recallStatement}
        />
      )}
    </div>
  );
};

export default StatementHeader;
