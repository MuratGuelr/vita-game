import React from "react";
import { toast } from "react-toastify";
import { auth, db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

const CharacterCard = ({
  characters,
  setSelectedCharacter,
  isCharacterSelected,
}) => {
  const handleSubmit = async (character) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userData = doc(db, "Users", user.uid);
        await updateDoc(userData, {
          character,
        });
        toast.success(`${character.name} is your character now!`);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  return (
    <>
      {characters.map((character) => (
        <div
          key={character.id}
          className={`mb-5 ${
            isCharacterSelected(character.name) ? "grayscale" : ""
          }`}
          onClick={() => {
            if (!isCharacterSelected(character.name)) {
              setSelectedCharacter(character);
              handleSubmit(character);
            }
          }}
        >
          <img
            src={character.img}
            className="rounded-lg"
            alt={character.name}
          />
        </div>
      ))}
    </>
  );
};

export default CharacterCard;
