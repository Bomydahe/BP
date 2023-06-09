/*
  * Author: Rastislav Duránik (xduran03)
  * File: CategoryScreen.js
  * Brief: 
      This component is responsible for displaying a specific video category 
      and its related options. The component receives the category 
      name and ID from the navigation parameters and sets the header 
      title accordingly. A menu with options to edit or delete the category 
      is also displayed.
*/

import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Category from "../Category";
import { Entypo } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { EventRegister } from "react-native-event-listeners";

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName, categoryId } = route.params;

  // Sets up header title and menu options for the CategoryScreen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: categoryName,
      headerRight: () =>
        categoryName !== "All Videos" ? (
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
              <MenuOption
                onSelect={() => EventRegister.emit("editCategory", categoryId)}
              >
                <Text style={styles.menuOptionText}>Edit Category</Text>
              </MenuOption>
              <MenuOption
                onSelect={() =>
                  EventRegister.emit("deleteCategory", categoryId)
                }
              >
                <Text style={styles.menuOptionText}>Delete Category</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        ) : null,
    });
  }, [navigation, categoryName]);

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
