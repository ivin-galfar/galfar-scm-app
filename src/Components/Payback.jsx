import { formatPrice } from "../Helpers/helperfunctions";

const PaybackPeriod = ({ data }) => {
  return (
    <div className="my-10">
      <h2 className="my-2 font-semibold text-gray-700">Payback Period</h2>

      <table className="w-full border border-gray-400">
        <tbody>
          {/* Header row */}
          <tr className="bg-blue-50 text-blue-800 font-semibold">
            <td className="p-2 border-b border-gray-400">Particulars</td>
            <td className="p-2 text-right border-l border-b border-gray-400">
              Without Maint
            </td>
            <td className="p-2 text-right border-l border-b border-gray-400">
              Incl Maint
            </td>
          </tr>

          {/* Data rows */}
          <tr className="hover:bg-gray-50">
            <td className="p-2">Total Cost in Buying</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.cost_in_buying_without_main)}
            </td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.cost_in_buying_with_main)}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="p-2">Monthly Rentals</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.total_monthly_rental)}
            </td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.total_monthly_rental)}
            </td>
          </tr>

          {/* Result row */}
          <tr className="bg-green-100 text-green-900 font-semibold">
            <td className="p-2">Payback Period - Months</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(
                data.cost_in_buying_without_main / data.total_monthly_rental,
              )}
            </td>
            <td className="p-2 text-right border-l border-gray-400">
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

export default PaybackPeriod;
