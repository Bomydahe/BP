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
import { EventRegister } from "react-native-event-listeners";

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName, categoryId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: categoryName,
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
            <MenuOption
              onSelect={() => EventRegister.emit("editCategory", categoryId)}
            >
              <Text style={styles.menuOptionText}>Edit Category</Text>
            </MenuOption>
            {categoryName !== "All Videos" && (
              <MenuOption
                onSelect={() =>
                  EventRegister.emit("deleteCategory", categoryId)
                }
              >
                <Text style={styles.menuOptionText}>Delete Category</Text>
              </MenuOption>
            )}
          </MenuOptions>
        </Menu>
      ),
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
