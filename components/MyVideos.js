import React, { useState, useEffect } from "react";
import { Video } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStoredData from "../hooks/useStoredData";
import VideoAddModal from "./VideoAddModal";
import FAB from "./FAB";

export default function MyVideos(props) {
  const [status, setStatus] = React.useState({});
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoCounter, setVideoCounter] = useState(1);
  const [categories, setCategories] = useStoredData("@categories", [
    { id: 0, name: "All Videos", videos: [] },
  ]);

  /* adding category */
  function addCategory() {
    const newCategory = {
      id: categories.length,
      name: `Section ${categories.length}`,
      videos: [],
    };
    setCategories([...categories, newCategory]);
  }

  /* adding videos in categories */
  function handleAddVideo(videoUri, categoryId) {
    const videoObj = {
      url: videoUri,
      key: videoCounter,
    };

    setVideoCounter(videoCounter + 1);

    setCategories(
      categories.map((category) => {
        if (category.id === 0 || category.id === categoryId) {
          return {
            ...category,
            videos: [...category.videos, videoObj],
          };
        }
        return category;
      })
    );
    setModalVisible(false);
  }

  /* picking video from native phone memory */
  async function pickVideo() {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === "granted") {
      let chosenVideo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        //allowsEditing: true,
        quality: 1,
      });

      if (!chosenVideo.canceled) {
        const selectedVideo = chosenVideo.assets[0];
        showModal(selectedVideo.uri);
      }
    } else {
      console.log("Permission not granted");
    }
  }

  function showModal(videoUri) {
    setModalVisible(true);
    setSelectedVideoUri(videoUri);
  }

  /* removing video */
  function handleRemoveVideo(videoKey) {
    setCategories(
      categories.map((category) => {
        return {
          ...category,
          videos: category.videos.filter((video) => video.key !== videoKey),
        };
      })
    );
  }

  const renderItem = ({ item }) => (
    <>
      <Video
        source={{ uri: item.url }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        useNativeControls
        backgroundColor="black"
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <TouchableOpacity
        style={styles.removeVideoButton}
        onPress={() => handleRemoveVideo(item.key)}
      >
        <AntDesign name="close" size={24} color="white" />
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <SafeAreaView>
        <ScrollView>
          <View style={styles.myVideosTabContainer}>
            {categories.map((category) => (
              <View key={category.id} style={styles.sectionContainer}>
                <View style={styles.labels}>
                  <Text style={styles.text}>{category.name}</Text>
                  <Pressable
                    onPress={() =>
                      navigate("Category", {
                        categoryName: category.name,
                        videos: category.videos,
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
                  keyExtractor={(item) => item.key}
                  horizontal={true}
                  style={styles.flatlist}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <VideoAddModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        categories={categories}
        handleAddVideo={handleAddVideo}
        selectedVideoUri={selectedVideoUri}
      />
      <FAB
        open={open}
        setOpen={setOpen}
        pickVideo={pickVideo}
        navigate={navigate}
        addCategory={addCategory}
      />
    </>
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
    height: 260,
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
    color: "blue",
    fontSize: 16,
    lineHeight: 22,
  },

  video: {
    width: 180,
    height: 200,
    marginRight: 10,
  },

  labelStyle: {
    bottom: 0,
  },

  removeVideoButton: {
    position: "absolute",
    top: 5,
    right: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
