import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const HomePage = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loggedIn, setLoggedIn] = useState("");
  const [character, setCharacter] = useState(null);
  const [healCount, setHealCount] = useState(0);
  const [heartArray, setHeartArray] = useState(Array(5).fill(null));
  const [users, setUsers] = useState([]);

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

      filteredUsers.forEach((user) => {
        const userRef = doc(db, "Users", user.id);
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === user.id ? { id: doc.id, ...doc.data() } : u
              )
            );
          }
        });
      });
    };

    fetchUsers();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserDetails(data);
            setCharacter(data.character);
            setHealCount(data.character.heal);
            if (data.character.name === "Sonya") {
              setHeartArray(Array(9).fill(null));
            }
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoggedIn("User is not logged in!");
      }
    });

    return () => unsubscribe();
  }, []);

  const increaseHeal = () => {
    let newHealCount;
    if (character.name === "Sonya" && healCount < 9) {
      newHealCount = Math.min(healCount + 1, 9);
    } else {
      newHealCount = Math.min(healCount + 1, 5);
    }
    updateCharacterHeal(newHealCount);
  };

  const decreaseHeal = () => {
    const newHealCount = Math.max(healCount - 1, 0);
    updateCharacterHeal(newHealCount);
  };

  const updateCharacterHeal = async (newHealCount) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userData = doc(db, "Users", user.uid);
        await updateDoc(userData, {
          "character.heal": newHealCount,
        });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  return (
    <div className="p-5 antialiased relative bg-gray-900">
      {character && (
        <div key={character.id} className="flex flex-col items-center mb-2">
          <div className="relative">
            <span className="text-xl font-medium me-2 px-2.5 py-0.5 dark:bg-green-900 dark:text-green-300 inline-block absolute right-0 mt-3 mr-2 text-white bg-green-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
              {healCount}
            </span>
            <img
              src={character.img}
              alt={character.name}
              className="w-72 rounded-md shadow-lg border-white border p-1"
            />
          </div>

          <ul className="flex flex-row items-center mt-3">
            {heartArray.map((_, index) => (
              <li key={index} className="mx-1">
                {index < healCount ? (
                  <FaHeart
                    size={30}
                    className="text-red-600 ring shadow-lg cursor-pointer transition duration-300 transform"
                    onClick={decreaseHeal}
                  />
                ) : (
                  <FaRegHeart
                    size={30}
                    className="text-red-600 shadow-lg cursor-pointer transition duration-300 transform"
                    onClick={increaseHeal}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white text-center mb-1">
          Other Players
        </h2>
        <div className="flex gap-5 justify-center mb-3">
          {users.map((user) => (
            <div key={user.id} className="mb-8">
              <div className="relative text-center">
                <span className="text-sm me-1 px-1.5 py-0.5 dark:bg-red-900 dark:text-red-300 inline-block absolute right-0 mt-3 mr-1 text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                  {user.character.heal}
                </span>
                <img
                  src={user.character?.img}
                  alt={user.character?.name}
                  className="w-24 rounded-md shadow-lg"
                />
                <span className="text-xs text-white">{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
