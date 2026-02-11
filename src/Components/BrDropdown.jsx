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
    if (cs_no != "" && cs_no != "default" && cs_no != undefined) {
      fetchBrStatement(cs_no);
    } else {
      resetbrtabledata();
    }
  }, [cs_no]);

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

  return (
    <div className="px-6">
      <select
        value={cs_no ?? "default"}
        onChange={(e) => {
          const value = e.target.value;
          navigate(`/brstatement/${value}`, {
            replace: true,
          });
        }}
        className=" rounded-xl border border-gray-300 px-4 py-2.5 text-sm
             text-gray-800 shadow-inner
             focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600
             transition"
      >
        <option value="default">Select option</option>
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
