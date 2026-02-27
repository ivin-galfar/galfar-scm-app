import { formatPrice } from "../Helpers/helperfunctions";

const Accounting = ({ data }) => {
  const accounting_buying =
    Number(data.depreciation_cost) +
    Number(data.total_interest_cost) +
    Number(data.op_cost_tenure) +
    Number(data.maintenance_cost_tenure);

  return (
    <div>
      <div className="w-1/2 px-4 py-2 mb-3 text-sm font-semibold text-purple-800 bg-purple-200 border-l-4 border-blue-500 rounded shadow-sm">
        Accounting Gain / Loss
      </div>

      <table className="w-full border border-gray-400">
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="p-2">Depreciation Rate</td>
            <td className="p-2 text-right border-l border-gray-400 w-40">
              {data.dp_rate}.00 %
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="p-2">Depreciation Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.depreciation_cost)}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="p-2">Interest Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.total_interest_cost)}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="p-2">Operation & Maintenance Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(
                Number(data.op_cost_tenure) +
                  Number(data.maintenance_cost_tenure),
              )}
            </td>
          </tr>

          <tr className="hover:bg-gray-50 font-semibold">
            <td className="p-2">Total Expenses - Buying</td>
            <td className="p-2 text-right border-l border-gray-400 font-semibold">
              {formatPrice(accounting_buying)}
            </td>
          </tr>

          <tr className="hover:bg-gray-50 font-semibold">
            <td className="p-2">Total Expenses - Rentals</td>
            <td className="p-2 text-right border-l border-gray-400 font-semibold">
              {formatPrice(data.total_rental_cost)}
            </td>
          </tr>

          {/* Final Highlight Row */}
          <tr className="bg-purple-100 font-semibold text-purple-900">
            <td className="p-2 font-semibold">
              Accounting Gain/Loss
              {data.chosentype && (
                <span
                  className={`font-semibold ${
                    data.chosentype.trim() && "bg-yellow-200 text-gray-700"
                  } px-2 py-0.5 rounded-md mx-1`}
                >
                  [{data.chosentype?.trim()}]
                </span>
              )}
            </td>
            <td className="p-2 text-right border-l border-gray-400 font-semibold">
              {formatPrice(data.total_rental_cost - accounting_buying)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Accounting;
