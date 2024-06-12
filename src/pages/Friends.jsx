import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import AvatarProfile from "../components/AvatarProfile";

const Friends = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [friendsData, setFriendsData] = useState([]);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          if (docSnap.data().friends) {
            const friendPromises = docSnap
              .data()
              .friends.map(async (friend) => {
                const friendDocRef = doc(db, "Users", friend.uid);
                const friendDocSnap = await getDoc(friendDocRef);
                if (friendDocSnap.exists()) {
                  return { ...friendDocSnap.data(), uid: friend.uid };
                } else {
                  return null;
                }
              });
            const friendData = await Promise.all(friendPromises);
            const filteredFriendData = friendData.filter(
              (friend) => friend !== null
            );
            setFriendsData(filteredFriendData);
          }
        } else {
          console.log("User is not logged in!");
        }
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Friends</h1>
        <div>
          {friendsData.map((friend) => (
            <div
              key={friend.uid}
              className="flex items-center justify-between p-2 border-b dark:border-gray-600"
            >
              <div className="flex items-center">
                <AvatarProfile url={friend.profilePicture} />
                <div className="ml-3">
                  <p className="text-lg font-medium dark:text-white">{`${friend.firstName} ${friend.lastName}`}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{friend.username}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;
