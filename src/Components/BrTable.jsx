import { useBrStatement, useBrTableData } from "../store/brStore";
import Accounting from "./Accounting";
import CashFlow from "./cashFlow";
import PaybackPeriod from "./Payback";
import Summary from "./Summary";

import { formatPrice } from "../Helpers/helperfunctions";
import ApproveButton from "./ApproveButton";

const BrTable = () => {
  const { brtabledata } = useBrTableData();
  const data = brtabledata;
  console.log(data);

  return (
    <div className="w-3/4 rounded-xl ">
      <div className="border border-gray-400 mb-6 flex rounded">
        <div className="w-1/3 bg-gray-200 font-semibold p-2 flex ">Item</div>
        <div className=" w-full items-center justify-center flex text-center font-bold p-2">
          {data.item}
        </div>
      </div>
      <h2 className="font-semibold my-2">Cash flow Gain/(loss)</h2>
      <div className="w-full flex gap-20">
        <div className="w-1/2">
          <div className="bg-gray-200 font-semibold p-2 flex text-center items-center justify-center">
            Buying
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="p-2">Unit Price</td>
                <td className="p-2 text-right">
                  {formatPrice(data.unit_price)}
                </td>
              </tr>
              <tr>
                <td className="p-2">No of Units</td>
                <td className="p-2 text-right">{formatPrice(data.units_no)}</td>
              </tr>
              <tr>
                <td className="p-2">Total Principal Cost</td>
                <td className="p-2 text-right">
                  {formatPrice(data.principal_cost)}
                </td>
              </tr>
              <tr>
                <td className="p-2">Interest Rate</td>
                <td className="p-2 text-right">{data.int_rate} %</td>
              </tr>
              <tr>
                <td className="p-2">Tenure-Years</td>
                <td className="p-2 text-right">
                  {formatPrice(data.fin_tenure)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Tenure-Months</td>
                <td className="p-2 text-right">
                  {formatPrice(data.tenure_months)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Monthly Instalment</td>
                <td className="p-2 text-right">
                  {formatPrice(data.monthly_installment)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Total Interest Cost</td>
                <td className="p-2 text-right">
                  {formatPrice(data.total_interest_cost)}
                </td>
              </tr>

              <tr className="font-semibold">
                <td className="p-2">Total Principal + Interest</td>
                <td className="p-2 text-right">
                  {formatPrice(
                    Number(data.principal_cost) +
                      Number(data.total_interest_cost),
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-2">Operation Cost for the Tenure</td>
                <td className="p-2 text-right">
                  {formatPrice(data.op_cost_tenure)}
                </td>
              </tr>
              <tr>
                <td className="p-2">Maintenance Cost for the Tenure</td>
                <td className="p-2 text-right">
                  {formatPrice(data.maintenance_cost_tenure)}
                </td>
              </tr>

              <tr className="bg-gray-100 font-semibold">
                <td className="p-2">Total Cost Outflow for period</td>
                <td className="p-2 text-right">
                  {formatPrice(data.cash_outflow_buying)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <div className="bg-gray-200 font-semibold p-2 flex text-center items-center justify-center">
            Renting
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="p-2">Unit Rental</td>
                <td className="p-2 text-right">
                  {formatPrice(data.monthly_rent)}
                </td>
              </tr>
              <tr>
                <td className="p-2">No of Units</td>
                <td className="p-2 text-right">{formatPrice(data.units_no)}</td>
              </tr>
              <tr>
                <td className="p-2">Tenure-Years</td>
                <td className="p-2 text-right">
                  {formatPrice(data.fin_tenure)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Tenure-Months</td>
                <td className="p-2 text-right">
                  {formatPrice(data.tenure_months)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Monthly Rent</td>
                <td className="p-2 text-right">
                  {formatPrice(data.total_monthly_rental)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Total Rental</td>
                <td className="p-2 text-right">
                  {formatPrice(data.total_rental_cost)}
                </td>
              </tr>

              <tr>
                <td className="p-2">Operation Cost for the Tenure</td>
                <td className="p-2 text-right">
                  {formatPrice(data.op_cost_rental)}
                </td>
              </tr>
              <tr>
                <td className="p-2">Maintenance Cost for the Tenure</td>
                <td className="p-2 text-right">
                  {formatPrice(data.maint_rental)}
                </td>
              </tr>
              <tr>
                <td className="p-2 h-9"></td>
                <td className="p-2 text-right"></td>
              </tr>
              <tr>
                <td className="p-2 h-9"></td>
                <td className="p-2 text-right"></td>
              </tr>
              <tr>
                <td className="p-2 h-9"></td>
                <td className="p-2 text-right"></td>
              </tr>

              <tr className="bg-gray-100 font-semibold">
                <td className="p-2">Total Cost Outflow for period</td>
                <td className="p-2 text-right">
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
            <>
              <span>Recommendation for</span>
              <span className="font-semibold">{data.chosentype}</span>
              <span>As on</span>
              <span className="font-semibold">
                {new Date(data.created_at).toLocaleString("en-AE", {
                  timeZone: "Asia/Dubai",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </h2>
        <ApproveButton />
      </div>
    </div>
  );
};

export default BrTable;
