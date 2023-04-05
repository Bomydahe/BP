import React, { useLayoutEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  Button,
  SafeAreaView,
  View,
  Text,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyVideos from "./components/MyVideos";
import ComparedVideos from "./components/ComparedVideos";
import SharedVideos from "./components/SharedVideos";
import Category from "./components/Category";
import Compare from "./components/Compare";
import { Entypo } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

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

const CompareScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Compare />
    </View>
  );
};

function Home() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="My videos" component={MyVideos} />
      <Tab.Screen name="Compared" component={ComparedVideos} />
      <Tab.Screen name="Shared" component={SharedVideos} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Category"
            component={CategoryScreen}
            options={({ route }) => ({
              title: route.params.categoryName,
              headerRight: () => (
                <Entypo
                  name="dots-three-vertical"
                  size={24}
                  color="black"
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    // Handle the onPress event here
                    console.log("3 vertical dots menu button pressed");
                  }}
                />
              ),
            })}
          />
          <Stack.Screen name="Compare" component={CompareScreen} />
        </Stack.Navigator>
        <StatusBar />
      </NavigationContainer>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 20,
  },

  menuOptionText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
