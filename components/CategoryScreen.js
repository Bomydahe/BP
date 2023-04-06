import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Category from "./Category";
import { Entypo } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName } = route.params;

  const handleEditCategory = () => {
    console.log("Edit category");
    // Handle editing the category name here
  };

  const handleDeleteCategory = () => {
    console.log("Delete category");
    // Handle deleting the category here
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo
              name="dots-three-vertical"
              size={24}
              color="black"
              style={{ marginRight: 10 }}
            />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={handleEditCategory}>
              <Text style={styles.menuOptionText}>Edit Category</Text>
            </MenuOption>
            <MenuOption onSelect={handleDeleteCategory}>
              <Text style={styles.menuOptionText}>Delete Category</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Category route={route} />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  menuOptionText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
