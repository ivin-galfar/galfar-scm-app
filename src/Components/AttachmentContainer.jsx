import { IoSave } from "react-icons/io5";
import { useBrTableData, useImageSaved } from "../store/brStore";
import {
  handleRemoveBrFile,
  handleRemoveFiles,
} from "../Helpers/helperfunctions";
import { useState } from "react";
import { updatebrstatementImages } from "../APIs/api";
import { useMutation } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useToast } from "../store/toastStore";
import { is_hod } from "../Helpers/dept_helper";
import { useAttachments } from "../store/helperStore";
import UploadAttachments from "./UploadAttachments";

const AttachmentsContainer = ({ file, file_name, newfn }) => {
  const userInfo = useUserInfo();
  const ishod = is_hod(userInfo?.role);
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { imagesaved } = useImageSaved();
  const { attachments, setAttachments, resetAttachments } = useAttachments();

  return (
    <>
      <div className="w-1/3 ml-15 p-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[45vh]">
        <div className="text-base flex font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2 justify-between">
          📎 Attachments {file?.length > 0 ? `(${file?.length})` : ""}
          <UploadAttachments
            styles={newfn ? "cursor-pointer" : "pointer-events-none opacity-50"}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {file?.length > 0 ? (
            file?.map((file, index) => {
              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200 hover:border-blue-400"
                >
                  {attachments.length > 0 && (
                    <button
                      onClick={() =>
                        handleRemoveFiles(index, attachments, setAttachments)
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
                    {file_name?.[index]}
                  </p>

                  <a
                    href={file}
                    target="_blank"
                    download
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2 transition-colors cursor-pointer"
                  >
                    View/ Download
                  </a>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-gray-400 text-sm py-4">
              No Attachments found
            </div>
          )}
        </div>
      </div>

      {showtoast && imagesaved && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have successfully updated the image!
        </div>
      )}
    </>
  );
};

export default AttachmentsContainer;
