import React from "react";

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 flex flex-col items-center p-6">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-300 mt-12">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">
          Files Uploaded Successfully!
        </h2>
        <p className="text-center text-gray-200">
          Your files have been uploaded and processed. You can now proceed with
          further actions.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
