import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
  Modal,
  Button,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function Compare(props) {
  const [video1, setVideo1] = useState(null);
  const [video2, setVideo2] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const categories = props.route.params.categories;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalStep, setModalStep] = useState("initial");
  const [video1Time, setVideo1Time] = useState(0);
  const [video2Time, setVideo2Time] = useState(0);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    checkFirstVideo();
  }, []);

  useEffect(() => {
    if (!modalVisible) {
      setModalStep("initial");
    }
  }, [modalVisible]);

  const checkFirstVideo = () => {
    const firstVideo = props.route.params?.firstVideo;
    if (firstVideo) {
      setVideo1(firstVideo);
      //setModalStep("initial");
    }
  };

  const updateNavigationOptions = useCallback(() => {
    navigation.setOptions({
      headerRight: () =>
        video1 && video2 ? (
          <Button onPress={handleCompare} title="Compare" />
        ) : null,
    });
  }, [navigation, handleCompare, video1, video2]);

  const handleCompare = useCallback(async () => {
    const video1Status = await video1Ref.current.getStatusAsync();
    const video2Status = await video2Ref.current.getStatusAsync();

    navigation.navigate("Compared", {
      video1: video1,
      video2: video2,
      video1Time: video1Status.positionMillis / 1000,
      video2Time: video2Status.positionMillis / 1000,
    });
  }, [navigation, video1, video2]);

  useLayoutEffect(() => {
    updateNavigationOptions();
  }, [updateNavigationOptions, video1, video2]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCategorySelection(item)}>
      <Text style={styles.categoryItem}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    setModalStep("selectVideo");
  };

  async function pickVideoFromStorage() {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === "granted") {
      let chosenVideo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!chosenVideo.canceled) {
        const selectedVideo = chosenVideo.assets[0].uri;
        if (selectedVideoIndex === 1) {
          setVideo1(selectedVideo);
        } else {
          setVideo2(selectedVideo);
        }
        setModalStep("initial");
        setModalVisible(false);
      }
    } else {
      console.log("Permission not granted");
    }
  }

  const handleRemoveVideo = (videoIndex) => {
    if (videoIndex === 1) {
      setVideo1(null);
    } else {
      setVideo2(null);
    }
    setModalStep("initial");
  };

  const renderVideoItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleVideoSelection(item.url)}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      </TouchableOpacity>
    );
  };

  const handleVideoSelection = (url) => {
    if (selectedVideoIndex === 1) {
      setVideo1(url);
    } else {
      setVideo2(url);
    }
    setModalVisible(false);
    setModalStep("initial");
  };

  const renderModalContent = () => {
    switch (modalStep) {
      case "initial":
        return (
          <View style={styles.categoryList}>
            <TouchableOpacity
              onPress={pickVideoFromStorage}
              style={{ marginBottom: 20 }}
            >
              <Text>Choose video from phone storage</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalStep("selectCategory")}>
              <Text>Choose video from categories</Text>
            </TouchableOpacity>
          </View>
        );
      case "selectCategory":
        return (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.categoryList}
            showsVerticalScrollIndicator={false}
            key="categoryList"
          />
        );
      case "selectVideo":
        return (
          <FlatList
            data={selectedCategory.videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.videoList}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            key="videoList"
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        {video1 ? (
          <>
            <Video
              ref={video1Ref}
              source={{ uri: video1 }}
              style={styles.video}
              resizeMode="contain"
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
            onPress={() => {
              setSelectedVideoIndex(1);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addVideoText}>Add video to compare</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.videoWrapper}>
        {video2 ? (
          <>
            <Video
              ref={video2Ref}
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
            onPress={() => {
              setSelectedVideoIndex(2);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addVideoText}>Add video to compare</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              //justifyContent: "center",
              //alignItems: "center",
              padding: 20,
              borderRadius: 10,
              width: width * 0.8,
              maxHeight: height * 0.8,
            }}
          >
            {renderModalContent()}
          </View>
        </View>
      </Modal>
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
    borderStyle: "dashed",
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addVideoText: {
    fontSize: 18,
    color: "black",
  },
  thumbnail: {
    width: (width - 40) / 2,
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
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "grey",
  },
  categoryList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
});
