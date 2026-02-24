import { formatPrice } from "../Helpers/helperfunctions";

const CashFlow = ({ data }) => {
  const currencysymbol = data?.currency?.split(" ")[2];

  return (
    <div className="my-6 p-4 border border-gray-300 rounded bg-gray-50 text-gray-700 leading-relaxed">
      Cash flow benefit in
      {data?.chosentype && (
        <span
          className={`font-semibold ${data.chosentype.trim() == "Buying" ? "bg-green-100 text-green-800" : " bg-blue-100 text-blue-800"} px-2 py-0.5 rounded-md mx-1`}
        >
          {data?.chosentype?.trim()}
        </span>
      )}
      {"  "}
      with benefit of {currencysymbol}
      <span className="font-semibold mx-1">{formatPrice(data?.benefit)}</span>
      in
      <span className="font-semibold mx-1">
        {formatPrice(data?.fin_tenure)} years
      </span>
    </div>
  );
};

export default CashFlow;
