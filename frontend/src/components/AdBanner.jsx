import React from "react";

const AdBanner = () => {
  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      <div className="w-full h-[90px] md:h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Advertisement
        </span>
      </div>
    </div>
  );
};

export default AdBanner;
