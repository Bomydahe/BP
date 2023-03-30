import React, { useRef } from "react";
import { Video } from "expo-av";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";

const allVideos = [
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    key: 1,
  },
  {
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
  },
];

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function Category(props) {
  const [status, setStatus] = React.useState({});
  const videoRefs = useRef([]);

  const onVideoRef = (ref, index) => {
    videoRefs.current[index] = ref;
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Video
        ref={(ref) => onVideoRef(ref, index)}
        source={{ uri: item.url }}
        style={styles.video}
        resizeMode="contain"
        isLooping
        useNativeControls
        backgroundColor="black"
        autoPlay={false}
        posterSource={{ uri: item.poster }}
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) {
            return;
          }
          if (status.isPlaying && videoRefs.current[index]) {
            videoRefs.current[index].pauseAsync();
          }
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allVideos}
        renderItem={renderItem}
        keyExtractor={(item) => item.key.toString()}
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

  videoContainer: {
    width: videoWidth,
    height: 200,
    backgroundColor: "black",
    margin: 10,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: "100%",
  },
});
