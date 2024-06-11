import React, { useEffect, useState } from "react";
import { HiUserAdd } from "react-icons/hi";
import { auth, db } from "../firebase/firebase";
import {
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";

let friendRequestNames = [];

const timeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return `${interval} years ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes ago`;
  }
  return `Just now`;
};

const NewFriendRequest = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [friendRequestDetails, setFriendRequestDetails] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserDetails(data);
              updateFriendRequestDetails(data);
            }
          });

          return () => unsubscribeSnapshot();
        }
      });

      return () => unsubscribe();
    };

    fetchUserData();
  }, []);

  const updateFriendRequestDetails = (data) => {
    if (data && data.friendRequests) {
      const friendRequests = data.friendRequests;
      const friendRequestEntries = Object.entries(friendRequests);

      friendRequestNames = friendRequestEntries.map(([_, req]) => req.from);

      setFriendRequestDetails(
        friendRequestEntries.map(([key, req]) => {
          const timeAgoText = timeAgo(req.timestamp);
          return (
            <div
              id="alert-additional-content-1"
              className="p-4 mb-5 text-purple-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
              role="alert"
              key={key}
            >
              <span className="absolute left-5 -mt-12 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                {timeAgoText}
              </span>
              <div className="flex items-center text-green-800 mt-5 ">
                <svg
                  className="flex-shrink-0 w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <h3 className="text-lg font-medium text-green-800">
                  You have a new friend request!
                </h3>
              </div>
              <div className="mt-2 mb-4 text-sm">
                Friend Request from
                <div className="text-2xl">
                  <span className="text-green-500">Username : </span>
                  <span className="text-green-500">{req.from}</span>
                </div>
                <div className="flex mt-2">
                  <button
                    type="button"
                    className="text-white bg-purple-800 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={() => addFriend(req.uid)}
                  >
                    <HiUserAdd size={20} className="mr-1" />
                    Add as a Friend
                  </button>
                  <button
                    type="button"
                    className="text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                    onClick={() => dismissFriendRequest(req.uid)}
                    aria-label="Close"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })
      );
    }
  };

  const addFriend = async (uid) => {
    console.log("Add Friend button clicked for UID:", uid);
    try {
      if (userDetails && uid) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);
        const friendRequest = userDetails.friendRequests[uid];
        console.log("Friend request data:", friendRequest);

        const friendData = {
          uid: friendRequest.uid,
          username: friendRequest.from,
        };

        await updateDoc(userDocRef, {
          friends: arrayUnion(friendData),
        });
        console.log("Friend added to user's friends list");

        const senderDocSnap = await getDoc(doc(db, "Users", uid));
        const senderData = senderDocSnap.data();

        const userFriendData = {
          uid: auth.currentUser.uid,
          username: userDetails.username,
        };
        await updateDoc(doc(db, "Users", uid), {
          friends: arrayUnion(userFriendData),
        });
        console.log("User added to sender's friends list");
      }
    } catch (error) {}
  };

  const dismissFriendRequest = async (uid) => {
    console.log("Dismiss Friend Request button clicked for UID:", uid);
    try {
      if (userDetails && uid) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);

        const updatedFriendRequests = { ...userDetails.friendRequests };
        delete updatedFriendRequests[uid];
        await updateDoc(userDocRef, {
          friendRequests: updatedFriendRequests,
        });
        console.log("Friend request removed from user's friendRequests list");

        const senderDocSnap = await getDoc(doc(db, "Users", uid));
        const senderData = senderDocSnap.data();

        if (senderData.friendSentRequests) {
          const updatedSentRequests = { ...senderData.friendSentRequests };
          delete updatedSentRequests[auth.currentUser.uid];
          await updateDoc(doc(db, "Users", uid), {
            friendSentRequests: updatedSentRequests,
          });
          console.log(
            "Friend request removed from sender's friendSentRequests list"
          );
        }
      }
    } catch (error) {
      // ... error handling
    }
  };

  return (
    <div>
      {friendRequestNames.length > 0 ? (
        <>{friendRequestDetails}</>
      ) : (
        <>
          <div>
            <h2>There are no notifications at the moment.</h2>
          </div>
        </>
      )}
    </div>
  );
};

export { friendRequestNames };
export default NewFriendRequest;
