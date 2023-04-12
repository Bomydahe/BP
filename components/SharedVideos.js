import React from "react";
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
import { firebase } from "../firebaseConfig";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20) / numColumns;

export default function SharedVideos({ route }) {
  const [status, setStatus] = React.useState({});
  const [videos, setVideos] = React.useState([]);
  const navigation = useNavigation();
  console.log("----------------", videos);

  React.useEffect(() => {
    async function fetchVideos() {
      const videoList = await getAllVideos();
      const videoData = await Promise.all(
        videoList.map(async (video) => {
          return {
            id: video.id,
            url: video.url,
            thumbnail: video.thumbnail,
            videoName: video.videoName,
            comments: video.comments,
          };
        })
      );
      setVideos(videoData);
    }

    fetchVideos();
  }, []);

  /* retrieving all videos from firebase */
  async function getAllVideos() {
    try {
      const storageRef = firebase.storage().ref();
      const listResult = await storageRef.listAll();

      const firestore = firebase.firestore();

      const videoData = await Promise.all(
        listResult.items.map(async (item) => {
          const url = await item.getDownloadURL();
          const videoName = item.name;

          // Get video metadata from Firestore
          const videoRef = firestore.collection("videos").doc(videoName);
          const doc = await videoRef.get();

          if (!doc.exists) {
            console.log("No document with the given video name");
            return null;
          }

          const data = doc.data();
          return {
            url,
            id: data.id,
            thumbnail: data.thumbnail,
            videoName,
            comments: data.comments || [],
          };
        })
      );

      console.log("Video Data:", videoData);
      return videoData.filter((video) => video !== null);
    } catch (error) {
      console.error("Error getting video data:", error);
      return []; // Return an empty array in case of an error
    }
  }

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.videoWrapper,
          index % 2 === 1 && styles.videoWrapperRight,
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SharedVideoPlayer", {
              videoUri: item.url,
              comments: item.comments,
            })
          }
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.video}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      </View>
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
        columnWrapperStyle={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }} // Update this line
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  flatlist: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  video: {
    width: videoWidth - 30,
    height: 200,
    backgroundColor: "black",
    marginBottom: 10,
    overflow: "hidden",
  },

  videoWrapper: {
    width: videoWidth,
    justifyContent: "flex-start",
    paddingBottom: 20,
  },

  videoWrapperRight: {
    marginLeft: 10,
  },
});
