import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useBrCsIds,
  useBrTableData,
  useDatasaved,
  useNewStatement,
} from "../store/brStore";
import { fetchbrstatement } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";

const BrDropdown = () => {
  const navigate = useNavigate();
  const { brcs_ids } = useBrCsIds();
  const userinfo = useUserInfo();
  const { cs_no } = useParams();
  const { datasaved } = useDatasaved();
  const { setbrtabledata, resetbrtabledata } = useBrTableData();
  const { newstatement } = useNewStatement();
  const location = useLocation();
  const fetchBrStatement = async (cs_id) => {
    if (cs_id !== "default") {
      const selectedbr = await fetchbrstatement(cs_id, userinfo);
      setbrtabledata(selectedbr);
    } else {
      resetbrtabledata();
    }
  };
  useEffect(() => {
    if (brcs_ids?.length > 0 && !datasaved && newstatement) {
      navigate(`/brstatement/${brcs_ids[0].id}`, {
        replace: true,
      });
    }
    if (datasaved) {
      fetchBrStatement(cs_no);
    }
  }, [datasaved]);

  useEffect(() => {
    if (cs_no != "" && cs_no != "default" && cs_no != undefined) {
      fetchBrStatement(cs_no);
    } else {
      resetbrtabledata();
    }
  }, [cs_no]);

  return (
    <div className="py-6">
      <select
        value={cs_no ?? "default"}
        onChange={(e) => {
          const value = e.target.value;
          navigate(`/brstatement/${value}`, {
            replace: true,
          });
        }}
        className="w-80 appearance-none rounded-lg border-2 border-gray-300 px-5 py-3 text-sm font-medium
             text-gray-800 bg-white shadow-md cursor-pointer
             hover:border-blue-400 hover:shadow-lg transition-all duration-200
             focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
             bg-no-repeat bg-right pr-12"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 0.9rem center",
        }}
      >
        <option value="default">📋 Select Statement</option>
        {brcs_ids?.map((br_id) => (
          <option value={br_id.id} key={br_id.id}>
            {br_id.id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BrDropdown;
