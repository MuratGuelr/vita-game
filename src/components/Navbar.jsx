import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AvatarProfile from "./AvatarProfile";
import { auth, db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaUserFriends,
  FaGamepad,
} from "react-icons/fa";

const Navbar = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loggedIn, setLoggedIn] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserDetails(data);
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoggedIn("User is not logged in!");
      }
    });

    return () => unsubscribe();
  }, []);

  const isLinkActive = ({ isActive }) =>
    isActive
      ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white rounded-md p-2"
      : "text-gray-400 hover:bg-gray-700 hover:text-white rounded-md p-2";

  return (
    <nav className="bg-gray-800 fixed bottom-0 w-full flex justify-between p-3 z-50">
      {userDetails && userDetails.character && (
        <NavLink to="/" className={isLinkActive}>
          <FaHome size={24} />
        </NavLink>
      )}

      {userDetails && (
        <>
          <NavLink to="vita-game" className={isLinkActive}>
            <FaGamepad size={24} />
          </NavLink>
          <NavLink to="friends" className={isLinkActive}>
            <FaUserFriends size={24} />
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
