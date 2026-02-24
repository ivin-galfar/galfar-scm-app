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
            <td className="p-2 text-right border-l border-gray-400 w-40 ">
              {data.dp_rate}.00 %
            </td>
          </tr>
          <tr>
            <td className="p-2">Depreciation Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.depreciation_cost)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Interest Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.total_interest_cost)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Operation & Maintenance Cost</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(
                Number(data.op_cost_tenure) +
                  Number(data.maintenance_cost_tenure),
              )}
            </td>
          </tr>
          <tr>
            <td className="p-2">Total Expenses - Buying</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(accounting_buying)}
            </td>
          </tr>
          <tr>
            <td className="p-2">Total Expenses - Rentals</td>
            <td className="p-2 text-right border-l border-gray-400">
              {formatPrice(data.total_rental_cost)}
            </td>
          </tr>
          <tr>
            <td className="p-2 bg-gray-200">
              Accounting Gain/Loss
              {data.chosentype && (
                <span
                  className={`font-semibold ${
                    data.chosentype.trim() === "Buying"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  } px-2 py-0.5 rounded-md mx-1`}
                >
                  [{data.chosentype?.trim()}]
                </span>
              )}
            </td>
            <td className="p-2 text-right border-l border-gray-400  bg-gray-200">
              {formatPrice(data.total_rental_cost - accounting_buying)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Accounting;
