import React from "react";
import { useState } from "react";
import { Video, AVPlaybackStatus } from "expo-av";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  Image,
} from "react-native";

export default function MyVideos(props) {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        }}
        useNativeControls
        resizeMode="contain"
        backgroundColor="black"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View style={styles.buttons}>
        <Button
          title={status.isPlaying ? "Pause" : "Play"}
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  myVideosTabContainer: {
    flex: 1,
    width: "95%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },

  video: {
    width: 100,
    height: 200,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  myVideosTabAllVideosContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },

  myVideosTabCategoryContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
