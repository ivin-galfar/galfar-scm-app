/* eslint-disable react/prop-types */
import { useState } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { createEmptyFleetItem } from "../Helpers/fleetRequestDraft";

const requiredFields = {
  fleetDescription: "Fleet Description",
  capacity: "Capacity",
  cicpa: "CICPA",
  quantity: "Quantity",
  requiredFrom: "Required From",
  rentalType: "Type of Rental",
  duration: "Duration",
  purpose: "Purpose",
  similarMachinesAvailable: "Qty of Similar Machines Available at Site",
  adnocFitments: "ADNOC Fitments",
  tpi: "TPI",
  remarks: "Remarks",
};

const validateItem = (item) => {
  const errors = {};

  Object.entries(requiredFields).forEach(([field, label]) => {
    if (String(item[field] ?? "").trim() === "") {
      errors[field] = `${label} is required.`;
    }
  });

  if (item.quantity !== "" && Number(item.quantity) < 1) {
    errors.quantity = "Quantity must be at least 1.";
  }

  if (
    item.productionQtyEnvisaged !== "" &&
    Number(item.productionQtyEnvisaged) < 0
  ) {
    errors.productionQtyEnvisaged = "Value cannot be negative.";
  }

  if (
    item.similarMachinesAvailable !== "" &&
    Number(item.similarMachinesAvailable) < 0
  ) {
    errors.similarMachinesAvailable = "Value cannot be negative.";
  }

  if (item.tpi && !["Normal", "CP - 19"].includes(item.tpi)) {
    errors.tpi = "Select Normal or CP - 19.";
  }

  return errors;
};

const areAllItemsValid = (items) =>
  items.length > 0 &&
  items.every((item) => Object.keys(validateItem(item)).length === 0);

