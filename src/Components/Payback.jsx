import { formatPrice } from "../Helpers/helperfunctions";

const PaybackPeriod = ({ data }) => {
  return (
    <div className="my-10">
      <h2 className="my-2 font-semibold">Payback period</h2>
      <table className="w-full border border-gray-400">
        <tbody>
          <tr>
            <td className="p-2"></td>
            <td className="p-2 text-right font-semibold">Without Maint</td>
            <td className="p-2 text-right font-semibold">Incl Maint</td>
          </tr>
          <tr>
            <td className="p-2">Total Cost in Buying</td>
            <td className="p-2 text-right">
              {formatPrice(data.cost_in_buying_without_main)}
            </td>
            <td className="p-2 text-right">
              {formatPrice(data.cost_in_buying_with_main)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Monthly Rentals</td>
            <td className="p-2 text-right">
              {formatPrice(data.total_monthly_rental)}
            </td>
            <td className="p-2 text-right">
              {formatPrice(data.total_monthly_rental)}
            </td>
          </tr>
          <tr>
            <td className="p-2 bg-gray-300">Payback period - Months</td>
            <td className="p-2 text-right bg-gray-300">
              {formatPrice(
                data.cost_in_buying_without_main / data.total_monthly_rental,
              )}
            </td>
            <td className="p-2 text-right bg-gray-300">
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
