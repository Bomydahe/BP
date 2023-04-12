import React, { useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Button } from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";

export default function VideoPlayerScreen({ route }) {
  const { videoUri } = route.params;
  const navigation = useNavigation();
  const videoRef = useRef(null);

  const stopVideo = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
  };

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={async () => {
            await stopVideo();
            navigation.navigate("Compare", { firstVideo: videoUri });
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
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
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
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
