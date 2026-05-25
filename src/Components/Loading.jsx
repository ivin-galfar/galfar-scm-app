const Loading = ({ isLoading }) => {
  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 rounded">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"
                style={{
                  animation: "spin 1s linear infinite",
                }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                Loading Statements
              </p>
              <p className="text-xs text-gray-500 mt-1">Please wait...</p>
            </div>
          </div>
          <style>{`
                  @keyframes spin {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
        </div>
      )}
    </div>
  );
};

export default Loading;
