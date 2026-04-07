import useUserInfo from "../CustomHooks/useUserInfo";
import { useQuery } from "@tanstack/react-query";
import { fetchfilenoteidvalue, fetchfilenoteids } from "../APIs/api";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useErrorMessage } from "../store/errorStore";
import { useParams } from "react-router-dom";
import { useDatasaved } from "../store/brStore";
import { useAttachments } from "../store/helperStore";
import { getCategoryCode, getTypeCode } from "../Helpers/helperfunctions";
const FileNoteDropDown = ({ setSelectedFnValue, setSelectedValue }) => {
  const { datasaved } = useDatasaved();
  const { attachments, setAttachments, resetAttachments } = useAttachments();

  const userInfo = useUserInfo();
  const { fn_no } = useParams();
  const dept_id = userInfo.dept_code;
  const { data } = useQuery({
    queryKey: [datasaved],
    queryFn: () => fetchfilenoteids({ userInfo, module: "/filenote", dept_id }),
    enabled: !!userInfo,
  });

  const navigate = useNavigate();
  const { setErrorMessage, clearErrorMessage } = useErrorMessage();

  const fetchfn = async () => {
    try {
      const fetchedval = await fetchfilenoteidvalue(fn_no, userInfo);
      setSelectedFnValue(fetchedval.content);
      setSelectedValue(fetchedval);
    } catch (error) {
      let message =
        error.response.data || error.message || "Something went wrong!";
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (fn_no != null) {
      fetchfn();
    } else {
      setSelectedFnValue("");
      setSelectedValue("");
    }
  }, [fn_no]);

  return (
    <div className="flex bg-gradient-to-r from-slate-50 to-blue-50 items-center hadow-md p-4  rounded-lg gap-4">
      <label className="ml-4 flex font-medium justify-center items-center text-nowrap">
        Choose Document
      </label>
      <select
        value={fn_no ?? ""}
        className="w-60 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2.5 text-sm font-medium
                text-gray-800 bg-white shadow-md cursor-pointer
                hover:border-blue-400 hover:shadow-lg transition-all duration-200
                focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                bg-no-repeat bg-right pr-12"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 0.9rem center",
        }}
        onChange={(e) => {
          const id = e.target.value;
          navigate(`/filenote/${id}`, { replace: true });
          resetAttachments();
        }}
      >
        <option value="">📋 Select FN/IOC</option>
        {data?.map((d) => {
          const dept =
            d.department_id == 1
              ? "P&E"
              : d.department_id == 2
                ? "Logistics"
                : "";
          return (
            <option key={d.id} value={d.id}>
              {getTypeCode(d.type)}/{dept}/ {d.category} - {d.doc_no}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FileNoteDropDown;
