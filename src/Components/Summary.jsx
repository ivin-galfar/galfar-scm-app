import { formatPrice } from "../Helpers/helperfunctions";

const Summary = ({ data }) => {
  const accounting_buying =
    Number(data.depreciation_cost) +
    Number(data.total_interest_cost) +
    Number(data.op_cost_tenure) +
    Number(data.maintenance_cost_tenure);
  return (
    <div className="my-10">
      <div className="w-1/2 px-4 py-2 mb-3 text-sm font-semibold text-purple-800 bg-purple-200 border-l-4 border-blue-500 rounded shadow-sm">
        Summary
      </div>

      <table className="w-full border border-gray-400 rounded">
        <tbody>
          <tr className="hover:bg-blue-50">
            <td className="p-2 border-l border-b border-gray-400">
              Cash flow benefit in
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              {formatPrice(data.fin_tenure)} <span className="ml-3">Years</span>
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              Cash flow benefit in
            </td>
            <td className="p-2 font-semibold border-l border-b border-gray-400">
              {data.chosentype}
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              {formatPrice(data.benefit)}
            </td>
          </tr>
          <tr className="hover:bg-green-50">
            <td className="p-2 border-l border-b border-gray-400">
              Accounting Gains in
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              {formatPrice(data.fin_tenure)} <span className="ml-3">Years</span>
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              Accounting Gain/Loss
            </td>
            <td className="p-2 font-semibold border-l border-b border-gray-400">
              {data.chosentype}
            </td>
            <td className="p-2 border-l border-b border-gray-400">
              {formatPrice(data.total_rental_cost - accounting_buying)}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-l border-b border-gray-400">
              With Payback period of
            </td>
            <td className="p-2 border-l border-b border-gray-400 border-r">
              {formatPrice(
                data.cost_in_buying_with_main / data.total_monthly_rental,
              )}{" "}
              <span className="ml-2">Months</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Summary;
