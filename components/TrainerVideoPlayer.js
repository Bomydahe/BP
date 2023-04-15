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

  async function addComment(videoName, commentText, time) {
    try {
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      // Get the current comments array from the video document
      const videoDoc = await videoRef.get();
      const comments = videoDoc.data().comments || [];

      // Create a new comment object with the provided text and time
      const newComment = { text: commentText, time: time };

      // Add the new comment to the existing comments array
      comments.push(newComment);

      // Update the comments field in the video document with the new comments array
      await videoRef.update({ comments: comments });

      console.log(`Comment added to video ${videoName}:`, newComment);
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
            />
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                const currentTime =
                  await videoPlayerRef.current.getStatusAsync();
                const position = currentTime.positionMillis;
                addComment(videoName, inputValue, position);
                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
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
});
