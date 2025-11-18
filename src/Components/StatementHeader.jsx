import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { FaFileDownload, FaFileUpload, FaPlus } from "react-icons/fa";
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
import fetchParticulars from "../APIs/ParticularsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchallid, updatelgstatement } from "../APIs/api";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { useNavigate, useParams } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import { IoMdSave } from "react-icons/io";

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
  const { setCsSelected } = useSelectCS();
  // const { csselectedval, setCsSelectedval } = useSelectCSValue();
  const { columns, resetcolumns } = usecolumns();
  const { cs_no } = useParams();
  const navigate = useNavigate();
  const { isFreeze, setFreeze, resetFreeze } = useFreeze();

  const form = useForm({
    defaultValues: {
      ...formData,
    },
  });
  let dept_id = Array.isArray(userInfo.dept_code)
    ? userInfo.dept_code.includes(2)
      ? 2
      : userInfo?.dept_code[0]
    : userInfo.dept_code;

  useEffect(() => {
    const fetchParticularsData = async () => {
      try {
        const allParticulars = await fetchParticulars(userInfo, dept_id);
        setParticulars(allParticulars.Particulars);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchparticularvalues = async () => {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/particulars/${particular}`,
          config
        );
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
    queryFn: () => fetchallid(userInfo),
    enabled: !newstatement,
  });

  const fetchStatement = async (cs_id) => {
    if (cs_id != "default") {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/logistics/${cs_id}`,
          config
        );
        let filteredresponse = response;

        if (userInfo.role == "pm") {
          if (
            userInfo.pr_code.includes(1) &&
            response.data?.formData?.project == "plant"
          ) {
            filteredresponse = response;
          } else {
            filteredresponse = userInfo.pr_code.includes(
              Number(response.data?.formData?.project)
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
          })
        );
        normalizedTableData.forEach((row) => {
          Object.keys(row.forwarders || {}).forEach((key) =>
            allForwarderColumns.add(key)
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
        // console.log(fullyNormalized);
        console.log(fullyNormalized);

        setTableData(fullyNormalized);
        setFormData(filteredresponse.data?.formData);
        const fetchedparticular = response.data.tableData.map(
          (table) => table.particulars
        );
        console.log(tableData);

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
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        `${REACT_SERVER_URL}/receipts/file`,
        formData,
        config
      );

      const newFiles = response.data.uploadedFiles.map((file) => file.fileUrl);
      const newFileNames = response.data.uploadedFiles.map(
        (file) => file.fileName
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
        edited_count: formData.edited_count + 1,
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

  return (
    <div>
      <form className="flex max-w-full h-1/4 p-5">
        <div className="absolute w-1/3  gap-10 flex ">
          {userInfo.role == "initlg" && (
            <span
              className="flex   justify-center font-semibold text-sm px-2 py-2 gap-2 h-10 bg-blue-600 rounded-2xl text-white items-center cursor-pointer"
              onClick={() => {
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
                });
                navigate(`/lstatements`, { replace: true });
              }}
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
              Choose CS No:
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
                  <label htmlFor={field.name}>Shipment No:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>Cargo Details:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.cargo_details}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value); // updates react-form state
                      setFormData((prev) => ({
                        ...prev,
                        cargo_details: value, // updates Zustand state
                      }));
                    }}
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>Gross Weight:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>Chargeable Weight:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
          <div className="flex flex-col ">
            <form.Field
              name="supplier"
              validators={{
                onSubmit: ({ value }) =>
                  value == "" ? "Enter the Supplier Name" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name}>Supplier: M/S.</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>Scope of work:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name}>Description:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name}>Mode:</label>
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
                    className="border-b-2 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
        <div className="flex w-1/3 items-center h-56 pl-10 justify-between">
          <div>
            <form.Field
              name="date"
              validators={{
                onChange: ({ value }) =>
                  value == "" ? "Enter the Date" : value,
              }}
            >
              {(field) => (
                <div className="flex items-end justify-between text-sm font-medium gap-2">
                  <label htmlFor={field.name}>Date:</label>
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
                    className="border-b-2 w-36 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>PO:</label>
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
                    className="border-b-2 w-36 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
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
                  <label htmlFor={field.name}>Project:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData.project ?? ""}
                    type="text"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        project: value,
                      }));
                    }}
                    className="border-b-2 w-36 border-gray-400  p-1 text-gray-800 outline-none transition-all duration-200"
                    disabled={isFreeze}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex  gap-2 pl-10">
            {userInfo?.is_admin ? (
              <div className="block gap-2">
                <label
                  htmlFor="receiptfile"
                  className={`flex gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg ${formData?.created_at && isFreeze ? "cursor-auto" : "cursor-pointer"}  hover:bg-blue-200 transition-all`}
                >
                  Upload File
                  <FaFileUpload size={20} />
                  {Array.isArray(formData?.file) &&
                    formData?.file?.filter((f) => f.trim() !== "").length >
                      0 && (
                      <span className="relative -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
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
                  disabled={isFreeze}
                />
                <div className="pt-5 flex items-center gap-4">
                  <button
                    type="button"
                    className={`p-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-50 cursor-pointer hover:bg-blue-100 active:bg-blue-200 ${formData.created_at == "" || formData.status != "created" ? "invisible" : ""} `}
                    onClick={() => {
                      resetFreeze();
                      setIsEditing();
                    }}
                  >
                    <MdModeEdit />
                    Edit Statement
                  </button>

                  <IoMdSave
                    className={`text-xl text-gray-600 cursor-pointer hover:text-gray-800 ${formData.created_at == "" || formData.status != "created" ? "invisible" : ""}`}
                    onClick={() => {
                      handleSave();
                      resetIsEditing();
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {Array.isArray(formData?.file) &&
                  formData.file?.filter((f) => f.trim() !== "").length > 0 &&
                  (formData?.file?.length <= 1 ? (
                    <div className="relative flex items-center gap-2">
                      {formData.file.map((fileurl, index) => (
                        <a
                          key={index}
                          href={fileurl}
                          target="_blank"
                          download
                          className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-all"
                        >
                          Download Attachment {index + 1}
                          <FaFileDownload size={20} className="relative" />
                        </a>
                      ))}
                      <span className="absolute -top-6 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                        {formData?.file.length}
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex flex-wrap gap-1 max-w-full">
                      {formData.file?.map((fileurl, index) => (
                        <a
                          key={index}
                          href={fileurl}
                          target="_blank"
                          download
                          className="flex items-center gap-10 text-xs bg-blue-100 text-blue-700 px-2 py-1 max-w-[48%] rounded-md cursor-pointer hover:bg-blue-200 transition-all flex-shrink min-w-0 truncate"
                        >
                          <span>Attachment {index + 1}</span>
                          <FaFileDownload size={16} />
                        </a>
                      ))}
                      <span className="absolute -top-5 right-0 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                        {formData.file?.length}
                      </span>
                    </div>
                  ))}
              </>
            )}
          </div>
          <div />
        </div>
      </form>
    </div>
  );
};

export default StatementHeader;
