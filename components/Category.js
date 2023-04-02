import React from "react";
import { useState } from "react";
import { Video } from "expo-av";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  Dimensions,
  Button,
} from "react-native";
import Modal from "react-native-modal";

const allVideos = [
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    key: 1,
  },
  /* {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    key: 2,
  },

  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 3,
  },
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 4,
  },
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 5,
  }, */
];

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function Category(props) {
  const [status, setStatus] = React.useState({});

  const renderItem = ({ item, index }) => (
    <Video
      source={{ uri: item.url }}
      style={styles.video}
      resizeMode="contain"
      isLooping
      useNativeControls
      backgroundColor="black"
      autoPlay={false}
      posterSource={{ uri: item.poster }}
      //onPlaybackStatusUpdate={(status) => setStatus(() => status)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allVideos}
        renderItem={renderItem}
        keyExtractor={(item) => item.key.toString()}
        numColumns={numColumns}
        horizontal={false}
        style={styles.flatlist}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  flatlist: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  video: {
    width: videoWidth,
    height: 200,
    backgroundColor: "black",
    margin: 10,
    overflow: "hidden",
  },
});
