import React, { useState, useEffect } from "react";
import CharacterCard from "../components/CharacterCard";
import { IoIosRefresh } from "react-icons/io";
import { db, auth } from "../firebase/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const VitaGame = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [users, setUsers] = useState([]);

  const characters = [
    { id: 1, name: "Ulula", img: "/new-characters/ulula.jpg", heal: 5 },
    { id: 2, name: "Hyfie", img: "/new-characters/hyfie.jpg", heal: 5 },
    { id: 3, name: "Joy", img: "/new-characters/Joy.jpg", heal: 5 },
    { id: 4, name: "Loya", img: "/new-characters/loya.jpg", heal: 5 },
    { id: 5, name: "Peqs", img: "/new-characters/peqs.jpg", heal: 5 },
    { id: 6, name: "Redeye", img: "/new-characters/redeye.jpg", heal: 5 },
    { id: 7, name: "Sinri", img: "/new-characters/sinri.jpg", heal: 5 },
    { id: 8, name: "Sonya", img: "/new-characters/sonya.jpg", heal: 5 },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  const handleCharacterSelection = async (character) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          character: {
            id: character.id,
            name: character.name,
            img: character.img,
            heal: character.heal,
          },
        });
        setSelectedCharacter(character);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const isCharacterSelected = (characterName) => {
    return users.some((user) => user.character?.name === characterName);
  };

  return (
    <div className="p-5 bg-gray-900">
      {selectedCharacter ? (
        <p className="text-4xl mb-5 text-blue-500 font-normal text-center">
          <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 font-bold">
            Your Character <br />
            <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r to-sky-600 from-red-400 font-bold">
              {selectedCharacter && selectedCharacter.name}
            </span>
          </span>
        </p>
      ) : (
        <p className="text-4xl mb-5 text-blue-500 font-normal text-center">
          <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 font-bold">
            Select your <br />
            <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-r to-sky-600 from-red-400 font-bold">
              Character
            </span>
          </span>
        </p>
      )}

      <div>
        {selectedCharacter ? (
          <div key={selectedCharacter.id}>
            <article
              className="text-white absolute mt-2 ml-2 shadow-lg"
              onClick={() => setSelectedCharacter(null)}
            >
              <IoIosRefresh size={35} />
            </article>

            <img src={selectedCharacter.img} className="rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <CharacterCard
              characters={characters}
              setSelectedCharacter={handleCharacterSelection}
              isCharacterSelected={isCharacterSelected}
            />
          </div>
        )}
      </div>
      <div className="mb-5 text-gray-900">footer</div>
    </div>
  );
};

export default VitaGame;
