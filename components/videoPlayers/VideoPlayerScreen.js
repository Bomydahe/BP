import React, { useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Button } from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";
import CustomVideoPlayer from "./CustomVideoPlayer";

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
        <Button
          onPress={async () => {
            await stopVideo();
            navigation.navigate("Compare", {
              firstVideo: videoUri,
              categories: categories,
            });
          }}
          title="Compare"
        />
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
});
