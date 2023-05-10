/*
  * Author: Rastislav Duránik (xduran03)
  * File: Category.js
  * Brief: 
     Component displays a list of videos in a grid layout.
     It receives the videos as a prop, and renders each 
     video thumbnail as an Image component within a 
     TouchableOpacity. When a user taps on a video thumbnail,
     it navigates to the VideoPlayer screen with the selected
     video's URL as a parameter. The component uses a FlatList
     to display the videos in a grid layout with two columns.
     The width of each video is calculated based on the device
     width and the number of columns. The component also defines
     some styles for the container, the flatlist, and the video 
     thumbnails.
*/

import React from "react";
import { Video } from "expo-av";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function Category({ route }) {
  const [status, setStatus] = React.useState({});
  const videos = route.params.videos || [];
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("VideoPlayer", {
            videoUri: item.url,
          })
        }
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.video}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
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
