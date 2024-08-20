import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [code, setCode] = useState(""); // Stores the verification code
  const [newPassword, setNewPassword] = useState(""); // Stores the new password
  const [email, setEmail] = useState(""); // Stores the user's email
  const navigate = useNavigate();

  const handleSubmit = (ev) => {
    ev.preventDefault();

    axios
      .post("http://localhost:5000/auth/reset-password", {
        code,
        newPassword,
        email,
      })
      .then((res) => {
        if (res.data.status === "Success") {
          alert("Password reset successful!");
          navigate("/login");
        } else {
          alert(res.data.Error);
        }
      })
      .catch((err) => console.log("Error:", err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-700">
        <h1 className="text-4xl text-center mb-8 font-bold text-gray-200">
          Reset Password
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(ev) => setCode(ev.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-semibold transition duration-300">
            Reset Password
          </button>
          <div className="text-center py-4">
            <a
              href="/login"
              className="underline text-indigo-300 hover:text-indigo-400"
            >
              Return to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
