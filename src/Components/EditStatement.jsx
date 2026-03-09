import { MdModeEdit } from "react-icons/md";
import { useIsEditing } from "../store/helperStore";
import { useBrTableData, useNewStatement } from "../store/brStore";
import { GrRevert } from "react-icons/gr";
import { updatebrstatements } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../store/toastStore";
import { is_buyrent, is_hod } from "../Helpers/dept_helper";

const EditStatement = ({ onClick }) => {
  const { isedit, setIsEdit, resetIsEdit } = useIsEditing();
  const { brtabledata, setbrtabledata } = useBrTableData();
  const userInfo = useUserInfo();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { resetNewStatement } = useNewStatement();
  const ishod = is_hod(userInfo?.role);
  const { mutate: updatestatement } = useMutation({
    mutationFn: updatebrstatements,
    onSuccess: () => {
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        resetIsEdit();
      }, 1500);
    },

    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrorMessage(message);
    },
  });

  const recallStatement = () => {
    let updatedstatus = "reverted";
    setbrtabledata((prev) => ({
      ...prev,
      status: updatedstatus,
    }));

    updatestatement({ cs_id: brtabledata.id, status: updatedstatus, userInfo });
  };
  console.log(brtabledata.status);

  return (
    <div className="flex  justify-between gap-5">
      {(brtabledata.status == "created" ||
        brtabledata.status == "reverted" ||
        brtabledata.status == "review" ||
        (ishod && brtabledata.status == "pending for hod")) && (
        <button
          type="button"
          className={`p-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-50  hover:bg-blue-100 active:bg-blue-200 ${brtabledata.id == null ? "cursor-auto" : "cursor-pointer"} `}
          disabled={brtabledata.id == null}
          onClick={() => {
            onClick();
            setIsEdit();
            resetNewStatement();
          }}
        >
          <MdModeEdit />
          Edit Statement
        </button>
      )}
      {brtabledata.status != "reverted" &&
        brtabledata.status != "created" &&
        brtabledata.status != "approved" &&
        brtabledata.status !== "review" &&
        brtabledata.status !== "rejected" &&
        userInfo.role?.includes("inita") &&
        !ishod && (
          <button
            type="button"
            className={`p-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-50  hover:bg-blue-100 active:bg-blue-200 ${brtabledata.id == null ? "cursor-auto" : "cursor-pointer"} `}
            disabled={brtabledata.id == null}
            onClick={recallStatement}
          >
            <GrRevert
              className={`cursor-pointer hover:text-gray-800`}
              size={20}
            />
            Revert Statement
          </button>
        )}
    </div>
  );
};

export default EditStatement;