const FleetItemsModal = ({
  isOpen,
  items,
  onItemsChange,
  onClose,
  onDiscard,
  onSave,
  isEditing = false,
}) => {
  const [errors, setErrors] = useState(() => items.map(() => ({})));
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);

  if (!isOpen) return null;

  const minimumDate = new Date();
  minimumDate.setDate(minimumDate.getDate() + 7);

  const minDate = [
    minimumDate.getFullYear(),
    String(minimumDate.getMonth() + 1).padStart(2, "0"),
    String(minimumDate.getDate()).padStart(2, "0"),
  ].join("-");

  const updateItem = (itemIndex, field, value) => {
    onItemsChange(
      items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              [field]: value,
              ...(field === "rentalType" ? { duration: "" } : {}),
            }
          : item,
      ),
    );

    setErrors((currentErrors) =>
      currentErrors.map((itemErrors, index) =>
        index === itemIndex
          ? {
              ...itemErrors,
              [field]: undefined,
              ...(field === "rentalType" ? { duration: undefined } : {}),
            }
          : itemErrors,
      ),
    );
  };

  const addItem = () => {
    onItemsChange([...items, createEmptyFleetItem()]);
    setErrors((currentErrors) => [...currentErrors, {}]);
  };

  const removeItem = (itemIndex) => {
    if (items.length <= 1) return;

    onItemsChange(items.filter((_, index) => index !== itemIndex));
    setErrors((currentErrors) =>
      currentErrors.filter((_, index) => index !== itemIndex),
    );
  };

  const moveItem = (itemIndex, direction) => {
    const nextIndex = itemIndex + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[itemIndex], nextItems[nextIndex]] = [
      nextItems[nextIndex],
      nextItems[itemIndex],
    ];
    onItemsChange(nextItems);

    setErrors((currentErrors) => {
      const nextErrors = [...currentErrors];
      [nextErrors[itemIndex], nextErrors[nextIndex]] = [
        nextErrors[nextIndex],
        nextErrors[itemIndex],
      ];
      return nextErrors;
    });
  };

  const handleSave = () => {
    const validationErrors = items.map(validateItem);
    setErrors(validationErrors);

    if (validationErrors.some((itemErrors) => Object.keys(itemErrors).length)) {
      return;
    }

    onSave(items.map((item) => ({ ...item })));
  };

  const renderError = (itemIndex, field) =>
    errors[itemIndex]?.[field] ? (
      <span className="mt-1 block text-xs font-medium text-red-600">
        {errors[itemIndex][field]}
      </span>
    ) : null;

  const inputClass =
    "h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fleet-items-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2
            id="fleet-items-modal-title"
            className="text-lg font-semibold text-slate-800"
          >
            Equipment Items
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded text-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close equipment items modal"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="space-y-5">
            {items.map((item, itemIndex) => {
              const durationCount = item.rentalType === "Weekly" ? 4 : 12;

              return (
                <fieldset
                  key={itemIndex}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <legend className="font-semibold text-slate-700">
                      Item {itemIndex + 1}
                    </legend>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveItem(itemIndex, -1)}
                        disabled={itemIndex === 0}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move item ${itemIndex + 1} up`}
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(itemIndex, 1)}
                        disabled={itemIndex === items.length - 1}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move item ${itemIndex + 1} down`}
                      >
                        Move down
                      </button>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(itemIndex)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Fleet Description{" "}
                        <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="text"
                        value={item.fleetDescription}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "fleetDescription",
                            event.target.value,
                          )
                        }
                      />
                      {renderError(itemIndex, "fleetDescription")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Capacity <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="text"
                        value={item.capacity}
                        onChange={(event) =>
                          updateItem(itemIndex, "capacity", event.target.value)
                        }
                      />
                      {renderError(itemIndex, "capacity")}
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Quantity <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(itemIndex, "quantity", event.target.value)
                        }
                      />
                      {renderError(itemIndex, "quantity")}
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Type of Rental <span className="text-red-600">*</span>
                      </span>
                      <select
                        className={inputClass}
                        value={item.rentalType}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "rentalType",
                            event.target.value,
                          )
                        }
                      >
                        <option value="">Select type</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                      {renderError(itemIndex, "rentalType")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Required From <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="date"
                        value={item.requiredFrom}
                        min={minDate}
                        onKeyDown={(e) => e.preventDefault()}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "requiredFrom",
                            event.target.value,
                          )
                        }
                      />
                      {renderError(itemIndex, "requiredFrom")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Duration <span className="text-red-600">*</span>
                      </span>
                      <select
                        className={inputClass}
                        value={item.duration}
                        disabled={!item.rentalType}
                        aria-disabled={!item.rentalType}
                        onChange={(event) =>
                          updateItem(itemIndex, "duration", event.target.value)
                        }
                      >
                        <option value="">Select duration</option>
                        {item.rentalType &&
                          Array.from(
                            { length: durationCount },
                            (_, index) => index + 1,
                          ).map((duration) => (
                            <option key={duration} value={duration}>
                              {duration}
                            </option>
                          ))}
                      </select>
                      {renderError(itemIndex, "duration")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Purpose <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="text"
                        value={item.purpose}
                        onChange={(event) =>
                          updateItem(itemIndex, "purpose", event.target.value)
                        }
                      />
                      {renderError(itemIndex, "purpose")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Production Qty Envisaged
                      </span>
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        step="1"
                        value={item.productionQtyEnvisaged}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "productionQtyEnvisaged",
                            event.target.value,
                          )
                        }
                      />
                      {renderError(itemIndex, "productionQtyEnvisaged")}
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        CICPA <span className="text-red-600">*</span>
                      </span>
                      <select
                        className={inputClass}
                        value={item.cicpa}
                        onChange={(event) =>
                          updateItem(itemIndex, "cicpa", event.target.value)
                        }
                      >
                        <option value="">Select Yes/No</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {renderError(itemIndex, "cicpa")}
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Qty of Similar Machines Available at Site{" "}
                        <span className="text-red-600">*</span>
                      </span>
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        step="1"
                        value={item.similarMachinesAvailable}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "similarMachinesAvailable",
                            event.target.value,
                          )
                        }
                      />
                      {renderError(itemIndex, "similarMachinesAvailable")}
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Utilization (%)
                      </span>
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        step="1"
                        value={item.utilization}
                        onChange={(event) =>
                          updateItem(
                            itemIndex,
                            "utilization",
                            event.target.value,
                          )
                        }
                      />
                      {renderError(itemIndex, "utilization")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                          ADNOC Fitments <span className="text-red-600">*</span>
                        </span>
                        <div
                          className="grid h-9 grid-cols-2 overflow-hidden rounded border border-slate-300"
                          role="group"
                          aria-label="ADNOC Fitments required"
                        >
                          {["yes", "no"].map((value) => {
                            const isSelected = item.adnocFitments === value;

                            return (
                              <button
                                key={value}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() =>
                                  updateItem(itemIndex, "adnocFitments", value)
                                }
                                className={`text-sm font-medium transition first:border-r first:border-slate-300 cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {value === "yes" ? "Yes" : "No"}
                              </button>
                            );
                          })}
                        </div>
                        {renderError(itemIndex, "adnocFitments")}
                      </div>

                      <label>
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                          TPI <span className="text-red-600">*</span>
                        </span>
                        <select
                          className={inputClass}
                          value={
                            ["Normal", "CP - 19"].includes(item.tpi)
                              ? item.tpi
                              : ""
                          }
                          onChange={(event) =>
                            updateItem(itemIndex, "tpi", event.target.value)
                          }
                        >
                          <option value="">Select TPI</option>
                          <option value="Normal">Normal</option>
                          <option value="CP - 19">CP - 19</option>
                        </select>
                        {renderError(itemIndex, "tpi")}
                      </label>
                    </div>

                    <label className="md:col-span-2 lg:col-span-3">
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Remarks <span className="text-red-600">*</span>
                      </span>
                      <textarea
                        className="min-h-20 w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={item.remarks}
                        onChange={(event) =>
                          updateItem(itemIndex, "remarks", event.target.value)
                        }
                      />
                      {renderError(itemIndex, "remarks")}
                    </label>
                  </div>
                </fieldset>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={!areAllItemsValid(items)}
            className="mt-5 cursor-pointer rounded border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white"
          >
            Add Another Item
          </button>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => setShowDiscardConfirmation(true)}
            className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
          >
            {isEditing ? "Discard changes" : "Discard draft"}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              {isEditing ? "Save Items" : "Add"}
            </button>
          </div>
        </div>
      </div>

      {showDiscardConfirmation && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="discard-draft-title"
          aria-describedby="discard-draft-description"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <LuTriangleAlert size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="discard-draft-title"
                    className="text-lg font-semibold text-slate-900"
                  >
                    Discard this draft?
                  </h3>
                  <p
                    id="discard-draft-description"
                    className="mt-2 text-sm leading-6 text-slate-600"
                  >
                    {isEditing
                      ? "Your unsaved equipment item changes and ordering will be discarded."
                      : "All request details and equipment items in this draft will be permanently removed. This action cannot be undone."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDiscardConfirmation(false)}
                autoFocus
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onDiscard}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
              >
                {isEditing ? "Discard changes" : "Discard draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetItemsModal;
