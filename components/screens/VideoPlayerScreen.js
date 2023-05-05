import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { firebase } from "../../firebaseConfig";
import { showMessage } from "react-native-flash-message";
import { captureRef } from "react-native-view-shot";
import UploadPromptModal from "../modals/UploadPromptModal";
import CustomVideoPlayer from "../videoPlayers/CustomVideoPlayer";
import {
  uploadThumbnail,
  saveVideoMetadata,
  uploadVideo,
  generateThumbnail,
  generateUniqueId,
  fetchTrainerIdAndEmail,
} from "../../utils/firebaseFunctions";

export default function VideoPlayerScreen({ route }) {
  const { videoUri, categories } = route.params;
  const navigation = useNavigation();
  const videoPlayerRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trainerId, setTrainerId] = useState(null);
  const [trainerEmail, setTrainerEmail] = useState(null);
  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      const updateTrainerIdAndEmail = async () => {
        const result = await fetchTrainerIdAndEmail();

        if (result && result.trainerId && result.trainerEmail) {
          setTrainerId(result.trainerId);
          setTrainerEmail(result.trainerEmail);
        }
      };

      updateTrainerIdAndEmail();
    }, [])
  );

  const stopVideo = async () => {
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.stopAsync();
    }
  };

  const handleSubmitUpload = async () => {
    setModalVisible(false);
    setUploading(true); // Start loading indicator
    const userId = firebase.auth().currentUser.uid;
    const thumbnailUri = await generateThumbnail(videoUri);
    const thumbnailUrl = await uploadThumbnail(thumbnailUri);
    const videoUrl = await uploadVideo(videoUri);
    const videoName = videoUri.substring(videoUri.lastIndexOf("/") + 1);
    await saveVideoMetadata(videoName, videoUrl, thumbnailUrl, false, userId);
    setUploading(false); // Stop loading indicator

    showMessage({
      message: `Video shared with ${trainerEmail} successfully`,
      type: "success",
      duration: 3000,
      position: "top",
      style: { paddingTop: 40 },
    });
  };

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log("trianerID +++++", trainerId);
              console.log("---- +++++", trainerEmail);
              if (trainerId) {
                setModalVisible(true);
              } else {
                Alert.alert(
                  "No Trainer Assigned",
                  "You must have a choose trainer before you can share videos.",
                  [{ text: "OK", onPress: () => {} }],
                  { cancelable: true }
                );
              }
            }}
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
  }, [navigation, videoUri, trainerId, trainerEmail]);

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
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      <UploadPromptModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onYes={handleSubmitUpload}
        trainerEmail={trainerEmail}
      />
      {isFocused && (
        <CustomVideoPlayer
          videoUri={videoUri}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish && !status.isLooping) {
              videoPlayerRef.current.pauseAsync();
            }
          }}
          videoPlayerRef={videoPlayerRef}
        />
      )}
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
