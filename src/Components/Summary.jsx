import { formatPrice } from "../Helpers/helperfunctions";

const Summary = ({ data }) => {
  const accounting_buying =
    Number(data.depreciation_cost) +
    Number(data.total_interest_cost) +
    Number(data.op_cost_tenure) +
    Number(data.maintenance_cost_tenure);
  return (
    <div className="my-10">
      <h2 className="my-2 font-semibold">Summary</h2>
      <table className="w-full border border-gray-400">
        <tbody>
          <tr>
            <td className="p-2">Cash flow benefit in</td>
            <td className="p-2 ">{formatPrice(data.fin_tenure)} years</td>
            <td className="p-2">Cash flow benefit in</td>
            <td className="p-2 font-semibold">{data.chosentype}</td>
            <td className="p-2 "> {formatPrice(data.benefit)}</td>
          </tr>
          <tr>
            <td className="p-2">Accounting Gains in </td>
            <td className="p-2 ">{formatPrice(data.fin_tenure)}</td>
            <td className="p-2">Accounting Gain/Loss</td>
            <td className="p-2 font-semibold ">{data.chosentype}</td>
            <td className="p-2 ">
              {" "}
              {formatPrice(data.cash_outflow_renting - accounting_buying)}
            </td>
          </tr>
          <tr>
            <td className="p-2">With Payback period of</td>
            <td className="p-2 ">
              {formatPrice(
                data.cost_in_buying_with_main / data.total_monthly_rental,
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Summary;
