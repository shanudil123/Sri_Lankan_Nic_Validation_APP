import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import React from "react";

export default function LoginPage() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = (ev) => {
    ev.preventDefault();
    axios
      .post("http://localhost:5000/auth/login", values)
      .then((res) => {
        if (res.data.status === "Success") {
          navigate("/upload");
        } else {
          alert(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-700">
        <h1 className="text-4xl text-center mb-8 font-bold text-gray-200">
          Login
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={values.email}
            onChange={(ev) => setValues({ ...values, email: ev.target.value })}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={values.password}
            onChange={(ev) =>
              setValues({ ...values, password: ev.target.value })
            }
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-semibold transition duration-300">
            Login
          </button>
          <div className="text-center py-4">
            <Link className="underline text-indigo-300 hover:text-indigo-400" to={"/forgot-password"}>
              Forgot Password?
            </Link>
          </div>
          <div className="text-center text-gray-400">
            Don't have an account yet?{" "}
            <Link
              className="underline text-indigo-300 hover:text-indigo-400"
              to={"/register"}
            >
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
