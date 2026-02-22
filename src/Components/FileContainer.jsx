import { IoSave } from "react-icons/io5";
import { useBrTableData, useImageSaved } from "../store/brStore";
import { handleRemoveBrFile } from "../Helpers/helperfunctions";
import { useState } from "react";
import { updatebrstatementImages } from "../APIs/api";
import { useMutation } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useToast } from "../store/toastStore";
import { is_hod } from "../Helpers/dept_helper";

const FileContainer = () => {
  const { brtabledata, setbrtabledata } = useBrTableData();
  const { imagesaved, setImageSaved, resetImageSaved } = useImageSaved();
  const userInfo = useUserInfo();
  const ishod = is_hod(userInfo?.role);
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <>
      {brtabledata?.file?.length > 0 || hasChanges ? (
        <div className="w-1/3 p-4  bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[45vh]">
          <div className="text-base flex font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2 justify-between">
            📎 Uploaded Files{" "}
            {brtabledata?.filename?.length > 0
              ? `(${brtabledata?.filename?.length})`
              : ""}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {brtabledata?.file?.length > 0 ? (
              brtabledata?.filename?.map((file, index) => {
                const url = brtabledata.file?.[index];
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200 hover:border-blue-400"
                  >
                    {(brtabledata.status == "created" ||
                      brtabledata.status == "reverted" ||
                      (ishod && brtabledata.status == "pending for hod")) && (
                      <button
                        onClick={() =>
                          handleRemoveBrFile(
                            index,
                            brtabledata,
                            setbrtabledata,
                            setHasChanges,
                          )
                        }
                        className={`absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm font-bold cursor-pointer transition-colors`}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    )}

                    <div className="w-14 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-md">
                      📄
                    </div>

                    <p className="text-xs mt-3 text-gray-700 text-center truncate w-full font-medium">
                      {file}
                    </p>

                    <a
                      href={url}
                      target="_blank"
                      download
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2 transition-colors"
                    >
                      View/ Download
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-gray-400 text-sm py-4">
                No files uploaded yet
              </div>
            )}
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No Files Attached</span>
      )}
      {showtoast && imagesaved && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have successfully updated the image!
        </div>
      )}
    </>
  );
};

export default FileContainer;
