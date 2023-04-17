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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { firebase } from "../firebaseConfig";

const { width } = Dimensions.get("window");
const numColumns = 2;
const clientWidth = (width - 20 * (numColumns + 1)) / numColumns;

const randomImages = [
  "https://images.unsplash.com/photo-1561948955-570b270e7c36",
];

export default function TeacherHome() {
  const [clients, setClients] = useState([]);
  const navigation = useNavigation();
  const [videos, setVideos] = React.useState([]);
  const [currentUserID, setCurrentUserID] = useState("");

  useEffect(() => {
    (async () => {
      const currentUser = firebase.auth().currentUser;
      setCurrentUserID(currentUser.uid);
      const loadedClients = await loadClients();
      setClients(loadedClients);
    })();
  }, []);

  React.useEffect(() => {
    async function fetchVideos() {
      if (currentUserID) {
        const videoList = await getAllVideos();
        const videoData = await Promise.all(
          videoList.map(async (video) => {
            return {
              id: video.id,
              userId: video.userId,
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
              userId: data.userId,
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
      const userIDs = await getUserIDsByTrainer(currentUserID);
      const clientsData = [];

      for (const userID of userIDs) {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(userID)
          .get();

        const userData = userDoc.data();
        const randomImage =
          randomImages[Math.floor(Math.random() * randomImages.length)];

        clientsData.push({
          id: userID,
          imageUri: randomImage,
          email: userData.email,
        });
      }

      return clientsData;
    } catch (error) {
      console.error("Error loading clients:", error);
      return [];
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.clientContainer}>
      <TouchableOpacity
        onPress={() => {
          const filteredVideos = videos.filter(
            (video) => video.userId === item.id
          );
          navigation.navigate("ClientsSharedScreen", {
            clientEmail: item.email,
            videos: filteredVideos,
          });
        }}
      >
        <Image
          style={styles.clientImage}
          source={{ uri: item.imageUri }}
          resizeMode="cover"
        />
        <Text style={styles.clientName}>{item.email}</Text>
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

  clientName: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
