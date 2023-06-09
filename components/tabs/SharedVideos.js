/*
  * Author: Rastislav Duránik (xduran03)
  * File: SharedVideos.js
  * Brief: 
     Component displays a list of videos and allows users 
     to delete them. It also has a "Select Trainer" button 
     that opens a modal where the user can select a trainer.
     The component fetches all videos from Firebase Storage 
     and filters them based on the user's ID. It also retrieves 
     the user's trainer email from Firestore and displays it on
     the screen. The component uses various React Native components, 
     such as FlatList, SafeAreaView, TouchableOpacity, Image, 
     TextInput, and Modal. It also uses the AntDesign icon
     library and the React Navigation and React Native Gesture
     Handler libraries.
*/


import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firebase } from "../../firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import TrainerSelectModal from "../modals/TrainerSelectModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";

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
  const [loading, setLoading] = useState(true);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [selectedTrainerEmail, setSelectedTrainerEmail] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

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
        setLoading(false);
      }

      fetchVideos();
      // Cleanup function
      return () => {};
    }, [])
  );

  const fetchTrainerEmail = async () => {
    try {
      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .get();
      const userTrainerId = userDoc.data().trainerId;
      if (userTrainerId) {
        const trainerDoc = await firebase
          .firestore()
          .collection("users")
          .doc(userTrainerId)
          .get();
        const trainerEmail = trainerDoc.data().email;
        setSelectedTrainerEmail(trainerEmail);
        setSelectedTrainerId(userTrainerId);
      } else {
        setSelectedTrainerEmail("");
        setSelectedTrainerId("");
      }
    } catch (error) {
      console.error("Error fetching trainer email:", error);
    }
  };

  useEffect(() => {
    fetchTrainerEmail();
  }, []);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  useEffect(() => {
    fetchTrainerEmail();
  }, [selectedTrainerId]);

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
      setSelectedTrainerId(trainerId); // <-- Set the trainer ID
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
          onPress={() => {
            setDeletingVideoId(item);
            setConfirmDeleteVisible(true);
          }}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
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

          <TrainerSelectModal
            modalVisible={modalVisible}
            toggleModal={toggleModal}
            trainers={trainers}
            filteredTrainers={filteredTrainers}
            searchText={searchText}
            setSearchText={setSearchText}
            filterTrainers={filterTrainers}
            handleTrainerSelect={handleTrainerSelect}
            selectedTrainerEmail={selectedTrainerEmail}
          />

          <ConfirmDeleteModal
            visible={confirmDeleteVisible}
            onClose={() => setConfirmDeleteVisible(false)}
            onConfirm={() => {
              deleteVideo(deletingVideoId);
              setConfirmDeleteVisible(false);
            }}
            addition={" This will also delete this video from your trainer"}
          />
        </>
      )}
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
    marginBottom: 0,
  },

  video: {
    width: videoWidth - 30,
    height: 200,
    backgroundColor: "black",
    marginBottom: 10,
    overflow: "hidden",
    borderRadius: 8,
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
    backgroundColor: "#007AFF",
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
});
