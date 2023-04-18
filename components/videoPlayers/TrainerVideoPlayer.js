import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { firebase } from "../../firebaseConfig";
import { showMessage } from "react-native-flash-message";
import { captureRef } from "react-native-view-shot";
import CommentModal from "../CommentModal";
import CustomVideoPlayer from "./CustomVideoPlayer";

export default function TrainerVideoPlayer({ route }) {
  const { videoUri, videoName } = route.params;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const videoPlayerRef = useRef(null);
  const parentScaledVideoSize = useRef({ width: 0, height: 0 });

  const updateParentScaledVideoSize = (scaledSize) => {
    console.log("Updated parentScaledVideoSize:", scaledSize);
    parentScaledVideoSize.current = scaledSize;
  };

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
  }, [videoName]);

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

      const { width: scaledWidth, height: scaledHeight } =
        parentScaledVideoSize.current;
      console.log("scaled values", scaledHeight, scaledWidth);

      navigation.navigate("VideoEditScreen", {
        videoName,
        position,
        snapshotUri: snapshot,
        scaledWidth,
        scaledHeight,
      });
    });
  }, [navigation, parentScaledVideoSize]);

  async function addComment(commentText) {
    try {
      const currentTime = await videoPlayerRef.current.getStatusAsync();
      const position = currentTime.positionMillis;

      // Capture the snapshot
      const snapshot = await captureRef(videoPlayerRef, {
        format: "jpg",
        quality: 1.0,
      });

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
        time: position,
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

  const handleSubmitComment = async () => {
    setModalVisible(false);
    // Add the comment with the snapshot included
    await addComment(inputValue);
    setInputValue(""); // Reset the input value
  };

  return (
    <View style={styles.container}>
      <CommentModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmitComment}
      />
      <CustomVideoPlayer
        videoUri={videoUri}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && !status.isLooping) {
            videoPlayerRef.current.pauseAsync();
          }
        }}
        videoPlayerRef={videoPlayerRef}
        onScaledVideoSizeChange={updateParentScaledVideoSize}
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
  headerRightContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  headerRightButton: {
    marginLeft: 15,
  },
});
