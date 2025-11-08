import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { useEffect } from "react";
import fetchParticulars from "../APIs/ParticularsApi";
import { useContext } from "react";
import { AppContext } from "../Components/Context";
import ParticularsAccordion from "../Components/ParticularsAccordion";
import { FaPlus } from "react-icons/fa6";
import AddParticularsModal from "../Components/AddParticularsModal";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import Alerts from "../Components/Alerts";
import { useStatementupdated } from "../store/statementStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useParams } from "react-router-dom";

const Particulars = () => {
  const { particulars, setParticulars } = useContext(AppContext);
  const [showmodal, setShowmodal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [triggerdelete, setTriggerdelete] = useState(false);
  const [deletetemplate, setDeletetemplate] = useState("");

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
  const table = useReactTable({
    data: particulars,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const latestDate =
    particulars.length > 0
      ? new Date(
          Math.max(...particulars.map((item) => new Date(item.created_at)))
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
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(
        `${REACT_SERVER_URL}/particulars/${deletetemplate}`,
        config
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

  return (
    <div>
      <div className="flex flex-col min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-800 px-5 pt-5 pb-3 border-b border-gray-200">
          Customize Particulars
        </h1>

        <div className="bg-white shadow-md p-5">
          <div className="mt-2 flex items-center justify-between">
            <button
              className="flex items-center px-4 py-2 gap-2.5 bg-blue-600 text-white rounded shadow cursor-pointer"
              onClick={() => {
                setShowmodal(true);
                resetshowupdated();
              }}
            >
              <FaPlus /> New Template
            </button>
            {formattedLatestDate != "-" ? (
              <span className="text-sm text-gray-500">
                Last updated: {formattedLatestDate}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
        <section className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header}
                    </th>
                  ))}
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                    Action
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 text-gray-500"
                  >
                    No templates found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="even:bg-white odd:bg-gray-50 hover:bg-blue-100 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-gray-300 px-4 py-2 text-sm text-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="border-b border-gray-300 px-4 py-2 text-red-600 text-center">
                      <button
                        onClick={() => {
                          setTriggerdelete(true);
                          setDeletetemplate(row.original.id);
                        }}
                        className="hover:text-red-800 cursor-pointer"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
      {showmodal && <AddParticularsModal setShowmodal={setShowmodal} />}
      {showToast && errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          {errormessage}
        </div>
      )}
      {showToast && !errormessage && (
        <div className="z-[9999] fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
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
