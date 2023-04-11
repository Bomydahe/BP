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

async function generateThumbnail(videoUri) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0,
    });
    return uri;
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export default function TeacherHome() {
  const [clients, setClients] = useState([]);
  const navigation = useNavigation();
  const [videos, setVideos] = React.useState([]);

  React.useEffect(() => {
    async function fetchVideos() {
      const videoUrls = await getAllVideos();
      const videoData = await Promise.all(
        videoUrls.map(async (url, index) => {
          const thumbnail = await generateThumbnail(url);
          return {
            id: index,
            url,
            thumbnail,
          };
        })
      );
      setVideos(videoData);
    }

    fetchVideos();
  }, []);

  /* retrieving all videos from firebase */
  async function getAllVideos() {
    try {
      const storageRef = firebase.storage().ref();
      const listResult = await storageRef.listAll();

      const urls = await Promise.all(
        listResult.items.map(async (item) => {
          const url = await item.getDownloadURL();
          return url;
        })
      );

      console.log("Download URLs:", urls);
      return urls;
    } catch (error) {
      console.error("Error getting download URLs:", error);
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
