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
import { firebase } from "../firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback } from "react";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function SharedCategory({ route }) {
  const [status, setStatus] = React.useState({});
  const videos = route.params.videos || [];
  const navigation = useNavigation();

  const handleAddComment = useCallback(() => {
    // Implement the logic for adding a comment here
    //navigation.goBack();
    console.log("+-+-+-+-+-+-+-+-+-");
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        title: route.params.categoryName,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleAddComment}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons name="message" size={24} color="white" />
          </TouchableOpacity>
        ),
      });
    }, [navigation, route.params.categoryName, handleAddComment])
  );

  async function addComment(videoName, commentText, time) {
    try {
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      // Get the current comments array from the video document
      const videoDoc = await videoRef.get();
      const comments = videoDoc.data().comments || [];

      // Create a new comment object with the provided text and time
      const newComment = { text: commentText, time: time };

      // Add the new comment to the existing comments array
      comments.push(newComment);

      // Update the comments field in the video document with the new comments array
      await videoRef.update({ comments: comments });

      console.log(`Comment added to video ${videoName}:`, newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

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
