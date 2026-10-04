const Loading = ({ isLoading }) => {
  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_16px_40px_-20px_rgb(15_23_42/0.35)]">
            <div className="relative h-11 w-11">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-blue-600 border-t-blue-600 motion-reduce:animate-none"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">
                Loading Statement (s)
              </p>
              <p className="mt-1 text-xs text-slate-500">Please wait...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;
