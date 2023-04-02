import React from "react";
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
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const CategoryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Category />
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
});
