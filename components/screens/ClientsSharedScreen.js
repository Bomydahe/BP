/*
  * Author: Rastislav Duránik (xduran03)
  * File: ClientsSharedScreen.js
  * Brief: 
      This component displays shared videos with a client, 
      categorizing them into "New videos" and "Handled videos" 
      based on their booleanVar value. The component receives 
      all videos as a prop and creates categories by filtering them 
      accordingly. The navigation title is updated to display the 
      client's email. It also provides a "Show All" option to navigate 
      to a detailed view of each category. While loading the videos, 
      the component displays a loading indicator, and if no videos 
      are available, it displays an empty list message.
*/

import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { firebase } from "../../firebaseConfig";
import { isEmpty } from "lodash";

export default function ClientsSharedScreen(props) {
  // Initialize state variables
  const [status, setStatus] = useState({});
  const { navigate } = useNavigation();
  const [allVideos, setAllVideos] = useState(props.route.params.videos);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const fetchVideos = () => {
    const newVideos = allVideos.filter((video) => video.booleanVar === false);
    const handledVideos = allVideos.filter(
      (video) => video.booleanVar === true
    );

    setCategories([
      { id: 0, name: "New videos", videos: newVideos },
      { id: 1, name: "Handled videos", videos: handledVideos },
    ]);

    setIsLoading(false);
  };

  // Fetch videos when the component mounts or allVideos changes.
  useEffect(() => {
    setIsLoading(true);
    fetchVideos();
  }, [allVideos]);

  // Updating the navigation title
  useFocusEffect(
    React.useCallback(() => {
      props.navigation.setOptions({
        title: "Shared with " + props.route.params.clientEmail,
      });
    }, [props.navigation, props.route.params.clientName])
  );

  // Updating a video's boolean value that checks whether video is handled
  async function updateVideoBooleanValue(videoName, newValue) {
    console.log(
      `Trying to update video ${videoName} booleanVar to ${newValue}`
    );

    try {
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      // Update the booleanVar value in Firestore
      await videoRef.update({ booleanVar: newValue });

      console.log(`Video ${videoName} booleanVar updated to ${newValue}`);

      // Update the video in allVideos
      const updatedAllVideos = allVideos.map((video) =>
        video.videoName === videoName
          ? { ...video, booleanVar: newValue }
          : video
      );

      // Set the updated allVideos array into the state
      setAllVideos(updatedAllVideos);
    } catch (error) {
      console.error("Error updating video booleanVar:", error);
    }
  }

  // Renders a single video item
  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={async () => {
          // Update the video's booleanVar to true before navigating to the video player
          await updateVideoBooleanValue(item.videoName, true);

          navigate("TrainerVideoPlayer", {
            videoUri: item.url,
            videoName: item.videoName,
          });
        }}
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.video}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </>
  );

  // Displays when there are no videos
  function EmptyListComponent() {
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>No videos have been added yet.</Text>
      </View>
    );
  }

  // Rendering of the component, displaying a loading indicator or the list of categorized videos
  return (
    <SafeAreaView>
      <ScrollView>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <View style={styles.myVideosTabContainer}>
            {categories.map((category) => (
              <View key={category.id} style={styles.sectionContainer}>
                <View style={styles.labels}>
                  <Text style={styles.text}>{category.name}</Text>
                  <Pressable
                    onPress={() =>
                      navigate("SharedCategory", {
                        categoryName: category.name,
                        videos: category.videos,
                        categoryId: category.id,
                      })
                    }
                    android_ripple={{ color: "#210644" }}
                  >
                    <Text style={styles.pressableLabel}>SHOW ALL</Text>
                  </Pressable>
                </View>
                <FlatList
                  data={category.videos}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  horizontal={true}
                  style={styles.flatlist}
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={EmptyListComponent}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  myVideosTabContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 0,
    padding: 10,
  },

  sectionContainer: {
    width: "100%",
    height: 210,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 0,
    padding: 0,
  },

  flatlist: {
    marginTop: 0,
    padding: 0,
    marginBottom: 0,
  },

  text: {
    fontSize: 17,
    lineHeight: 22,
    fontStyle: "italic",
    fontWeight: "300",
    color: "grey",
  },

  labels: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 0,
    borderBottomWidth: 0.3,
    borderBottomColor: "grey",
  },

  pressableLabel: {
    color: "#007AFF",
    fontSize: 16,
    lineHeight: 22,
  },

  video: {
    width: 130,
    height: 160,
    marginRight: 10,
  },

  labelStyle: {
    bottom: 0,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 160,
  },
  emptyListText: {
    fontSize: 16,
    color: "grey",
    fontStyle: "italic",
  },
});
