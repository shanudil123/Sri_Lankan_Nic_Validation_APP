import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null); // Reference for file input
  const navigate = useNavigate();

  // Handle file selection via input
  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    setFiles([...files, ...Array.from(droppedFiles)]);
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        navigate("/dashboard");
      } else {
        setError("Upload failed: " + response.data.message);
      }
    } catch (error) {
      setError("Error uploading files: " + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center p-6">
      {/* Logout Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-full font-semibold hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-xl transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      {/* Centered Upload Box */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-gray-700 mt-12">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-200">
          Upload NIC CSV Files
        </h2>

        {/* Drag and Drop Zone */}
        <div
          className={`p-6 border-4 border-dashed rounded-xl transition duration-300 ${
            isDragging ? "border-green-500 bg-green-100" : "border-gray-700"
          }`}
          onClick={handleClick} // Trigger file input click
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V12a4 4 0 114 4h3a4 4 0 11-4 4v-3m0-5v1m0 0V9m0 5v3"
              />
            </svg>
            <p className="text-lg text-gray-300">
              {isDragging
                ? "Drop files here..."
                : "Drag and drop files here or click to select"}
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef} // Add reference to input
          />
        </div>

        {/* List of selected files with remove option */}
        {files.length > 0 && (
          <div className="mt-6">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-gray-200 bg-gray-700 p-3 rounded-lg mb-2 shadow-sm"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-400 hover:text-red-300 font-bold transition duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-full font-bold hover:from-indigo-600 hover:to-purple-600 transition duration-300 shadow-lg transform hover:scale-105 mt-6"
        >
          Upload
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-6 text-red-400 text-center font-semibold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFiles;
