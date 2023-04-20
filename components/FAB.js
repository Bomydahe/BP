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

        {
          icon: "logout",
          onPress: () => handleLogout(),
          label: "Log out",
        },
      ]}
      onStateChange={({ open }) => setOpen(open)}
      fabStyle={{ backgroundColor: "#007AFF" }}
      color="white"
    />
  );
};

export default MyVideosFAB;
