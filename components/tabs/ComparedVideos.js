/*
  * Author: Rastislav Duránik (xduran03)
  * File: ComparedVideos.js
  * Brief: 
      This component displays a grid of video comparisons. 
      The videos are shown in pairs, with their thumbnails 
      and a "vs" overlay. Users can delete a video comparison 
      by tapping the close button on the top right corner of 
      each video comparison. The component utilizes AsyncStorage 
      to save and load video comparisons.
*/

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as VideoThumbnails from "expo-video-thumbnails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import { useVideoComparisons } from "../../hooks/useVideoComparisons";

// Sets the dimensions for the video grid layout
const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function ComparedVideos({ route }) {
  const { video1, video2 } = { ...route.params };
  const [video1Thumbnail, setVideo1Thumbnail] = useState(null);
  const [video2Thumbnail, setVideo2Thumbnail] = useState(null);
  const navigation = useNavigation();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  const {
    videoComparisons,
    setVideoComparisons,
    loadVideoComparisons,
    saveVideoComparisons,
    generateThumbnail,
    confirmDeleteVideo,
  } = useVideoComparisons();

  // useEffect hook to load video comparisons and set thumbnails
  useEffect(() => {
    (async () => {
      if (video1 && video2) {
        const thumbnail1 = await generateThumbnail(video1);
        const thumbnail2 = await generateThumbnail(video2);

        const newComparison = {
          id: Date.now(),
          video1: {
            uri: video1,
            thumbnail: thumbnail1,
            time: route.params.video1Time,
          },
          video2: {
            uri: video2,
            thumbnail: thumbnail2,
            time: route.params.video2Time,
          },
        };

        const updatedComparisons = [...videoComparisons, newComparison];
        setVideoComparisons(updatedComparisons);
        saveVideoComparisons(updatedComparisons);

        setVideo1Thumbnail(thumbnail1);
        setVideo2Thumbnail(thumbnail2);
      }
    })();
  }, [video1, video2]);

  const handleRemoveVideo = (videoId) => {
    setDeletingVideoId(videoId);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmedDelete = () => {
    confirmDeleteVideo(deletingVideoId);
    setDeletingVideoId(null);
    setConfirmDeleteVisible(false);
  };

  // Renders a video comparison item
  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity
          style={styles.video}
          onPress={() => {
            navigation.navigate("ComparedVideoPlayer", {
              video1Uri: item.video1.uri,
              video1Time: item.video1.time,
              video2Uri: item.video2.uri,
              video2Time: item.video2.time,
            });
          }}
        >
          <View style={styles.timestampContainer}>
            <Image
              source={{ uri: item.video1.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
          <View style={styles.whiteLine} />
          <View style={styles.timestampContainer}>
            <Image
              source={{ uri: item.video2.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayText}>vs</Text>
          </View>
        </TouchableOpacity>
        {/* Add the remove video button */}
        <TouchableOpacity
          style={styles.removeVideoButton}
          onPress={() => handleRemoveVideo(item.id)}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Returns the main view with a FlatList of video comparisons and a ConfirmDeleteModal
  return (
    <View style={styles.container}>
      <FlatList
        data={videoComparisons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        horizontal={false}
        style={styles.flatlist}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
      <ConfirmDeleteModal
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onConfirm={handleConfirmedDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  video: {
    width: videoWidth,
    height: 200,
    //backgroundColor: "black",
    margin: 10,
  },
  timestampContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  flatlist: {
    width: "100%",
    paddingHorizontal: 10,
  },

  overlayText: {
    position: "absolute",
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    top: "38%",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 15,
  },

  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  removeVideoButton: {
    position: "absolute",
    top: 15,
    right: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  whiteLine: {
    width: "100%", // adjust the width of the white line as desired
    height: 3,
    backgroundColor: "rgba(242, 242, 242, 1)",
  },
});
