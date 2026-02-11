import { useForm } from "@tanstack/react-form";
import {
  useBrStatement,
  useBrTableData,
  useDatasaved,
  useNewStatement,
} from "../store/brStore";
import { act, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { feedbrstatement, updatebrstatement } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useToast } from "../store/toastStore";
import { useErrorMessage } from "../store/errorStore";
import FileUpload from "./FileUpload";
import { useIsEditing } from "../store/helperStore";

const NewBrModal = ({ setIsopen, clickedsave, setClickedSave }) => {
  const { formData, setFormData, resetFormData } = useBrStatement();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { setErrorMessage, errormessage, clearErrorMessage } =
    useErrorMessage();
  const [selectedyr, setSelectedyr] = useState(0);
  const { setDataSaved, resetDataSaved, datasaved } = useDatasaved();
  const { resetNewStatement } = useNewStatement();
  const form = useForm({
    defaultValues: {
      ...formData,
    },
  });
  const { brtabledata } = useBrTableData();

  const userInfo = useUserInfo();
  const { isedit, resetIsEdit } = useIsEditing();

  const { mutate: feedstatement, isPending: isLoading } = useMutation({
    mutationFn: feedbrstatement,
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        status: "created",
      }));
      setShowToast();
      setIsopen(false);
      setDataSaved();
      setClickedSave(false);
      setTimeout(() => {
        resetshowtoast();
        resetDataSaved();
      }, 1000);
      resetFormData();
    },
    onError: (error) => {
      const message = error?.response?.data.message || error.message;
      setShowToast();
      setErrorMessage(message);
    },
  });

  const { mutate: updateStatement } = useMutation({
    mutationFn: updatebrstatement,
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        status: "created",
      }));
      setShowToast();
      setIsopen(false);
      setDataSaved();
      setClickedSave(false);
      setTimeout(() => {
        resetshowtoast();
        resetDataSaved();
      }, 1000);

      resetFormData();
    },
    onError: (error) => {
      const message = error?.response?.data.message || error.message;
      setShowToast();
      setErrorMessage(message);
    },
  });

  const depcalculation = (selectedyr) => {
    let dep_rate = 0;

    switch (selectedyr) {
      case 2:
        dep_rate = 50;
        break;
      case 4:
        dep_rate = 25;
        break;
      case 5:
        dep_rate = 20;
        break;
      case 7:
        dep_rate = 14;
        break;
      case 10:
        dep_rate = 10;
        break;
      case "default":
        dep_rate = 0;
      default:
        break;
    }
    setFormData((prev) => ({
      ...prev,
      dp_rate: dep_rate,
      dp_year: selectedyr,
    }));
  };

  const hasEmptyRequiredFields = () => {
    let test = Object.entries(formData);
    console.log(test);

    return test
      .filter(([key]) => key !== "file" && key !== "file_name")
      .some(
        ([_, value]) => value === "" || value === null || value === undefined,
      );
  };

  const submitForm = (action) => {
    setClickedSave(true);
    if (hasEmptyRequiredFields()) {
      return;
    }
    const updatedFormData = {
      ...formData,
      status: "created",
    };

    if (action != "save") {
      updateStatement({ formData: updatedFormData, userInfo });
    } else {
      feedstatement({ formData: updatedFormData, userInfo });
    }
  };
  console.log(brtabledata);

  useEffect(() => {
    if (isedit) {
      setFormData({
        id: Number(brtabledata.id),
        item: brtabledata.item,
        no_of_units: Number(brtabledata.units_no),
        unit_price: Number(brtabledata.unit_price),
        int_rate: Number(brtabledata.int_rate),
        fin_tenure: Number(brtabledata.fin_tenure),
        maint_yearly: Number(brtabledata.maintenance_yearly),
        dp_rate: Number(brtabledata.dp_rate),
        dp_year: Number(brtabledata.dp_year),
        monthly_rental: Number(brtabledata.monthly_rent),
        op_cost: Number(brtabledata.op_cost_monthly),
        op_cost_rent: Number(brtabledata.op_cost_rental),
        maintain_cost_rent: Number(brtabledata.maint_rental),
        is_included_maintain_cost_rent: brtabledata.included_maintain_cost_rent,
        is_included_op_cost_rent: brtabledata.included_op_cost_rent,
        file: brtabledata.file,
        file_name: brtabledata.file_name,
      });
    }
  }, [isedit]);

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {!isedit ? "New Statement" : "Edit Statement"}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
            onClick={() => {
              setIsopen(false);
              resetFormData();
              setClickedSave(false);
            }}
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <form.Field name="item">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Item
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={formData.item ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      setFormData((prev) => ({ ...prev, item: value }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.item == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Item Name"}
                    </span>
                  )}{" "}
                </div>
              )}
            </form.Field>

            <form.Field name="no_of_units">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    No. of Units
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.no_of_units ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        no_of_units: value,
                      }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.no_of_units == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Item Name"}
                    </span>
                  )}{" "}
                </div>
              )}
            </form.Field>

            <form.Field name="unit_price">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit Price
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.unit_price ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({ ...prev, unit_price: value }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.unit_price == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Unit Price"}
                    </span>
                  )}{" "}
                </div>
              )}
            </form.Field>

            <form.Field name="int_rate">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Interest Rate (%)
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.int_rate ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({ ...prev, int_rate: value }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.int_rate == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Unit Price"}
                    </span>
                  )}{" "}
                </div>
              )}
            </form.Field>

            <form.Field name="fin_tenure">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Financial Tenure (yrs)
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.fin_tenure ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({ ...prev, fin_tenure: value }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.fin_tenure == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Financial Tenure"}
                    </span>
                  )}{" "}
                </div>
              )}
            </form.Field>

            <form.Field name="maint_yearly">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Maintenance (Yearly)
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.maint_yearly ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        maint_yearly: value,
                        maintain_cost_rent: value,
                      }));
                    }}
                    className={inputClass}
                  />
                  {/* {clickedsave && formData.maint_yearly == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Maintanence value"}
                    </span>
                  )}{" "} */}
                </div>
              )}
            </form.Field>

            <form.Field
              name="dp_year"
              validators={{
                onSubmit: ({ value }) =>
                  value == "default" ? "Choose depreciation years" : undefined,
              }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Depreciation (in yrs)
                  </label>
                  <select
                    id={field.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.dp_year ?? ""}
                    onChange={(e) => {
                      const year =
                        e.target.value === "" ? null : Number(e.target.value);
                      setSelectedyr(year);
                      if (year !== null) depcalculation(year);
                    }}
                  >
                    <option value="default">Choose years</option>
                    {[2, 4, 5, 7, 10].map((yr) => (
                      <option value={yr} key={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  {clickedsave && formData.dp_rate == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Choose the depreciation year"}
                    </span>
                  )}{" "}
                  {/* {formData.dp_rate == "" && (
                      <span className="text-sm text-red-500 mt-1">
                        {"Depreciation year is required"}
                      </span>
                    )}{" "} */}
                </div>
              )}
            </form.Field>

            {/* Depreciation Rate (Read-only) */}
            <form.Field
              name="dp_rate"
              validators={{
                onChange: ({ value }) =>
                  value === "" ? "Depreciation Rate is required" : undefined,
              }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Depreciation Rate (%)
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.dp_rate ?? ""}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="monthly_rental">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly Rent
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.monthly_rental ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        monthly_rental: value,
                      }));
                    }}
                    className={inputClass}
                  />
                  {clickedsave && formData.monthly_rental == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the Monthly Rental value"}
                    </span>
                  )}{" "}
                  <div className="flex justify-between items-center">
                    <div className="block mt-2">
                      <label className="gap-3 flex">
                        <input
                          type="checkbox"
                          name="includeMaintenance"
                          checked={formData.is_included_maintain_cost_rent}
                          onChange={(e) => {
                            const value = e.target.checked
                              ? 0
                              : formData.maint_yearly;
                            setFormData((prev) => ({
                              ...prev,
                              maintain_cost_rent: value,
                              is_included_maintain_cost_rent: e.target.checked
                                ? true
                                : false,
                            }));
                          }}
                        />
                        Included Maintenance
                      </label>{" "}
                      <label className="gap-3 flex">
                        <input
                          type="checkbox"
                          checked={formData.is_included_op_cost_rent}
                          name="includeOperational"
                          onChange={(e) => {
                            const value = e.target.checked
                              ? 0
                              : formData.op_cost;
                            setFormData((prev) => ({
                              ...prev,
                              op_cost_rent: value,
                              is_included_op_cost_rent: e.target.checked
                                ? true
                                : false,
                            }));
                          }}
                        />
                        Included Operational Cost
                      </label>
                    </div>
                    <div className=" flex justify-end items-end ">
                      <FileUpload />
                    </div>
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="op_cost">
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Operator Cost
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData.op_cost ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      field.handleChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        op_cost: value,
                        op_cost_rent: value,
                      }));
                    }}
                    className={inputClass}
                  />
                  {/* {clickedsave && formData.op_cost == "" && (
                    <span className="text-sm text-red-500 mt-1">
                      {"Enter the oprational cost value"}
                    </span>
                  )}{" "} */}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t bg-gray-50">
          <button
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setIsopen(false);
              resetFormData();
              setClickedSave(false);
              resetIsEdit();
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            onClick={() => submitForm(isedit ? "edit" : "save")}
          >
            {isedit ? "Update" : "Save"}
          </button>
        </div>
        {/* </form> */}
      </div>
    </div>
  );
};

export default NewBrModal;
