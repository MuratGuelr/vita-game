import React from "react";
import NewFriendRequest from "../components/NewFriendRequest";

const Notifications = () => {
  return (
    <div className="p-5 bg-white dark:bg-gray-900 antialiased justify-center">
      <div>
        <NewFriendRequest />
      </div>
    </div>
  );
};

export default Notifications;
