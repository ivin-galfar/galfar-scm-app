import {
  createColumnHelper,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import {
  createExpandedRowModel,
  rowExpandingFeature,
  tableFeatures,
} from "@tanstack/table-core";
import { useState } from "react";
import { useEffect } from "react";
import fetchParticulars from "../APIs/ParticularsApi";
import { useContext } from "react";
import { AppContext } from "../Components/Context";
import ParticularsAccordion from "../Components/ParticularsAccordion";
import AddParticularsModal from "../Components/AddParticularsModal";
import { api } from "../APIs/api";
import Alerts from "../Components/Alerts";
import { useStatementupdated } from "../store/statementStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useParams } from "react-router-dom";
import {
  LuCalendarClock,
  LuInbox,
  LuLayoutTemplate,
  LuPencil,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";

const Particulars = () => {
  const { particulars, setParticulars } = useContext(AppContext);
  const [showmodal, setShowmodal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [triggerdelete, setTriggerdelete] = useState(false);
  const [deletetemplate, setDeletetemplate] = useState("");
  const [editTemplate, setEditTemplate] = useState(null);
  const { showupdated, setshowupdated, resetshowupdated } =
    useStatementupdated();
  const userInfo = useUserInfo();
  const { dept_id } = useParams();

  useEffect(() => {
    const loadParticulars = async () => {
      try {
        const particulars = await fetchParticulars(userInfo, dept_id);
        setParticulars(particulars.Particulars);
      } catch (error) {}
    };
    loadParticulars();
  }, [showupdated, dept_id]);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("template", {
      id: "template.name",
      header: "Template Name",
      cell: (info) => info.getValue() || "-",
    }),

    columnHelper.accessor("particulars", {
      id: "template.particulars",
      header: "Particulars",
      cell: (info) => {
        const list = info.getValue();
        return <ParticularsAccordion items={list} />;
      },
    }),
    columnHelper.accessor("created_at", {
      id: "template.date",
      header: "Created Date",
      cell: (info) => {
        const val = info.getValue();
        return val ? new Date(val).toLocaleDateString() : "-";
      },
    }),

    columnHelper.accessor("owner", {
      id: "template.owner",
      header: "Created By",
      cell: (info) => info.getValue() || "-",
    }),
  ];
  const features = tableFeatures({
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
  });

  const table = useTable({
    data: particulars,
    columns,
    features,
  });

  const latestDate =
    particulars?.length > 0
      ? new Date(
          Math.max(...particulars.map((item) => new Date(item.created_at))),
        )
      : null;
  const formattedLatestDate = latestDate
    ? latestDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";
  const handleDelete = async (deletetemplate) => {
    resetshowupdated();
    try {
      const { data } = await api.delete(
        `/particulars/${deletetemplate}`,
      );

      setShowToast(true);
      setshowupdated();
      setTimeout(() => {
        setShowToast(false);
        setTriggerdelete(false);
      }, 1500);
    } catch (error) {
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  const handleEdit = (template) => {
    setEditTemplate(template);
    setShowmodal(true);
    resetshowupdated();
  };

  const handleCloseModal = () => {
    setShowmodal(false);
    setEditTemplate(null);
  };

  return (
    <div className="flex-grow ">
      <div className="flex-grow w-full px-5 py-2">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 py-1">
            <span className="flex size-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
              <LuLayoutTemplate size={22} strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Customize Templates
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Create and manage particulars templates for your department.
              </p>
            </div>
          </div>
          {(userInfo.role.includes("inita") ||
            userInfo.role.includes("inith") ||
            userInfo.role.includes("initlg")) && (
            <div className="flex items-center gap-3">
              {formattedLatestDate != "-" && (
                <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex">
                  <LuCalendarClock size={15} />
                  Updated {formattedLatestDate}
                </span>
              )}
              <button
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
                onClick={() => {
                  setEditTemplate(null);
                  setShowmodal(true);
                  resetshowupdated();
                }}
              >
                <LuPlus size={18} strokeWidth={2.4} /> New Template
              </button>
            </div>
          )}
        </header>

        <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Template Library
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {particulars.length}{" "}
                {particulars.length === 1 ? "template" : "templates"} available
              </p>
            </div>
            {formattedLatestDate != "-" && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:hidden">
                <LuCalendarClock size={14} />
                {formattedLatestDate}
              </span>
            )}
          </div>

          <div className="max-h-[calc(100vh-250px)] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : header.column.columnDef.header}
                      </th>
                    ))}
                    <th className="border-b border-slate-200 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="py-16 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <LuInbox size={22} />
                        </span>
                        <p className="text-sm font-medium text-slate-700">
                          No templates found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Create a template to get started.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-blue-50/40"
                    >
                      {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                        (cell) => (
                          <td
                            key={cell.id}
                            className="border-b border-slate-100 px-5 py-3.5 text-sm text-slate-700"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ),
                      )}
                      <td className="border-b border-slate-100 px-5 py-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            aria-label="Edit template"
                            title="Edit template"
                            onClick={() => {
                              handleEdit(row.original);
                            }}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          >
                            <LuPencil size={16} />
                          </button>
                          <button
                            aria-label="Delete template"
                            title="Delete template"
                            onClick={() => {
                              setTriggerdelete(true);
                              setDeletetemplate(row.original.id);
                            }}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                          >
                            <LuTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {showmodal && (
        <AddParticularsModal
          setShowmodal={handleCloseModal}
          editTemplate={editTemplate}
        />
      )}
      {showToast && errormessage && (
        <div className="animate-slide-in fixed left-1/2 top-5 z-[9999] -translate-x-1/2 rounded-lg border border-rose-600 bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300">
          {errormessage}
        </div>
      )}
      {showToast && !errormessage && (
        <div className="animate-slide-in fixed left-1/2 top-5 z-[9999] -translate-x-1/2 rounded-lg border border-emerald-600 bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300">
          ✅ Particular template has been removed successfully!
        </div>
      )}
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Particular template?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(deletetemplate)}
        />
      )}
    </div>
  );
};

export default Particulars;