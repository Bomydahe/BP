/*
  * Author: Rastislav Duránik (xduran03)
  * File: SharedCategory.js
  * Brief:      
     Component written in JavaScript that displays 
     a grid of videos with thumbnails. It uses the
     Expo-av package to play videos and the React 
     Native framework for mobile app development.
     The component takes in a list of videos and
     their metadata as props, and renders them in
     a FlatList with a numColumns layout. The useFocusEffect
     hook is used to update the navigation options when the
     component is focused, and the renderItem function is 
     used to render each video thumbnail. Clicking on a
     thumbnail navigates to a video player screen. The 
     styles object defines the styling for the component.
*/


import React from "react";
import { Video } from "expo-av";
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function SharedCategory({ route }) {
  const [status, setStatus] = React.useState({});
  const videos = route.params.videos || [];
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        title: route.params.categoryName,
      });
    }, [navigation, route.params.categoryName])
  );

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("TrainerVideoPlayer", {
            videoUri: item.url,
            videoName: item.videoName,
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
