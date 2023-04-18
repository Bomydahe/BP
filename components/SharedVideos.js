import React, { useState } from "react";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firebase } from "../firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20) / numColumns;

export default function SharedVideos({ route }) {
  const [status, setStatus] = React.useState({});
  const [videos, setVideos] = React.useState([]);
  const navigation = useNavigation();
  const userId = firebase.auth().currentUser.uid;
  const [modalVisible, setModalVisible] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      async function fetchVideos() {
        const videoList = await getAllVideos();
        const videoData = await Promise.all(
          videoList.map(async (video) => {
            return {
              id: video.id,
              url: video.url,
              thumbnail: video.thumbnail,
              videoName: video.videoName,
              comments: video.comments,
              overlays: video.overlays,
            };
          })
        );
        setVideos(videoData);
      }

      fetchVideos();
      // Cleanup function
      return () => {};
    }, [])
  );

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const fetchTrainers = async () => {
    try {
      const trainersRef = firebase
        .firestore()
        .collection("users")
        .where("role", "==", "trainer");

      const snapshot = await trainersRef.get();

      const trainerList = snapshot.docs.map((doc) => ({
        uid: doc.id,
        email: doc.data().email,
      }));

      setTrainers(trainerList);
      setFilteredTrainers(trainerList);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  const filterTrainers = () => {
    if (searchText === "") {
      setFilteredTrainers(trainers);
    } else {
      const filtered = trainers.filter((trainer) =>
        trainer.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredTrainers(filtered);
    }
  };

  async function handleTrainerSelect(trainerEmail, trainerId) {
    try {
      await firebase.firestore().collection("users").doc(userId).update({
        trainerId: trainerId,
      });
      toggleModal();
      Alert.alert(
        "Success",
        `Trainer ${trainerEmail} was selected successfully.`
      );
    } catch (error) {
      console.error("Error selecting trainer:", error);
      Alert.alert("Error", "An error occurred while selecting the trainer.");
    }
  }

  async function deleteVideo(item) {
    try {
      // Delete video from Firebase Storage
      const storageRef = firebase.storage().ref();
      const videoRef = storageRef.child(item.videoName);
      await videoRef.delete();

      // Delete video metadata from Firestore
      const firestore = firebase.firestore();
      const videoMetadataRef = firestore
        .collection("videos")
        .doc(item.videoName);
      await videoMetadataRef.delete();

      // Update local state to remove the deleted video
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.id !== item.id)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  }

  /* retrieving all videos from firebase */
  async function getAllVideos() {
    try {
      const userId = firebase.auth().currentUser.uid;
      const storageRef = firebase.storage().ref();
      const listResult = await storageRef.listAll();

      const firestore = firebase.firestore();

      const videoData = await Promise.all(
        listResult.items.map(async (item) => {
          const url = await item.getDownloadURL();
          const videoName = item.name;

          // Get video metadata from Firestore
          const videoRef = firestore.collection("videos").doc(videoName);
          const doc = await videoRef.get();

          if (!doc.exists) {
            console.log("No document with the given video name");
            return null;
          }

          const data = doc.data();

          // Filter videos based on user ID
          if (data.userId !== userId) {
            return null;
          }

          return {
            url,
            id: data.id,
            thumbnail: data.thumbnail,
            videoName,
            comments: data.comments || [],
            overlays: data.overlays || [],
          };
        })
      );

      console.log("Video Data:", JSON.stringify(videoData, null, 2));

      return videoData.filter((video) => video !== null);
    } catch (error) {
      console.error("Error getting video data:", error);
      return []; // Return an empty array in case of an error
    }
  }

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.videoWrapper,
          index % 2 === 1 && styles.videoWrapperRight,
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SharedVideoPlayer", {
              videoUri: item.url,
              comments: item.comments,
              overlays: item.overlays,
            })
          }
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.video}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeVideoButton}
          onPress={() => deleteVideo(item)}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        horizontal={false}
        style={styles.flatlist}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      />
      <TouchableOpacity
        style={styles.selectTrainerButton}
        onPress={() => {
          toggleModal();
          fetchTrainers();
        }}
      >
        <Text style={styles.selectTrainerButtonText}>Select Trainer</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={toggleModal}
          activeOpacity={1}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <TextInput
                style={styles.searchInput}
                onChangeText={setSearchText}
                value={searchText}
                placeholder="Search trainers"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={filterTrainers}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
              <FlatList
                data={filteredTrainers}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleTrainerSelect(item.email, item.uid)}
                    style={styles.trainerListItem}
                  >
                    <Text style={styles.trainerListItemText}>{item.email}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.uid}
                style={styles.trainerList}
              />
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={toggleModal}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  flatlist: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 70,
  },

  video: {
    width: videoWidth - 30,
    height: 200,
    backgroundColor: "black",
    marginBottom: 10,
    overflow: "hidden",
  },

  videoWrapper: {
    width: videoWidth,
    justifyContent: "flex-start",
    paddingBottom: 20,
  },

  videoWrapperRight: {
    marginLeft: 10,
  },

  removeVideoButton: {
    position: "absolute",
    top: 8,
    right: 37,
    justifyContent: "center",
    alignItems: "center",
  },
  selectTrainerButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 10,
    zIndex: 1000,
  },
  selectTrainerButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalView: {
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 0.3,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: "30%",
    width: "90%",
    maxHeight: "80%",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
  },
  trainerList: {
    width: "100%",
  },
  trainerListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  trainerListItemText: {
    fontSize: 16,
  },
  closeModalButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});
