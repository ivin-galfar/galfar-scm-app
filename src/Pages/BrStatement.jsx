import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import NewBrModal from "../Components/NewBrModal";
import { useToast } from "../store/toastStore";
import BrHeader from "../Components/BrHeader";
import BrTable from "../Components/BrTable";
import BrDropdown from "../Components/BrDropdown";
import EditStatement from "../Components/EditStatement";
import { useBrCsIds, useBrTableData } from "../store/brStore";
import { fetchbrstatements } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import FileContainer from "../Components/FileContainer";
import { useIsEditing } from "../store/helperStore";
import { useNewStatement } from "../store/brStore";

const BrStatement = () => {
  const [isOpen, setIsopen] = useState(false);
  const { showtoast } = useToast();
  const [clickedsave, setClickedSave] = useState(false);
  const { setBrCs_ids } = useBrCsIds();
  const userinfo = useUserInfo();
  const { resetbrtabledata, brtabledata } = useBrTableData();
  const { isedit } = useIsEditing();
  const { newstatement, setNewStatement, resetNewStatement } =
    useNewStatement();
  useEffect(() => {
    const fetchAllIds = async () => {
      try {
        const allids = await fetchbrstatements({
          userinfo,
          module: "/brstatement",
        });
        setBrCs_ids(allids);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllIds();
  }, [userinfo, clickedsave]);

  return (
    <div className="w-full px-5 flex-grow ">
      <div className="absolute w-1/3 py-2 gap-10 flex p-6">
        <span className="flex  justify-center font-semibold text-sm px-2 py-2  gap-2 h-10 bg-blue-600 rounded-2xl text-white items-center cursor-pointer">
          {" "}
          <FaPlus />
          <button
            data-modal-target="crud-modal"
            data-modal-toggle="crud-modal"
            className="text-white bg-brand border border-transparent hover:bg-brand-strong shadow-xs font-medium leading-5 rounded-lg text-sm px-4 py-2.5  focus:outline-none cursor-pointer"
            type="button"
            onClick={() => {
              setIsopen(true);
              resetbrtabledata();
              setNewStatement();
            }}
          >
            Create Statement
          </button>
        </span>
      </div>
      <BrHeader />
      <div className="flex justify-between">
        <BrDropdown />
        {userinfo?.is_admin && brtabledata.id && (
          <EditStatement onClick={() => setIsopen(true)} />
        )}
      </div>
      {showtoast && userinfo?.is_admin && !isedit && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have successfully created the Statement!
        </div>
      )}

      <div className="flex p-6 gap-6 ">
        <BrTable />
        <FileContainer />
      </div>
      {isOpen && (
        <NewBrModal
          setIsopen={setIsopen}
          clickedsave={clickedsave}
          setClickedSave={setClickedSave}
        />
      )}
      {showtoast && userinfo?.is_admin && isedit && (
        <div
          className="fixed top-5 left-1/2 transform -translate-x-1/2 
                  bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                  transition-all duration-300 animate-slide-in z-[9999]"
        >
          ✅ You have successfully Updated the Statement!
        </div>
      )}
    </div>
  );
};

export default BrStatement;
