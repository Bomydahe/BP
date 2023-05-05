/*
  * Author: Rastislav Duránik (xduran03)
  * File: TrainerHomeScreen.js
  * Brief: 
      This component displays a list of clients for trainers. 
      It fetches client data from a Firebase backend and presents 
      the clients with their email and profile images. The component 
      allows trainers to search for clients by their email, filtering 
      the displayed list accordingly. Additionally, the component handles 
      the logout process and navigates back to the LoginScreen when the user 
      logs out. 
*/

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { firebase } from "../../firebaseConfig";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

const { width } = Dimensions.get("window");

export default function TrainerHomeScreen() {
  // State variables
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const navigation = useNavigation();
  const [videos, setVideos] = React.useState([]);
  const [currentUserID, setCurrentUserID] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setDataLoaded(false);
    const currentUser = firebase.auth().currentUser;

    if (!currentUser) return;
    const currentUserID = currentUser.uid;
    setCurrentUserID(currentUserID); // Set the current user ID here

    const loadedClients = await loadClients(currentUserID);
    const videoList = await getAllVideos(currentUserID);

    setClients(loadedClients);
    setVideos(videoList);
    setDataLoaded(true);

    console.log("Clients:", loadedClients);
  };

  // Update filteredClients when clients change
  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  // Filter clients based on search input
  const filterClients = (searchText) => {
    setSearchInput(searchText);

    if (searchText) {
      const filtered = clients.filter((client) =>
        client.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  };

  // Clear search input and reset filtered clients
  const clearSearchInput = () => {
    setSearchInput("");
    setFilteredClients(clients);
  };

  // Hide search input and reset filtered clients
  const hideSearchInput = () => {
    setShowSearchInput(false);
    setSearchInput("");
    setFilteredClients(clients);
  };

  // Set up the navigation header
  useEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerLeft: () => (
        <View style={{ flexDirection: "row" }}>
          <Menu>
            <MenuTrigger>
              <Entypo
                name="menu"
                size={24}
                color="#000"
                style={{ marginLeft: 15 }}
              />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleLogout}>
                <Text style={styles.menuOptionText}>Log Out</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
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
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>MotionMatch</Text>
        </View>
      ),
      headerRight: () => (
        <View>
          {showSearchInput ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={{
                    flex: 1,
                    height: "100%",
                  }}
                  onChangeText={filterClients}
                  value={searchInput}
                  placeholder="Search clients..."
                />
                <TouchableOpacity
                  onPress={() => {
                    clearSearchInput();
                  }}
                  style={{
                    position: "absolute",
                    right: 5,
                    top: 2,
                  }}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                setShowSearchInput(!showSearchInput);
              }}
            >
              <Ionicons
                name="search"
                size={24}
                color="#000"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, filterClients]);

  useEffect(() => {
    console.log("fetchData useEffect triggered");

    fetchData();

    return () => {
      setDataLoaded(false);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fetch data from firebase
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
  async function getAllVideos(currentUserID) {
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

  // Fetch clients from Firebase that belong to traines
  const loadClients = async (currentUserID) => {
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
        const imageUri = require("../../assets/images/user-no-image.png");

        clientsData.push({
          id: userID,
          imageUri: imageUri,
          email: userData.email,
        });
      }

      return clientsData;
    } catch (error) {
      console.error("Error loading clients:", error);
      return [];
    }
  };
  // Render client item
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.clientContainer}
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
        source={item.imageUri}
        resizeMode="cover"
      />
      <Text style={styles.clientName}>{item.email}</Text>
    </TouchableOpacity>
  );

  // Return the main component
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        if (showSearchInput) {
          hideSearchInput();
        }
      }}
    >
      <View style={styles.container}>
        {dataLoaded ? (
          <>
            {filteredClients.length > 0 && (
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Choose Your Client:</Text>
              </View>
            )}

            {filteredClients.length > 0 ? (
              <FlatList
                data={filteredClients}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal={false}
              />
            ) : (
              <View style={styles.noClientsContainer}>
                <Text style={styles.noClientsText}>
                  No clients have chosen you as trainer yet.
                </Text>
              </View>
            )}
          </>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  clientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "500",
  },

  menuOptionText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  headerTitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    paddingBottom: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    paddingHorizontal: 5,
    width: width * 0.36,
    height: 30,
    position: "relative",
  },

  noClientsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noClientsText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
