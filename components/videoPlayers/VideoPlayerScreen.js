import React, { useEffect, useCallback, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { MaterialIcons } from "@expo/vector-icons";
import UploadPromptModal from "../UploadPromptModal";
import {
  uploadThumbnail,
  saveVideoMetadata,
  uploadVideo,
  generateThumbnail,
  generateUniqueId,
} from "../firebaseFunctions";
import { firebase } from "../../firebaseConfig";

export default function VideoPlayerScreen({ route }) {
  const { videoUri, categories } = route.params;
  const navigation = useNavigation();
  const videoPlayerRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

  const stopVideo = async () => {
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.stopAsync();
    }
  };

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.shareIcon}
          >
            <MaterialIcons name="share" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await stopVideo();
              navigation.navigate("Compare", {
                firstVideo: videoUri,
                categories: categories,
              });
            }}
            style={styles.compareButton}
          >
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, videoUri]);

  useEffect(() => {
    updateNavigationOptions();
  }, [updateNavigationOptions]);

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
      <UploadPromptModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onYes={async () => {
          setModalVisible(false);
          const thumbnailUri = await generateThumbnail(videoUri);
          const thumbnailUrl = await uploadThumbnail(thumbnailUri);
          const videoUrl = await uploadVideo(videoUri);
          const userId = firebase.auth().currentUser.uid;
          const videoName = videoUri.substring(videoUri.lastIndexOf("/") + 1);
          await saveVideoMetadata(
            videoName,
            videoUrl,
            thumbnailUrl,
            false,
            userId
          );
        }}
      />
      <CustomVideoPlayer
        videoUri={videoUri}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && !status.isLooping) {
            videoPlayerRef.current.pauseAsync();
          }
        }}
        videoPlayerRef={videoPlayerRef}
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

  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareIcon: {
    marginRight: 15,
  },

  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
  compareButtonText: {
    color: "#fff",
  },
});
