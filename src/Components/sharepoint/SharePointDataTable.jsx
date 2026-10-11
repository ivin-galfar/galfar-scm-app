/* eslint-disable react/prop-types */
import {
  createColumnHelper,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import { tableFeatures } from "@tanstack/table-core";

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value) ?? "—";
    } catch {
      return "[Value unavailable]";
    }
  }
  return String(value);
};

const SharePointDataTable = ({ items }) => {
  const columnHelper = createColumnHelper();
  const fields = [...new Set(items.flatMap((item) => Object.keys(item ?? {})))];
  const columns = fields.map((field) =>
    columnHelper.accessor((row) => row?.[field], {
      id: field,
      header: field,
      cell: (context) => formatCellValue(context.getValue()),
    }),
  );
  const table = useTable({
    data: items,
    columns,
    features: tableFeatures({}),
  });

  return (
    <div className="h-full min-h-0 min-w-0 overflow-auto [scrollbar-width:thin]">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100/95 text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-slate-50 even:bg-white transition-colors hover:bg-blue-50/70 motion-reduce:transition-none"
            >
              {(row.getVisibleCells?.() ?? row.getAllCells()).map((cell) => (
                <td
                  key={cell.id}
                  className="max-w-[28rem] whitespace-pre-wrap break-words px-3 py-2.5 align-top text-slate-700"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SharePointDataTable;
