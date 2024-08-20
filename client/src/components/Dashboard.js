import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaMale,
  FaFemale,
  FaExclamationTriangle,
} from "react-icons/fa"; // Icons

Chart.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalRecords: 0,
    maleUsers: 0,
    femaleUsers: 0,
    rejectedRecords: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard");
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, []);

  const data = {
    labels: ["Male Users", "Female Users"],
    datasets: [
      {
        label: "User Distribution",
        data: [summary.maleUsers, summary.femaleUsers],
        backgroundColor: ["#4A90E2", "#e84d5f"],
        hoverBackgroundColor: ["#357ABD", "#C8102E"],
      },
    ],
  };

  const handleViewReport = () => {
    navigate("/report");
  };

  const handleMaleUsersClick = () => {
    navigate("/male-users");
  };

  const handleRejectedRecordsClick = () => {
    navigate("/rejected-records");
  };

  // Logout function
  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      {/* Logout Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-full font-semibold hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-xl transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      <div className="relative bg-white rounded-3xl p-8 max-w-4xl w-full shadow-xl border border-gray-300 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Content inside */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mix-blend-multiply opacity-25 filter blur-xl -z-10 transform -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-teal-400 to-green-500 rounded-full mix-blend-multiply opacity-25 filter blur-xl -z-10 transform translate-x-1/3 translate-y-1/3"></div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 shadow-lg flex-1 max-w-md mx-auto">
          <h3 className="text-3xl font-semibold text-gray-200 mb-6 text-center">
            User Distribution
          </h3>
          <div className="w-full">
            <Pie data={data} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-lg flex-1 max-w-md mx-auto text-center">
          <h3 className="text-3xl font-semibold text-gray-200 mb-6">Summary</h3>
          <div className="grid grid-cols-2 gap-6 text-gray-200">
            {/* Total Records Section */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={handleViewReport}
            >
              <FaUsers className="text-blue-400 text-5xl mb-3" />
              <span className="text-5xl font-bold">{summary.totalRecords}</span>
              <span className="text-gray-400 text-lg">Total Records</span>
            </div>

            {/* Male Users Section */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={handleMaleUsersClick}
            >
              <FaMale className="text-blue-400 text-5xl mb-3" />
              <span className="text-5xl font-bold">{summary.maleUsers}</span>
              <span className="text-gray-400 text-lg">Male Users</span>
            </div>
            {/* Female Users Section */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate("/female-users")} // Add onClick event here
            >
              <FaFemale className="text-[#e84d5f] text-5xl mb-3" />
              <span className="text-5xl font-bold">{summary.femaleUsers}</span>
              <span className="text-gray-400 text-lg">Female Users</span>
            </div>

            {/* Rejected Records Section */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={handleRejectedRecordsClick}
            >
              <FaExclamationTriangle className="text-red-400 text-5xl mb-3" />
              <span className="text-5xl font-bold">
                {summary.rejectedRecords}
              </span>
              <span className="text-gray-400 text-lg">Rejected Records</span>
            </div>
          </div>

          <div className="mt-6 space-x-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
