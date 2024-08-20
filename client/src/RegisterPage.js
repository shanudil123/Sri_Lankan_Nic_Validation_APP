import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function RegisterPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = (ev) => {
    ev.preventDefault();
    axios
      .post("http://localhost:5000/auth/register", values)
      .then((res) => {
        if (res.data.status === "Success") {
          navigate("/login");
        } else {
          alert("Error");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
        <h1 className="text-4xl text-center mb-6 font-bold text-gray-200">
          Register
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="John Doe"
            value={values.name}
            onChange={(ev) => setValues({ ...values, name: ev.target.value })}
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={values.email}
            onChange={(ev) => setValues({ ...values, email: ev.target.value })}
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="password"
            value={values.password}
            onChange={(ev) =>
              setValues({ ...values, password: ev.target.value })
            }
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full font-semibold transition duration-300"
          >
            Register
          </button>
          <div className="text-center py-2 text-gray-400">
            Already a member?{" "}
            <Link
              className="underline text-indigo-300 hover:text-indigo-400"
              to={"/login"}
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
