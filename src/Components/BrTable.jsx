import { useBrTableData } from "../store/brStore";
import Accounting from "./Accounting";
import CashFlow from "./CashFlow";
import PaybackPeriod from "./Payback";
import Summary from "./Summary";
import FileContainer from "./FileContainer";

import { formatPrice } from "../Helpers/helperfunctions";
import ApproveButton from "./ApproveButton";

const BrTable = () => {
  const { brtabledata } = useBrTableData();
  const data = brtabledata;
  const operation_cost_tenure = formatPrice(data.op_cost_tenure);
  const maintainenece_cost_tenure = formatPrice(data.maintenance_cost_tenure);
  const operation_cost_rent = formatPrice(data.op_cost_rental);
  const maintainence_cost_rental = formatPrice(data.maint_rental);

  return (
    <div className="rounded-xl border border-gray-300 p-2">
      <div className="flex items-center gap-2  pb-2">
        {
          <div className="flex items-center gap-2 bg-gray-50  border border-gray-200 rounded-md px-3 py-1.5 ">
            <span>💱</span>
            <span className="text-gray-800">Currency In</span>
            {data.currency ? (
              <span className="font-semibold text-blue-600">
                {data.currency}
              </span>
            ) : (
              "--"
            )}
          </div>
        }
      </div>
      <div className="border border-gray-400 mb-6 flex rounded overflow-hidden">
        <div className="w-1/3 bg-blue-100 text-blue-800 font-semibold p-2 flex items-center">
          Item
        </div>
        <div className="w-full items-center justify-center flex text-center font-bold p-2 bg-white">
          {data.item}
        </div>
      </div>

      <div className="w-1/2 px-4 py-2 mb-3  font-semibold text-green-800 bg-green-200 border-l-4 border-blue-500 rounded shadow-sm">
        Cash Flow Gain / (Loss)
      </div>

      <div className="w-full flex gap-20">
        <div className="w-1/2 border border-gray-400 rounded overflow-hidden">
          <div className="bg-green-100 text-green-800 font-semibold p-2 flex text-center items-center justify-center">
            Buying
          </div>
          <table className="w-full ">
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="p-2">Unit Price</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.unit_price)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-2">No of Units</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.units_no)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50 font-semibold">
                <td className="p-2">Total Principal Cost</td>
                <td className="p-2 text-right border-l font-semibold border-gray-400">
                  {formatPrice(data.principal_cost)}
                </td>
              </tr>
              <tr>
                <td className="p-2">Interest Rate</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {data.int_rate} %
                </td>
              </tr>
              <tr>
                <td className="p-2">Tenure-Years</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.fin_tenure)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Tenure-Months</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.tenure_months)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Monthly Instalment</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.monthly_installment)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Total Interest Cost</td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {formatPrice(data.total_interest_cost)}
                </td>
              </tr>
              <tr className="font-semibold  ">
                <td className="p-2">Total Principal + Interest</td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {formatPrice(
                    Number(data.principal_cost) +
                      Number(data.total_interest_cost),
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-2 font-semibold">
                  Operation Cost for the Tenure
                </td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {operation_cost_tenure && operation_cost_tenure !== "0"
                    ? operation_cost_tenure
                    : "--"}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">
                  Maintenance Cost for the Tenure
                </td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {maintainenece_cost_tenure !== "0"
                    ? maintainenece_cost_tenure
                    : "--"}
                </td>
              </tr>

              <tr className="bg-green-100 font-semibold">
                <td className="p-2">Total Cost Outflow for period</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.cash_outflow_buying)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-1/2 border border-gray-400 rounded overflow-hidden">
          <div className="bg-red-100 text-red-800 font-semibold p-2 flex text-center items-center justify-center">
            Renting
          </div>

          <table className="w-full ">
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="p-2">Unit Rental</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.monthly_rent)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="p-2">No of Units</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.units_no)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Tenure-Years</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.fin_tenure)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Tenure-Months</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.tenure_months)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Monthly Rent</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {formatPrice(data.total_monthly_rental)}
                </td>
              </tr>

              <tr>
                <td className="p-2 font-semibold">Total Rental</td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {formatPrice(data.total_rental_cost)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Operation Cost</td>
                <td className="p-2 text-right border-l border-gray-400">
                  {operation_cost_rent !== "0" ? operation_cost_rent : "--"}
                </td>
              </tr>

              <tr>
                <td className="p-2 font-semibold">Maintenance Cost</td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {maintainence_cost_rental != "0"
                    ? maintainence_cost_rental
                    : "--"}
                </td>
              </tr>
              <tr>
                <td className="p-2 h-10"></td>
                <td className="p-2 text-right border-l border-gray-400"></td>
              </tr>
              <tr>
                <td className="p-2 h-10"></td>
                <td className="p-2 text-right border-l border-gray-400"></td>
              </tr>
              <tr>
                <td className="p-2 h-10"></td>
                <td className="p-2 text-right border-l border-gray-400"></td>
              </tr>

              <tr className="bg-red-100 font-semibold">
                <td className="p-2">Total Cost Outflow for period</td>
                <td className="p-2 text-right border-l border-gray-400 font-semibold">
                  {formatPrice(data.cash_outflow_renting)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <CashFlow data={data} />
      <Accounting data={data} />
      <PaybackPeriod data={data} />
      <Summary data={data} />
      <div className="flex justify-between items-center">
        <h2 className="flex items-center space-x-1">
          {data.created_at && (
            <div className="my-4 text-gray-700">
              <span>Recommendation for</span>
              <span
                className={`ml-1 px-2 py-1 ${
                  data.chosentype.trim() && "bg-yellow-200 text-gray-700"
                } font-semibold rounded-md`}
              >
                [{data.chosentype.trim()}]
              </span>
              <span className="ml-2">As on</span>
              <span className="ml-1 font-semibold">
                {new Date(data.created_at).toLocaleString("en-AE", {
                  timeZone: "Asia/Dubai",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </h2>
      </div>
      <div className="mt-6 border-t border-gray-300 pt-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 flex items-end gap-4">
          <FileContainer />
          <div className="ml-auto">
            <ApproveButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrTable;
