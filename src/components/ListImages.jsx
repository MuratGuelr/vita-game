import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db } from "../firebase/firebase";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { TiDelete } from "react-icons/ti";

const ListImages = () => {
  const [images, setImages] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [userUid, setUserUid] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setUserDetails(doc.data());
            setUserUid(user.uid);
          } else {
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userDetails) {
      const storage = getStorage();
      const storageRef = ref(storage, userUid);

      listAll(storageRef)
        .then((res) => {
          const promises = res.items.map((itemRef) => getDownloadURL(itemRef));
          Promise.all(promises)
            .then((urls) => {
              setImages(urls);
            })
            .catch((error) => {
              console.error("Error getting download URLs:", error);
            });
        })
        .catch((error) => {
          console.error("Error listing images:", error);
        });
    }
  }, [userDetails]);

  const handleClick = async (url) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (userDetails.profilePicture === url) {
      toast.error("Profile picture is the same!");
    } else {
      if (user) {
        const db = getFirestore();
        const docRef = doc(db, "Users", user.uid);
        await setDoc(docRef, { profilePicture: url }, { merge: true });
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error("Please login first!");
      }
    }
  };

  const handleDelete = async (url) => {
    const storage = getStorage();
    const imageRef = ref(storage, url);

    deleteObject(imageRef)
      .then(() => {
        setImages((prevImages) => prevImages.filter((image) => image !== url));
        toast.success("Image deleted successfully!");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <div className="flex gap-3 flex-wrap justify-center ml-5">
      {userDetails ? (
        <>
          {images.map((url, index) => (
            <div key={index} className="relative ">
              <img
                className="h-20 cursor-pointer hover:ring"
                src={url}
                alt={`User ${index + 1} image`}
                onClick={() => handleClick(url)}
              />
              <TiDelete
                className="absolute top-0 right-0 cursor-pointer mr-1 mt-1 scale-150 hover:text-red-700 transition-all"
                onClick={() => handleDelete(url)}
              />
            </div>
          ))}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ListImages;
