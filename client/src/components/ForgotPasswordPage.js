import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); // Stores user input for email
  const navigate = useNavigate();

  const handleSubmit = (ev) => {
    ev.preventDefault();

    axios
      .post("http://localhost:5000/auth/forgot-password", { email }) // Sends email to server
      .then((res) => {
        if (res.data.status === "Success") {
          alert("Verification code sent to your email");
          navigate("/reset-password"); // Redirects user to ResetPasswordPage.js
        } else {
          alert(res.data.Error); // Shows an error if something went wrong
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-700">
        <h1 className="text-4xl text-center mb-8 font-bold text-gray-200">
          Forgot Password
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)} // Updates email state as user types
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-semibold transition duration-300">
            Send Verification Code
          </button>
        </form>
      </div>
    </div>
  );
}
