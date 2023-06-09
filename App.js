import React from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyVideos from "./components/tabs/MyVideos";
import ComparedVideos from "./components/tabs/ComparedVideos";
import SharedVideos from "./components/tabs/SharedVideos";
import Compare from "./components/screens/CompareScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MenuProvider } from "react-native-popup-menu";
import CategoryScreen from "./components/screens/CategoryScreen";
import DefaultVideoPlayer from "./components/videoPlayers/DefaultVideoPlayer";
import ComparedVideoPlayer from "./components/videoPlayers/ComparedVideoPlayer";
import LoginScreen from "./components/screens/LoginScreen";
import TrainerHomeScreen from "./components/screens/TrainerHomeScreen";
import ClientsSharedScreen from "./components/screens/ClientsSharedScreen";
import SharedCategory from "./components/SharedCategory";
import TrainerVideoPlayer from "./components/videoPlayers/TrainerVideoPlayer";
import SharedVideoPlayer from "./components/videoPlayers/SharedVideoPlayer";
import VideoEditScreen from "./components/screens/VideoEditScreen";
import FlashMessage from "react-native-flash-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleLogout } from "./utils/firebaseFunctions";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { firebase } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function LogoutMenu() {
  const navigation = useNavigation();
  return (
    <Menu>
      <MenuTrigger>
        <Entypo name="menu" size={24} color="#000" style={{ marginLeft: 15 }} />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => handleLogout(navigation)}>
          <Text style={styles.menuOptionText}>Log Out</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

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
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="TrainerHomeScreen"
            component={TrainerHomeScreen}
          />

          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              headerShown: true,
              headerTitle: () => (
                <View style={{ marginLeft: 45 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    MotionMatch
                  </Text>
                </View>
              ),
              headerLeft: () => (
                <View style={{ flexDirection: "row" }}>
                  <LogoutMenu />
                </View>
              ),
            }}
          />

          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Compare" component={CompareScreen} />
          <Stack.Screen
            name="VideoPlayer"
            component={DefaultVideoPlayer}
            options={{
              title: "Video Player",
              headerStyle: {
                backgroundColor: "black",
              },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="ComparedVideoPlayer"
            component={ComparedVideoPlayer}
            options={{
              title: "Video Player",
              headerStyle: {
                backgroundColor: "black",
              },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="ClientsSharedScreen"
            component={ClientsSharedScreen}
          />
          <Stack.Screen name="SharedCategory" component={SharedCategory} />
          <Stack.Screen
            name="TrainerVideoPlayer"
            component={TrainerVideoPlayer}
            options={{
              title: "Video Player",
              headerStyle: {
                backgroundColor: "black",
              },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="SharedVideoPlayer"
            component={SharedVideoPlayer}
            options={{
              title: "Video Player",
              headerStyle: {
                backgroundColor: "black",
              },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="VideoEditScreen"
            component={VideoEditScreen}
            options={{
              title: "Video Edit Tool",
              headerStyle: {
                backgroundColor: "black",
              },
              headerTintColor: "white",
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" backgroundColor="black" />
      </NavigationContainer>
      <FlashMessage position="top" />
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
