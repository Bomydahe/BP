import React from "react";
import { FAB } from "react-native-paper";

const MyVideosFAB = ({
  open,
  setOpen,
  pickVideo,
  navigate,
  addCategory,
  categories,
}) => {
  return (
    <FAB.Group
      open={open}
      icon={open ? "close" : "plus"}
      actions={[
        {
          icon: "plus",
          onPress: () => pickVideo(),
          label: "Add video",
        },
        {
          icon: "square",
          onPress: () => {
            navigate("Compare", { categories });
          },
          label: "Compare video",
        },
        {
          icon: "plus",
          onPress: () => addCategory(),
          label: "Add category",
        },
      ]}
      onStateChange={({ open }) => setOpen(open)}
      fabStyle={{ backgroundColor: "blue" }}
      color="white"
    />
  );
};

export default MyVideosFAB;
