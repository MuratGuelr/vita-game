import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setNotifications(data.notifications || []);
            }
          });

          return () => unsubscribeSnapshot();
        }
      });

      return () => unsubscribe();
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    notifications.forEach((notification) => {
      toast.info(notification.message);
    });
  }, [notifications]);

  return (
    <div className="p-5 bg-white dark:bg-gray-900 antialiased justify-center">
      <div>
        <div className="mt-5">
          <h2 className="text-2xl font-bold dark:text-white">Notifications</h2>
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className="p-4 mb-4 text-purple-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
                >
                  {notification.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
