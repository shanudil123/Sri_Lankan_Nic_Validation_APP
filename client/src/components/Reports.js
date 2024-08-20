import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Report = () => {
  const [reportData, setReportData] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get("http://localhost:5000/report");
        setReportData(response.data);

        const ageDist = response.data.reduce((acc, item) => {
          const ageRange = Math.floor(item.age / 10) * 10;
          acc[ageRange] = (acc[ageRange] || 0) + 1;
          return acc;
        }, {});

        const genderDist = response.data.reduce((acc, item) => {
          acc[item.gender] = (acc[item.gender] || 0) + 1;
          return acc;
        }, {});

        setAgeDistribution(ageDist);
        setGenderDistribution(genderDist);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };
    fetchReport();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Report Details", 20, 10);
    doc.autoTable({
      head: [["NIC", "Birthday", "Age", "Gender"]],
      body: reportData.map((item) => [
        item.nic,
        item.birthday,
        item.age,
        item.gender,
      ]),
    });
    doc.save("report.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  const handleDownloadRejectedRecords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/report/rejected",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "rejected_records.csv";
      link.click();
    } catch (error) {
      console.error("Error downloading rejected records:", error);
    }
  };

  // Logout function
  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login"); // Redirect to login page
  };

  // Navigate to Dashboard
  const handleBack = () => {
    navigate("/dashboard");
  };

  const chartData = {
    labels: Object.keys(ageDistribution),
    datasets: [
      {
        label: "Age Distribution",
        data: Object.values(ageDistribution),
        backgroundColor: "#4A90E2",
        borderColor: "#357ABD",
        borderWidth: 1,
      },
      {
        label: "Gender Distribution",
        data: Object.values(genderDistribution),
        backgroundColor: "#e84d5f",
        borderColor: "#C8102E",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-gray-100 p-4">
      {/* Buttons */}
      <div className="absolute top-6 left-6 flex gap-4">
        <button
          onClick={handleBack}
          className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-600"
        >
          Back
        </button>
      </div>
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-900 text-white p-8 rounded-lg min-h-screen">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Report Details
        </h2>

        <div className="w-full max-w-4xl mx-auto mb-8">
          <Bar
            data={chartData}
            options={{
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Categories",
                    color: "#ffffff",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Counts",
                    color: "#ffffff",
                  },
                },
              },
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#ffffff",
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div className="mt-6 flex justify-center flex-wrap gap-4">
          <button
            onClick={downloadPDF}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          >
            Download PDF
          </button>

          <CSVLink
            data={reportData}
            filename={"report.csv"}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          >
            Download CSV
          </CSVLink>

          <button
            onClick={downloadExcel}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
          >
            Download Excel
          </button>
        </div>

        {/* Footer Area */}
        <div className="bg-gray-800 text-gray-400 text-center py-6 mt-12 rounded-lg shadow-lg">
          <p className="text-sm">
            © {new Date().getFullYear()} NIC Validation System. All rights
            reserved.
          </p>
          <p className="text-sm">
            Designed and Developed by{" "}
            <span className="text-blue-500">Shanuka Dilshan</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
