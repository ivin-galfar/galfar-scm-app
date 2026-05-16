const InputSearch = ({
  handleSearch: onSearch,
  search,
  setSearch,
  setSearchCSName,
  setSearchCSNo,
  module,
}) => {
  const labelMap = {
    lg: "Cargo",
    br: "Item",
    fn: "Subject",
  };
  const label = labelMap[module] || "Name";
  return (
    <div className="ml-auto flex mt-4 flex-col gap-2 sm:flex-row items-center justify-center">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => {
            setSearch({
              isText: true,
              isNumber: false,
              value: "",
            });
            setSearchCSNo("");
          }}
          className={`px-3 py-1 text-xs rounded-md transition cursor-pointer ${
            search.isText
              ? "bg-white shadow text-amber-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
        <button
          onClick={() => {
            setSearch({
              isNumber: true,
              isText: false,
              value: "",
            });
            setSearchCSName("");
          }}
          className={`px-3 py-1 text-xs rounded-md transition cursor-pointer ${
            search.isNumber
              ? "bg-white shadow text-green-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {module == "lg" ? "Ship." : "No."}
        </button>
      </div>
      <input
        type="text"
        name="search"
        value={search.value || ""}
        onChange={onSearch}
        className="w-full  min-w-0 h-8 border border-gray-300 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
        placeholder="Search..."
      />
    </div>
  );
};

export default InputSearch;
