import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { firebase } from "../firebaseConfig";
import * as VideoThumbnails from "expo-video-thumbnails";

const { width } = Dimensions.get("window");
const numColumns = 2;
const clientWidth = (width - 20 * (numColumns + 1)) / numColumns;

const randomImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
  "https://images.unsplash.com/photo-1531251445707-1f000e1e87d0",
  "https://images.unsplash.com/photo-1561948955-570b270e7c36",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
];

const randomNames = ["Alice", "Bob", "Charlie"];

export default function TeacherHome() {
  const [clients, setClients] = useState([]);
  const navigation = useNavigation();
  const [videos, setVideos] = React.useState([]);
  const [currentUserID, setCurrentUserID] = useState("");

  useEffect(() => {
    async function getCurrentUser() {
      const user = firebase.auth().currentUser;
      if (user) {
        setCurrentUserID(user.uid);
      }
    }
    getCurrentUser();
  }, []);

  React.useEffect(() => {
    async function fetchVideos() {
      if (currentUserID) {
        const videoList = await getAllVideos();
        const videoData = await Promise.all(
          videoList.map(async (video) => {
            return {
              id: video.id,
              url: video.url,
              thumbnail: video.thumbnail,
              booleanVar: video.booleanVar,
              videoName: video.videoName,
            };
          })
        );
        setVideos(videoData);
      }
    }

    fetchVideos();
  }, [currentUserID]);

  async function getUserIDsByTrainer(trainerID) {
    try {
      const firestore = firebase.firestore();
      const usersRef = firestore.collection("users");
      const querySnapshot = await usersRef
        .where("trainerId", "==", trainerID)
        .where("role", "==", "user")
        .get();

      const userIDs = querySnapshot.docs.map((doc) => doc.id);
      return userIDs;
    } catch (error) {
      console.error("Error fetching user IDs by trainer:", error);
      return [];
    }
  }

  /* retrieving all videos from firebase */
  async function getAllVideos() {
    try {
      const userIDs = await getUserIDsByTrainer(currentUserID);

      const videoData = [];

      for (const userID of userIDs) {
        const userVideosSnapshot = await firebase
          .firestore()
          .collection("videos")
          .where("userId", "==", userID)
          .get();
        const userVideos = await Promise.all(
          userVideosSnapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Check if videoName is defined
            if (!data.videoName) {
              console.warn("videoName is not defined for video:", data.id);
              return null;
            }

            const storageRef = firebase.storage().ref();
            const item = storageRef.child(data.videoName);
            const url = await item.getDownloadURL();

            return {
              url,
              id: data.id,
              booleanVar: data.booleanVar,
              thumbnail: data.thumbnail,
              videoName: data.videoName,
            };
          })
        );

        // Filter out any null values before pushing userVideos
        videoData.push(...userVideos.filter((video) => video !== null));
      }

      console.log("Video Data:", videoData);
      return videoData;
    } catch (error) {
      console.error("Error getting video data:", error);
      return []; // Return an empty array in case of an error
    }
  }

  /* retrieve bool value of each video */
  async function getVideoBooleanValue(videoName) {
    try {
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);
      const doc = await videoRef.get();

      if (!doc.exists) {
        console.log("No document with the given video name");
        return { booleanVar: false }; // Return an object with a default value for booleanVar
      }

      const data = doc.data();
      return {
        booleanVar: data.booleanVar,
        id: data.id,
        thumbnail: data.thumbnail,
      };
    } catch (error) {
      console.error("Error fetching video metadata:", error);
      return null;
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerBackTitleVisible: false,
        headerLeft: () => (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                // Implement your onPress functionality here
              }}
            >
              <Entypo
                name="menu"
                size={24}
                color="#000"
                style={{ marginLeft: 15 }}
              />
            </TouchableOpacity>
          </View>
        ),
        headerTitle: () => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              marginLeft: width * 0.1,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>AppName</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              // Implement your onPress functionality here
            }}
          >
            <Ionicons
              name="search"
              size={24}
              color="#000"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    (async () => {
      const loadedClients = await loadClients();
      setClients(loadedClients);
    })();
  }, []);

  const loadClients = async () => {
    try {
      const jsonString = await AsyncStorage.getItem("@clients");
      if (jsonString !== null) {
        return JSON.parse(jsonString);
      } else {
        return []; // Return an empty array if there's no data
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      return [];
    }
  };

  const saveClients = async (clients) => {
    try {
      const jsonString = JSON.stringify(clients);
      await AsyncStorage.setItem("@clients", jsonString);
    } catch (error) {
      console.error("Error saving clients:", error);
    }
  };

  const handleAddClient = () => {
    const randomImage =
      randomImages[Math.floor(Math.random() * randomImages.length)];
    const randomName =
      randomNames[Math.floor(Math.random() * randomNames.length)];

    const newClient = {
      id: Date.now(),
      imageUri: randomImage,
      name: randomName,
      videos: [
        {
          uri: "https://example.com/video1.mp4", // Replace with actual video URI
          played: false,
        },
      ],
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveClients(updatedClients);
  };

  function handleRemoveClient(index) {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.clientContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("ClientsSharedScreen", {
            clientName: item.name,
            videos: videos,
          });
        }}
      >
        <Image
          style={styles.clientImage}
          source={{ uri: item.imageUri }}
          resizeMode="cover"
        />
        <Text style={styles.clientName}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveClient(index)}
      >
        <AntDesign name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        horizontal={false}
        style={styles.flatlist}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
        <Text style={styles.addButtonText}>+ Add Client</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  clientContainer: {
    width: clientWidth,
    height: 200,
    marginBottom: 10,
    marginHorizontal: 10,
    marginTop: 20,
  },
  clientImage: {
    width: "100%",
    height: "100%",
  },
  flatlist: {
    width: "100%",
    paddingHorizontal: 10,
  },

  addButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },

  clientName: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
