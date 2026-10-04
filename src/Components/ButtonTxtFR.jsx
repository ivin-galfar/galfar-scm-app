/* eslint-disable react/prop-types */
import { getFleetRequestAction } from "../Helpers/approvalFlowHelper";

const ButtonTxtFR = ({
  fleetRequest,
  userInfo,
  isNew,
  isLoading,
  onAction,
}) => {
  const buttonAction = getFleetRequestAction({
    fleetRequest,
    user: userInfo,
    isNew,
  });

  if (!buttonAction) return null;

  return (
    <button
      type="button"
      onClick={() => !buttonAction.disabled && onAction(buttonAction)}
      disabled={isLoading || buttonAction.disabled}
      className={`rounded px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        buttonAction.disabled
          ? "cursor-not-allowed bg-slate-400"
          : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 cursor-pointer"
      } disabled:opacity-70`}
    >
      {isLoading ? "Processing..." : buttonAction.label}
    </button>
  );
};

export default ButtonTxtFR;
