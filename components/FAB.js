/*
  * Author: Rastislav Duránik (xduran03)
  * File: FAB.js
  * Brief: 
     Component that displays a FAB (Floating Action Button)
     with a group of actions when clicked. The actions 
     include adding a video, adding a category, and comparing 
     videos. The component receives several props: open and setOpen
     to handle the open state of the FAB, pickVideo to handle picking 
     a video, navigate to navigate to a different screen, addCategory
     to handle adding a category, categories to compare videos, and
     handleLogout to handle logging out of the app. The FAB has a 
     blue background color and white icons.
*/

import React from "react";
import { FAB } from "react-native-paper";

const MyVideosFAB = ({
  open,
  setOpen,
  pickVideo,
  navigate,
  addCategory,
  categories,
  handleLogout,
}) => {
  return (
    <FAB.Group
      open={open}
      icon={open ? "close" : "plus"}
      actions={[
        {
          icon: "video-plus-outline",
          onPress: () => pickVideo(),
          label: "Add video",
        },
        {
          icon: "tab-plus",
          onPress: () => addCategory(),
          label: "Add category",
        },
        {
          icon: "compare",
          onPress: () => {
            navigate("Compare", { categories });
          },
          label: "Compare video",
        },
      ]}
      onStateChange={({ open }) => setOpen(open)}
      fabStyle={{ backgroundColor: "#007AFF" }}
      color="white"
    />
  );
};

export default MyVideosFAB;
