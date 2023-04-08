import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

export default function ComparedVideoPlayer({ route }) {
  const { video1Uri, video1Time, video2Uri, video2Time } = route.params;
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

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

  useEffect(() => {
    const setVideoPositions = async () => {
      if (video1Ref.current && video2Ref.current) {
        await video1Ref.current.setPositionAsync(video1Time * 1000);
        await video2Ref.current.setPositionAsync(video2Time * 1000);
      }
    };

    setVideoPositions();
  }, [video1Ref, video2Ref, video1Time, video2Time]);

  return (
    <View style={styles.container}>
      <Video
        ref={video1Ref}
        source={{ uri: video1Uri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        useNativeControls
        style={styles.video}
      />
      <Video
        ref={video2Ref}
        source={{ uri: video2Uri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        useNativeControls
        style={styles.video}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "50%",
  },
});
