import React, { useState, useEffect } from "react";
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
  TouchableHighlight,
  SafeAreaView,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStoredData from "../hooks/useStoredData";
import VideoAddModal from "./VideoAddModal";
import FAB from "./FAB";
import { EventRegister } from "react-native-event-listeners";
import CategoryEditModal from "./CategoryEditModal";
import * as VideoThumbnails from "expo-video-thumbnails";
import { firebase } from "../firebaseConfig";

export default function MyVideos(props) {
  const [status, setStatus] = React.useState({});
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryEditModalVisible, setCategoryEditModalVisible] =
    useState(false);
  const [videoCounter, setVideoCounter] = useState(1);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [action, setAction] = useState(null);
  const [uploadPromptVisible, setUploadPromptVisible] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [categories, setCategories] = useStoredData("@categories", [
    { id: 0, name: "All Videos", videos: [] },
  ]);

  async function uploadThumbnail(localThumbnailUrl) {
    const response = await fetch(localThumbnailUrl);
    const blob = await response.blob();
    const thumbnailName =
      "thumbnails/" +
      localThumbnailUrl.substring(localThumbnailUrl.lastIndexOf("/") + 1);
    const storageRef = firebase.storage().ref().child(thumbnailName);

    await storageRef.put(blob);

    const downloadUrl = await storageRef.getDownloadURL();
    return downloadUrl;
  }

  /* metadata to save/upload along with videos */
  async function saveVideoMetadata(
    videoName,
    videoUrl,
    thumbnailUrl,
    booleanVar,
    userId
  ) {
    const videoRef = firebase.firestore().collection("videos").doc(videoName);
    await videoRef.set({
      id: generateUniqueId(),
      url: videoUrl,
      videoName: videoName,
      thumbnail: thumbnailUrl,
      booleanVar: booleanVar,
      userId: userId,
    });
  }

  /* upload video to firebase */
  async function uploadVideo(videoUrl) {
    console.log("Uploading video with URL:", videoUrl);
    const localThumbnailUrl = await generateThumbnail(videoUrl);

    // Upload the thumbnail to Firebase Storage and get its download URL
    const thumbnailUrl = await uploadThumbnail(localThumbnailUrl);

    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const videoName = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
    const storageRef = firebase.storage().ref().child(videoName).put(blob);

    try {
      await storageRef;
      console.log("Video uploaded successfully");

      // Get the user ID from Firebase Authentication
      const userId = firebase.auth().currentUser.uid;

      // Save video metadata to Firestore with an initial boolean value (e.g., true)
      await saveVideoMetadata(videoName, videoUrl, thumbnailUrl, false, userId);
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  }

  function showModalForUploadPrompt(videoId) {
    setUploadPromptVisible(true);
    setCurrentVideoId(videoId); // Add this line
  }

  /* adding category */
  function addCategory(name) {
    const newCategory = {
      id: generateUniqueId(),
      name: name,
      videos: [],
    };
    setCategories([...categories, newCategory]);
  }

  /* deleting category */
  function handleDeleteCategory(categoryId) {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== categoryId)
    );
  }

  /* editing category */
  function handleEditCategory(categoryId, categoryName) {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? { ...category, name: categoryName }
          : category
      )
    );
  }

  function showAddCategoryModal() {
    setAction("add");
    setEditingCategoryId(null);
  }

  useEffect(() => {
    const deleteListener = EventRegister.addEventListener(
      "deleteCategory",
      (categoryId) => {
        handleDeleteCategory(categoryId);
        navigate("Home");
      }
    );

    const editListener = EventRegister.addEventListener(
      "editCategory",
      (categoryId) => {
        setEditingCategoryId(categoryId);
        setCategoryEditModalVisible(true);
      }
    );

    return () => {
      EventRegister.removeEventListener(deleteListener);
      EventRegister.removeEventListener(editListener);
    };
  }, []);

  /* adding videos in categories */
  async function handleAddVideo(videoUri, categoryId) {
    const thumbnailUri = await generateThumbnail(videoUri);

    const videoObj = {
      url: videoUri,
      id: generateUniqueId(),
      thumbnail: thumbnailUri,
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
    if (modalVisible) setModalVisible(false);
  }

  async function generateThumbnail(videoUri) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
      });
      return uri;
    } catch (e) {
      console.warn(e);
      return null;
    }
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
        if (categories.length === 1) {
          const categoryId = categories[0].id;
          handleAddVideo(selectedVideo.uri, categoryId);
        } else {
          showModal(selectedVideo.uri);
        }
      }
    } else {
      console.log("Permission not granted");
    }
  }

  function showModal(videoUri) {
    setModalVisible(true);
    setSelectedVideoUri(videoUri);
  }

  function generateUniqueId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    ).toUpperCase();
  }

  /* removing video */
  function handleRemoveVideo(videoId) {
    setCategories(
      categories.map((category) => {
        return {
          ...category,
          videos: category.videos.filter((video) => video.id !== videoId),
        };
      })
    );
  }

  const renderItem = ({ item }) => (
    <>
      <TouchableHighlight
        onLongPress={() => showModalForUploadPrompt(item.id)}
        onPress={() =>
          navigate("VideoPlayer", {
            videoUri: item.url,
            videoId: item.id,
          })
        }
        underlayColor="transparent"
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.video}
          resizeMode="cover"
        />
      </TouchableHighlight>

      <TouchableOpacity
        style={styles.removeVideoButton}
        onPress={() => handleRemoveVideo(item.id)}
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
                  keyExtractor={(item) => item.id.toString()}
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
      <CategoryEditModal
        modalVisible={editingCategoryId !== null || action === "add"}
        setModalVisible={() => {
          setEditingCategoryId(null);
          setAction(null);
        }}
        categories={categories}
        handleEditCategory={handleEditCategory}
        editingCategoryId={editingCategoryId}
        action={action}
        addCategory={addCategory}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadPromptVisible}
        onRequestClose={() => {
          setUploadPromptVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Do you want to share this video?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: "green" }}
                onPress={() => {
                  const videoObj = categories
                    .flatMap((category) => category.videos)
                    .find((video) => video.id === currentVideoId);
                  uploadVideo(videoObj.url);
                  setUploadPromptVisible(false);
                }}
              >
                <Text style={styles.textStyle}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: "red" }}
                onPress={() => setUploadPromptVisible(false)}
              >
                <Text style={styles.textStyle}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FAB
        open={open}
        setOpen={setOpen}
        pickVideo={pickVideo}
        navigate={navigate}
        addCategory={showAddCategoryModal}
        categories={categories}
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
    color: "blue",
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

  removeVideoButton: {
    position: "absolute",
    top: 5,
    right: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
