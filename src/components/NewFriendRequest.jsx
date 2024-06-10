import React, { useEffect, useState } from "react";
import { HiUserAdd } from "react-icons/hi";
import { auth, db } from "../firebase/firebase";
import { getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";

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
  const [friendRequestDetails, setFriendRequestDetails] = useState(null);
  const [latestFriendRequest, setLatestFriendRequest] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          updateFriendRequestDetails(docSnap.data());
        }
      }
    });
  };

  const updateFriendRequestDetails = (data) => {
    if (data && data.friendRequests) {
      const friendRequests = data.friendRequests;
      const friendRequestKeys = Object.keys(friendRequests);
      const latestFriendRequestKey =
        friendRequestKeys[friendRequestKeys.length - 1];
      const latestFriendRequest = friendRequests[latestFriendRequestKey];
      const timeAgoText = timeAgo(latestFriendRequest.timestamp);

      friendRequestNames = Object.values(friendRequests).map((req) => req.from);
      setLatestFriendRequest(latestFriendRequest);

      setFriendRequestDetails(
        <div className="mt-2 mb-4 text-sm">
          Friend Request from
          <div className="text-2xl">
            <span className="text-green-500">Username : </span>
            <span className="text-green-500">{latestFriendRequest.from}</span>
          </div>
          <span className="absolute top-6 right-5 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            {timeAgoText}
          </span>
        </div>
      );
    }
  };

  const addFriend = async () => {
    if (userDetails && latestFriendRequest) {
      const userDocRef = doc(db, "Users", auth.currentUser.uid);
      const friendData = {
        uid: latestFriendRequest.uid,
        username: latestFriendRequest.from,
      };
      await updateDoc(userDocRef, {
        friends: arrayUnion(friendData),
      });
    }
  };

  useEffect(() => {
    fetchUserData();

    const interval = setInterval(() => {
      if (userDetails) {
        updateFriendRequestDetails(userDetails);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userDetails]);

  return (
    <div>
      {friendRequestNames.length > 0 ? (
        <div
          id="alert-additional-content-1"
          className="p-4 mb-4 text-purple-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
          role="alert"
        >
          <div className="flex items-center text-green-800 mt-2">
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
          {friendRequestDetails}
          <div className="flex">
            <button
              type="button"
              className="text-white bg-purple-800 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={addFriend}
            >
              <HiUserAdd size={20} className="mr-1" />
              Add as a Friend
            </button>
            <button
              type="button"
              className="text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
              data-dismiss-target="#alert-additional-content-1"
              aria-label="Close"
            >
              Dismiss
            </button>
          </div>
        </div>
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
