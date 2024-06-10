import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [onlineStatus, setOnlineStatus] = useState("online");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("You logged in Successfully!");

      const user = auth.currentUser;
      if (user) {
        try {
          const userData = doc(db, "Users", user.uid);
          await updateDoc(userData, {
            onlineStatus,
          });
        } catch (error) {
          toast.error(error.message);
        }
      }

      navigate("/profile");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-screen text-white overscroll-auto">
        <div className="bg-gray-800 h-screen mx-auto max-w-md p-5">
          <div className="p-12">
            <p className="text-4xl pt-10 text-blue-500 font-normal text-center">
              Welcome to <br />
              <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 font-bold">
                Vita Card Game
              </span>
            </p>
            <p className="text-xl py-3 text-gray-400 font-semibold">
              Login to continue
            </p>
          </div>
          <div className="mx-12 p-3 rounded-xl shadow-sm bg-gray-900">
            <div className="p-3 mx-6 border-b border-gray-500 color-white">
              <input
                placeholder="name@vita.com"
                className="bg-transparent text-purple-500 w-full focus:outline-none focus:rang"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="p-3 mx-6 flex">
              <input
                placeholder="Password"
                className="bg-transparent text-purple-500 focus:outline-none focus:rang w-full"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full p-12 mt-5">
            <button
              className=" bg-purple-500 p-3 rounded-3xl w-full h-full hover:bg-purple-600"
              type="submit"
            >
              {" "}
              Login
            </button>
            <p className="mx-auto text-center mt-3 text-gray-400">
              don't have an account?{" "}
              <Link to="/sign-up" className="text-md font-semibold">
                Sign up
              </Link>{" "}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Login;
