import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const AvatarProfile = ({ bigClass }) => {
  const defaultImage = "/default-avatar.svg";
  const [userDetails, setUserDetails] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setUserDetails(doc.data());
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <img
        id="avatarButton"
        type="button"
        data-dropdown-toggle="userDropdown"
        data-dropdown-placement="bottom-start"
        className={
          bigClass
            ? "w-38 h-38 rounded border-2 border-blue-900 bg-white"
            : "w-7 h-7 rounded-full cursor-pointer border-2 border-blue-900 bg-white hover:border-white transition-all object-cover ml-1"
        }
        src={
          !userDetails.profilePicture
            ? defaultImage
            : userDetails.profilePicture
        }
      />
    </div>
  );
};

export default AvatarProfile;
