import { FaFileDownload } from "react-icons/fa";
import { useBrTableData } from "../store/brStore";

const FileContainer = () => {
  const { brtabledata, setbrtabledata } = useBrTableData();

  return (
    <>
      {brtabledata?.file?.length > 0 && (
        <div className="w-1/3 p-6 bg-gray-50 rounded-xl shadow-inner overflow-y-auto max-h-[40vh]">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
            Uploaded Files{" "}
            {brtabledata?.file_name?.length > 0
              ? `(${brtabledata?.file_name?.length})`
              : ""}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {brtabledata?.file || brtabledata?.file_name?.length > 0 ? (
              brtabledata?.file_name?.map((file, index) => {
                const url = brtabledata.file?.[index];
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
                  >
                    {/* <button
                      onClick={() =>
                        handleRemoveFile(index, brtabledata, setbrtabledata)
                      }
                      disabled={brtabledata?.created_at != ""}
                      className={`absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs font-bold cursor-pointer"}`}
                      title="Remove file"
                    >
                      ✕
                    </button> */}

                    <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                      📄
                    </div>

                    <p className="text-xs mt-2 text-gray-600 text-center truncate w-full">
                      {file}
                    </p>

                    <a
                      href={url}
                      target="_blank"
                      download
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      View & Download
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-gray-500 text-sm">
                No files uploaded yet
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FileContainer;
