import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const MaleUsers = () => {
  const [maleUsers, setMaleUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaleUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/report");
        const filteredMaleUsers = response.data.filter(
          (user) => user.gender === "Male"
        );
        setMaleUsers(filteredMaleUsers);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };
    fetchMaleUsers();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Male Users Report", 20, 10);
    doc.autoTable({
      head: [["NIC", "Birthday", "Age", "Gender"]],
      body: maleUsers.map((user) => [
        user.nic,
        user.birthday,
        user.age,
        user.gender,
      ]),
    });
    doc.save("male_users_report.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(maleUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Male Users");
    XLSX.writeFile(workbook, "male_users_report.xlsx");
  };

  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login"); // Redirect to login page
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-8 px-6 flex justify-center items-center">
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

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Male Users Report
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">NIC</th>
                <th className="px-4 py-3">Birthday</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Gender</th>
              </tr>
            </thead>
            <tbody>
              {maleUsers.map((user, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"
                  }`}
                >
                  <td className="border px-4 py-3">{user.nic}</td>
                  <td className="border px-4 py-3">{user.birthday}</td>
                  <td className="border px-4 py-3">{user.age}</td>
                  <td className="border px-4 py-3">{user.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 ease-in-out shadow-md"
          >
            Download PDF
          </button>

          <CSVLink
            data={maleUsers}
            filename={"male_users_report.csv"}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-800 transition duration-300 ease-in-out shadow-md"
          >
            Download CSV
          </CSVLink>

          <button
            onClick={downloadExcel}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition duration-300 ease-in-out shadow-md"
          >
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaleUsers;
