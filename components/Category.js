import React from "react";
import { Video } from "expo-av";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  Dimensions,
  Button,
} from "react-native";

const { width } = Dimensions.get("window");
const numColumns = 2;
const videoWidth = (width - 20 * (numColumns + 1)) / numColumns;

export default function Category({ route }) {
  const [status, setStatus] = React.useState({});
  const videos = route.params.videos || [];

  const renderItem = ({ item, index }) => (
    <Video
      source={{ uri: item.url }}
      style={styles.video}
      resizeMode="cover"
      isLooping
      useNativeControls
      backgroundColor="black"
      autoPlay={false}
      posterSource={{ uri: item.poster }}
      //onPlaybackStatusUpdate={(status) => setStatus(() => status)}
    />
  );

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
