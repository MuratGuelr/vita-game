import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [username, setUsername] = useState("");
  const [onlineStatus, setOnlineStatus] = useState("online");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          username,
          firstName: fname,
          lastName: lname,
          email: user.email,
          darkMode: true,
          onlineStatus,
        });
        navigate("/profile");
        toast.success("You registered successfully!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="h-screen text-white">
        <div className="bg-gray-800 h-screen mx-auto max-w-md p-5">
          <div className="p-12">
            <p className="text-4xl pt-10 text-blue-500 font-normal text-center">
              Welcome to <br />
              <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 font-bold">
                Vita Card Game
              </span>
            </p>
            <p className="text-xl py-3 text-gray-400 font-semibold">
              Sign up to get started
            </p>
          </div>
          <div className="mx-12 p-3 rounded-xl shadow-sm bg-gray-900 ">
            <div className="p-3 mx-6 border-b border-gray-500 color-white">
              <input
                placeholder="Username"
                className="bg-transparent text-purple-500 w-full focus:outline-none"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="p-3 mx-6 border-b border-gray-500 color-white">
              <input
                placeholder="First Name"
                className="bg-transparent text-purple-500 w-full focus:outline-none"
                type="text"
                required
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
            </div>

            <div className="p-3 mx-6 border-b border-gray-500 color-white">
              <input
                placeholder="Last Name"
                className="bg-transparent text-purple-500 w-full focus:outline-none"
                type="text"
                required
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </div>

            <div className="p-3 mx-6 border-b border-gray-500 color-white">
              <input
                placeholder="name@vita.com"
                className="bg-transparent text-purple-500 w-full focus:outline-none"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="p-3 mx-6 flex">
              <input
                placeholder="Password"
                className="bg-transparent text-purple-500 focus:outline-none w-full"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full p-12 mt-5">
            <button
              className="bg-purple-500 p-3 rounded-3xl w-full h-full hover:bg-purple-600"
              type="submit"
            >
              Sign Up
            </button>
            <p className="mx-auto text-center mt-3 text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-md font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signup;
