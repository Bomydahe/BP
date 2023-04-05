import React, { useState } from "react";
import { Video } from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

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

export default function Compare(props) {
  const [video1, setVideo1] = useState(null);
  const [video2, setVideo2] = useState(null);
  const [showVideoList, setShowVideoList] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

  const handleAddVideo = (videoIndex) => {
    setSelectedVideoIndex(videoIndex);
    setShowVideoList(true);
  };

  const handleRemoveVideo = (videoIndex) => {
    if (videoIndex === 1) {
      setVideo1(null);
    } else {
      setVideo2(null);
    }
  };

  const handleVideoSelection = (url) => {
    if (selectedVideoIndex === 1) {
      setVideo1(url);
    } else {
      setVideo2(url);
    }
    setShowVideoList(false);
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleVideoSelection(item.url)}>
      <Image source={{ uri: item.poster }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!showVideoList ? (
        <>
          <View style={styles.videoWrapper}>
            {video1 ? (
              <>
                <Video
                  source={{ uri: video1 }}
                  style={styles.video}
                  resizeMode="cover"
                  isLooping
                  useNativeControls
                  backgroundColor="black"
                />
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={() => handleRemoveVideo(1)}
                >
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.videoPlaceholder}
                onPress={() => handleAddVideo(1)}
              >
                <Text style={styles.addVideoText}>Add video to compare</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.videoWrapper}>
            {video2 ? (
              <>
                <Video
                  source={{ uri: video2 }}
                  style={styles.video}
                  resizeMode="contain"
                  isLooping
                  useNativeControls
                  backgroundColor="black"
                />
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={() => handleRemoveVideo(2)}
                >
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.videoPlaceholder}
                onPress={() => handleAddVideo(2)}
              >
                <Text style={styles.addVideoText}>Add video to compare</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <FlatList
          data={allVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.key.toString()}
          contentContainerStyle={styles.videoList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  videoWrapper: {
    width: width * 0.95,
    height: height * 0.45,
    backgroundColor: "transparent",
  },
  videoPlaceholder: {
    flex: 1,
    borderWidth: 2,
    borderColor: "black",
    borderStyle: "dotted",
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addVideoText: {
    fontSize: 18,
    color: "black",
  },

  thumbnail: {
    width: (width - 40) / 2, // Adjust width to fit two thumbnails per row
    height: 200,
    marginRight: 10,
    marginBottom: 10,
  },
  videoList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  video: {
    width: width * 0.95,
    height: height * 0.45,
    backgroundColor: "black",
  },

  removeVideoButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
