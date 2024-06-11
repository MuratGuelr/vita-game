import React, { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import AvatarProfile from "../components/AvatarProfile";
import { toast } from "react-toastify";

const AddFriends = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const filteredUsers = usersList.filter(
        (user) => user.id !== auth.currentUser.uid
      );
      setUsers(filteredUsers);
    };

    fetchUsers();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() });
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddFriend = async (userId) => {
    if (currentUser) {
      const recipientDocRef = doc(db, "Users", userId);
      const recipientDocSnap = await getDoc(recipientDocRef);
      const recipientData = recipientDocSnap.data();

      const friendRequest = {
        uid: currentUser.id,
        from: currentUser.username,
        timestamp: new Date(),
      };

      const updatedFriendRequests = {
        ...recipientData.friendRequests,
        [currentUser.id]: friendRequest,
      };

      await updateDoc(recipientDocRef, {
        friendRequests: updatedFriendRequests,
      });

      // Notify the recipient about the friend request
      await updateDoc(recipientDocRef, {
        notifications: arrayUnion({
          message: `${currentUser.username} sent you a friend request!`,
          timestamp: new Date(),
        }),
      });

      toast.success("Friend request has been sent!");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Add Friends</h1>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for friends..."
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <ul>
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between p-2 border-b dark:border-gray-600"
            >
              <div className="flex items-center">
                <AvatarProfile url={user.profilePicture} />
                <div className="ml-3">
                  <p className="text-lg font-medium dark:text-white">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${
                      user.onlineStatus === "offline"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {user.onlineStatus === "offline" ? "Offline" : "Online"}
                  </span>
                </div>
              </div>
              <div
                className="p-2 bg-blue-500 text-white rounded cursor-pointer"
                onClick={() => handleAddFriend(user.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleAddFriend(user.id);
                }}
              >
                <FaUserPlus />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddFriends;
