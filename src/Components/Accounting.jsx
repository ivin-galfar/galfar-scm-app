import { formatPrice } from "../Helpers/helperfunctions";

const Accounting = ({ data }) => {
  const accounting_buying =
    Number(data.depreciation_cost) +
    Number(data.total_interest_cost) +
    Number(data.op_cost_tenure) +
    Number(data.maintenance_cost_tenure);

  return (
    <div>
      <h2 className="my-2 font-semibold">Accounting Gain/Loss</h2>
      <table className="w-full border border-gray-400">
        <tbody>
          <tr>
            <td className="p-2">Depreciation Rate</td>
            <td className="p-2 text-right">{data.dp_rate}.00 %</td>
          </tr>
          <tr>
            <td className="p-2">Depreciation Cost</td>
            <td className="p-2 text-right">
              {formatPrice(data.depreciation_cost)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Interest Cost</td>
            <td className="p-2 text-right">
              {formatPrice(data.total_interest_cost)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Operation & Maintenance Cost</td>
            <td className="p-2 text-right">
              {formatPrice(
                Number(data.op_cost_tenure) +
                  Number(data.maintenance_cost_tenure),
              )}
            </td>
          </tr>
          <tr>
            <td className="p-2">Total Expenses - BUYING</td>
            <td className="p-2 text-right">{formatPrice(accounting_buying)}</td>
          </tr>
          <tr>
            <td className="p-2">Total Expenses - Rentals</td>
            <td className="p-2 text-right">
              {formatPrice(data.cash_outflow_renting)}
            </td>
          </tr>
          <tr>
            <td className="p-2 bg-gray-300">
              Accounting Gain/Loss
              <span className="font-semibold mx-2">[{data.chosentype}]</span>
            </td>
            <td className="p-2 text-right  bg-gray-300">
              {formatPrice(data.cash_outflow_renting - accounting_buying)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Accounting;
