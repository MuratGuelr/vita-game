import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AvatarProfile from "./AvatarProfile";
import { auth, db } from "../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import { FaHome, FaSignInAlt, FaUserPlus, FaUserFriends } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { friendRequestNames } from "./NewFriendRequest";

const Navbar = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loggedIn, setLoggedIn] = useState("");
  const [names, setNames] = useState([]);

  useEffect(() => {
    setNames(friendRequestNames);
  }, [friendRequestNames]);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          setLoggedIn("User is not logged in!");
        }
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const isLinkActive = ({ isActive }) =>
    isActive
      ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white rounded-md p-2"
      : "text-gray-400 hover:bg-gray-700 hover:text-white rounded-md p-2";

  return (
    <nav className="bg-gray-800 fixed bottom-0 w-full flex justify-between p-3">
      <NavLink to="/" className={isLinkActive}>
        <FaHome size={24} />
      </NavLink>

      {userDetails && (
        <>
          <NavLink to="add-friend" className={isLinkActive}>
            <FaUserFriends size={24} />
          </NavLink>

          <NavLink to="friends" className={isLinkActive}>
            <FaUserFriends size={24} />
          </NavLink>

          <NavLink to="notifications" className={isLinkActive}>
            {names.length > 0 ? (
              <span className="absolute bg-green-500 text-white px-2 py-1 text-xs font-bold rounded-full -top-3 -right-3 ml-3 -mt-5 scale-75">
                {names.length}
              </span>
            ) : (
              <></>
            )}

            <IoIosNotifications size={24} />
          </NavLink>
        </>
      )}

      {!userDetails && (
        <div className="flex gap-2">
          <NavLink to="login" className={isLinkActive}>
            <FaSignInAlt size={24} />
          </NavLink>
          <NavLink to="sign-up" className={isLinkActive}>
            <FaUserPlus size={24} />
          </NavLink>
        </div>
      )}
      {userDetails && (
        <NavLink to="/profile" className={isLinkActive}>
          <AvatarProfile />
        </NavLink>
      )}
    </nav>
  );
};

export default Navbar;
