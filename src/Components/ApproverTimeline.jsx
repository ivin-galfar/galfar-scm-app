import { getApproverName, getPmName } from "../Helpers/helperfunctions";

const ApproverTimeline = ({ approverhistory }) => {
  const info = approverhistory?.approver_info;

  let definedpm = getPmName(approverhistory?.project);
  let pmname = info?.find((pm) => pm?.role == "pm")?.pm || definedpm;

  let roles = ["initiator", "incharge", "pm", "gm", "fm", "ceo"];
  const createdBy = approverhistory?.createdby?.split("@")[0];
  const pendingindex = roles.findIndex((role) =>
    approverhistory?.status?.includes(role)
  );
  let rejectedindex = null;
  const rejected = approverhistory?.status == "rejected" || "";

  if (rejected != "") {
    rejectedindex = info?.length - 1;
  }

  const approved = approverhistory?.status === "approved" || "";

  const colorMap = roles.map((r, index) => {
    let color = "bg-blue-300";

    if (pendingindex > index) {
      color = "bg-green-600";
    }
    if (pendingindex == index) {
      color = "bg-yellow-600";
    }
    if (rejectedindex != null) {
      if (index == rejectedindex) {
        color = "bg-red-600";
      }
      if (index < rejectedindex) {
        return "bg-green-600";
      }
    }
    if (approved) {
      color = "bg-green-600";
    }
    return color;
  });

  const getComment = (role, approverhistory) => {
    switch (role) {
      case "incharge":
        return approverhistory?.comment_in;
      case "pm":
        return approverhistory?.comment_pm;
      case "gm":
        return approverhistory?.comment_gm;
      case "fm":
        return approverhistory?.comment_fm;
      case "ceo":
        return approverhistory?.comment_ceo;
      default:
        return "";
    }
  };

  return (
    <div className="overflow-y-auto w-3xl ">
      <div className="flex flex-col relative">
        {roles.map((ap, index) => {
          const isLeft = index % 2 === 0;
          const name =
            ap === "pm"
              ? pmname
              : ap === "initiator"
                ? createdBy
                : getApproverName(ap);
          const circleColor = colorMap[index];
          const comment = getComment(ap, approverhistory);

          return (
            <div
              key={index}
              className={`relative flex w-full items-center mb-12`}
            >
              <div
                className={`relative left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center rounded-2xl ${circleColor} text-white font-semibold z-10 text-center text-sm leading-tight`}
              >
                {ap.charAt(0).toUpperCase() + ap.slice(1)}
              </div>

              {index !== roles.length - 1 && (
                <div
                  className={`absolute left-1/2 top-20 w-0.5 ${ap == "fm" ? "h-20" : "h-60"}  bg-gray-300 z-0`}
                ></div>
              )}

              {name && (
                <div className={` ${isLeft ? "ml-14  " : "ml-90 "} max-w-50`}>
                  {" "}
                  <div
                    className={`
                    relative px-5 py-2 rounded-lg text-sm font-semibold border border-gray-400 text-gray-900  
                    ${name?.length < 10 ? "whitespace-nowrap" : ""}
                    ${ap === "pm" ? "max-w-46 text-xs" : ""}
                    ${
                      isLeft
                        ? "before:absolute before:-right-2 before:top-1/2 before:-translate-y-1/2 before:border-l-8 before:border-l-gray-400 before:border-t-4 before:border-t-transparent before:border-b-4 before:border-b-transparent min-w-40"
                        : "before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:border-r-8 before:border-r-gray-400 before:border-t-4 before:border-t-transparent before:border-b-4 before:border-b-transparent min-w-70"
                    }
                  `}
                  >
                    {name}
                    <div
                      className={`relative mt-1 text-xs text-gray-600 italic  text-wrap ${isLeft ? "text-left " : ""}`}
                    >
                      {info?.[index]?.datetime && (
                        <div
                          className={`mt-2 mb-1 inline-block  px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full items-center justify-center  `}
                        >
                          {new Date(info[index].datetime).toLocaleString()}
                        </div>
                      )}
                      {comment && (
                        <div class="mt-1 px-2 py-1 text-xs text-gray-800  bg-gray-200  rounded-xl">
                          {comment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApproverTimeline;
