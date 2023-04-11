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
import * as VideoThumbnails from "expo-video-thumbnails";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20) / numColumns;

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

export default function SharedVideos({ route }) {
  const [status, setStatus] = React.useState({});
  const [videos, setVideos] = React.useState([]);
  const navigation = useNavigation();

  React.useEffect(() => {
    async function fetchVideos() {
      const videoUrls = await getAllVideos();
      const videoData = await Promise.all(
        videoUrls.map(async (url, index) => {
          const thumbnail = await generateThumbnail(url);
          return {
            id: index,
            url,
            thumbnail,
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

      const urls = await Promise.all(
        listResult.items.map(async (item) => {
          const url = await item.getDownloadURL();
          return url;
        })
      );

      console.log("Download URLs:", urls);
      return urls;
    } catch (error) {
      console.error("Error getting download URLs:", error);
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
    width: videoWidth - 10,
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
