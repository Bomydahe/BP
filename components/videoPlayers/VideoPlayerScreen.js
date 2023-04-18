import React, { useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Button, Text } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { MaterialIcons } from "@expo/vector-icons";

export default function VideoPlayerScreen({ route }) {
  const { videoUri, categories } = route.params;
  const navigation = useNavigation();
  const videoPlayerRef = useRef(null);

  const stopVideo = async () => {
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.stopAsync();
    }
  };

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity onPress={() => {}} style={styles.shareIcon}>
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
    marginLeft: 5,
  },
});
