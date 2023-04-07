import React from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyVideos from "./components/MyVideos";
import ComparedVideos from "./components/ComparedVideos";
import SharedVideos from "./components/SharedVideos";
import Compare from "./components/Compare";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MenuProvider } from "react-native-popup-menu";
import CategoryScreen from "./components/CategoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const CompareScreen = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <Compare route={route} />
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
          <Stack.Screen name="Category" component={CategoryScreen} />
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
