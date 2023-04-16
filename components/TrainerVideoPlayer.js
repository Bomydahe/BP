import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Text,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { firebase } from "../firebaseConfig";
import { showMessage } from "react-native-flash-message";
import { captureRef } from "react-native-view-shot";

export default function TrainerVideoPlayer({ route }) {
  const { videoUri } = route.params;
  const navigation = useNavigation();
  const videoName = route.params.videoName;
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [playbackStatus, setPlaybackStatus] = useState({});
  const videoPlayerRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  async function uploadThumbnail(localThumbnailUrl) {
    const response = await fetch(localThumbnailUrl);
    const blob = await response.blob();
    const thumbnailName =
      "thumbnails/" +
      localThumbnailUrl.substring(localThumbnailUrl.lastIndexOf("/") + 1);
    const storageRef = firebase.storage().ref().child(thumbnailName);

    await storageRef.put(blob);

    const downloadUrl = await storageRef.getDownloadURL();
    return downloadUrl;
  }

  const handleAddComment = useCallback(async () => {
    const currentStatus = await videoPlayerRef.current.getStatusAsync();

    if (currentStatus.isPlaying) {
      Alert.alert("Please pause the video where you want to add a comment.");
      return;
    }

    setModalVisible(true);
  }, [videoName, inputValue]);

  const handleEdit = useCallback(async () => {
    const currentStatus = await videoPlayerRef.current.getStatusAsync();

    if (currentStatus.isPlaying) {
      Alert.alert("Please pause the video where you want to edit it.");
      return;
    }

    const snapshot = await captureRef(videoPlayerRef, {
      format: "jpg",
      quality: 1.0,
    });

    Image.getSize(snapshot, async (width, height) => {
      const currentTime = await videoPlayerRef.current.getStatusAsync();
      const position = currentTime.positionMillis;

      console.log("+++++++++++", screenWidth, screenHeight);

      navigation.navigate("VideoEditScreen", {
        videoName,
        position,
        snapshotUri: snapshot,
        snapshotWidth: screenWidth,
        snapshotHeight: screenHeight,
      });
    });
  }, [navigation]);

  async function addComment(videoName, commentText, time, snapshot) {
    try {
      // Upload the snapshot to Firebase Storage and get its download URL
      const snapshotUrl = await uploadThumbnail(snapshot);

      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      // Get the current comments array from the video document
      const videoDoc = await videoRef.get();
      const comments = videoDoc.data().comments || [];

      // Create a new comment object with the provided text, time, and snapshot URL
      const newComment = {
        text: commentText,
        time: time,
        snapshot: snapshotUrl,
      };

      // Add the new comment to the existing comments array
      comments.push(newComment);

      // Update the comments field in the video document with the new comments array
      await videoRef.update({ comments: comments });

      console.log(`Comment added to video ${videoName}:`, newComment);
      showMessage({
        message: "Message uploaded successfully",
        type: "success",
        duration: 3000,
        position: "top",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.headerRightButton}
            >
              <MaterialIcons name="message" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.headerRightButton}
            >
              <FontAwesome name="pencil" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation, route.params.categoryName, handleAddComment])
  );

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };

    lockOrientation();

    return () => {
      const resetOrientation = async () => {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        );
      };

      resetOrientation();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add a comment:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setInputValue(text)}
              value={inputValue}
              placeholder="Write your comment"
              multiline
              numberOfLines={8}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 10 }]}
                onPress={async () => {
                  const currentTime =
                    await videoPlayerRef.current.getStatusAsync();
                  const position = currentTime.positionMillis;

                  // Capture the snapshot
                  const snapshot = await captureRef(videoPlayerRef, {
                    format: "jpg",
                    quality: 1.0,
                  });

                  // Add the comment with the snapshot included
                  addComment(videoName, inputValue, position, snapshot);
                  setModalVisible(false);
                  setInputValue(""); // Reset the input value
                }}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginLeft: 10 }]}
                onPress={() => {
                  setModalVisible(false);
                  setInputValue(""); // Reset the input value
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Video
        ref={videoPlayerRef}
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        useNativeControls
        style={styles.video}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && !status.isLooping) {
            videoPlayerRef.current.pauseAsync();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: "90%",
  },
  input: {
    height: "auto",
    minHeight: 40,
    width: "100%",
    maxWidth: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },

  headerRightContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  headerRightButton: {
    marginLeft: 15,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "80%",
  },
});
