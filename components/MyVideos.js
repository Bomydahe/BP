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
  ActivityIndicator,
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
import {
  uploadThumbnail,
  saveVideoMetadata,
  uploadVideo,
  generateThumbnail,
  generateUniqueId,
} from "./firebaseFunctions";
import UploadPromptModal from "./UploadPromptModal";
import { showMessage } from "react-native-flash-message";

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
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useStoredData("@categories", [
    { id: 0, name: "All Videos", videos: [] },
  ]);

  function showModalForUploadPrompt(videoId) {
    setUploadPromptVisible(true);
    setCurrentVideoId(videoId);
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
            categories: categories,
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
      <View style={styles.uploadContainer}>
        <UploadPromptModal
          visible={uploadPromptVisible}
          onClose={() => setUploadPromptVisible(false)}
          onYes={async () => {
            setUploadPromptVisible(false);
            setUploading(true);
            const videoObj = categories
              .flatMap((category) => category.videos)
              .find((video) => video.id === currentVideoId);
            try {
              await uploadVideo(videoObj.url);

              showMessage({
                message: "Video shared successfully",
                type: "success",
                duration: 3000,
                position: "top",
              });
            } catch (error) {
              console.log("Error uploading video: ", error);
            } finally {
              setUploading(false);
            }
          }}
        />
        {uploading && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.activityIndicatorText}>Uploading video...</Text>
          </View>
        )}
      </View>

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

  uploadContainer: {
    position: "relative",
  },
  activityIndicatorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  activityIndicatorText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 1)",
  },
});
