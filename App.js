import React from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyVideos from "./components/tabs/MyVideos";
import ComparedVideos from "./components/tabs/ComparedVideos";
import SharedVideos from "./components/tabs/SharedVideos";
import Compare from "./components/screens/CompareScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MenuProvider } from "react-native-popup-menu";
import CategoryScreen from "./components/screens/CategoryScreen";
import VideoPlayerScreen from "./components/screens/VideoPlayerScreen";
import ComparedVideoPlayer from "./components/videoPlayers/ComparedVideoPlayer";
import LoginScreen from "./components/screens/LoginScreen";
import TrainerHomeScreen from "./components/screens/TrainerHomeScreen";
import ClientsSharedScreen from "./components/screens/ClientsSharedScreen";
import SharedCategory from "./components/SharedCategory";
import TrainerVideoPlayer from "./components/videoPlayers/TrainerVideoPlayer";
import SharedVideoPlayer from "./components/videoPlayers/SharedVideoPlayer";
import VideoEditScreen from "./components/screens/VideoEditScreen";
import FlashMessage from "react-native-flash-message";

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
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Compare" component={CompareScreen} />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
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
            name="TrainerHomeScreen"
            component={TrainerHomeScreen}
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
        <StatusBar />
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
