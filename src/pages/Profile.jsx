import React, { useEffect, useState } from "react";
import AvatarProfile from "../components/AvatarProfile";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { MdOutlineDarkMode, MdDarkMode } from "react-icons/md";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaFileUpload } from "react-icons/fa";
import ListImages from "../components/ListImages";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [settings, setSettings] = useState(false);
  const [username, setUsername] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [onlineStatus, setOnlineStatus] = useState("offline");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setUserDetails(doc.data());
            const userData = doc.data();
            setFname(userData.firstName);
            setLname(userData.lastName);
            setUsername(userData.username);
            setDarkMode(userData.darkMode);
            if (userData.profilePicture) {
              setProfilePicture(userData.profilePicture);
            }
          } else {
            navigate("/login");
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userData = doc(db, "Users", user.uid);
        await updateDoc(userData, {
          onlineStatus,
        });
      } catch (error) {
        toast.error(error.message);
      }
    }

    try {
      await auth.signOut();
      navigate("/login");
      location.reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        const userData = doc(db, "Users", user.uid);
        await updateDoc(userData, {
          firstName: fname,
          lastName: lname,
          username: username,
          darkMode: darkMode,
          onlineStatus,
        });
        toast.success("Profile updated successfully!");
        setSettings(false);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB <= 1) {
        setFile(selectedFile);
      } else {
        toast.error("Please select a file under 1mb!");
      }
    }
  };

  const handleUpload = async () => {
    if (file) {
      const user = auth.currentUser;
      if (user) {
        const storage = getStorage();
        const storageRef = ref(storage, `${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfilePicture(url);

        const userData = doc(db, "Users", user.uid);
        await setDoc(userData, { profilePicture: url }, { merge: true });
        toast.success("Profile picture uploaded successfully!");
      } else {
        toast.error("Please login first!");
      }
    } else {
      toast.error("No file selected!");
    }
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-900 h-screen flex items-center justify-center p-5 -mt-5">
      {settings ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              {profilePicture && (
                <AvatarProfile bigClass={true} url={profilePicture} />
              )}
              <div className="mt-2">
                <input type="file" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={handleUpload}
                  className="ml-2 p-2 bg-blue-500 text-white rounded"
                >
                  <FaFileUpload />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setSettings(false)}
                className="text-red-700 dark:text-white"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">
                First Name
              </label>
              <input
                type="text"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">
                Last Name
              </label>
              <input
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-md text-center">
          {userDetails ? (
            <>
              {profilePicture && (
                <AvatarProfile bigClass={true} url={profilePicture} />
              )}
              <h2 className="text-2xl font-bold dark:text-white mt-4">
                {userDetails.firstName} {userDetails.lastName}
              </h2>
              <p className="text-sm dark:text-gray-300">{userDetails.email}</p>
              <p className="mt-2 text-sm dark:text-gray-300">
                Username: {userDetails.username}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setSettings(true)}
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Loading />
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
