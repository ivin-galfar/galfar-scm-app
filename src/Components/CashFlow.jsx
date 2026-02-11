import { formatPrice } from "../Helpers/helperfunctions";

const CashFlow = ({ data }) => {
  return (
    <div className="my-6 p-4 border border-gray-400 rounded leading-relaxed">
      Cash flow benefit in
      <span className="font-semibold mx-2">{data?.chosentype}</span>
      with benefit of (AED)
      <span className="font-semibold mx-2">
        Rs. {formatPrice(data?.benefit)}
      </span>
      in
      <span className="font-semibold mx-2">
        {formatPrice(data?.fin_tenure)} years
      </span>
    </div>
  );
};

export default CashFlow;
