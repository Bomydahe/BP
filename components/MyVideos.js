import React from "react";
import { useState } from "react";
import { Video } from "expo-av";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  SafeAreaView,
} from "react-native";
import { FAB } from "react-native-paper";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";

const allVideos = [
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    key: 1,
  },
  /* {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    key: 2,
  },

  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 3,
  },
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 4,
  },
  {
    url: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    key: 5,
  }, */
];

export default function MyVideos(props) {
  const [status, setStatus] = React.useState({});
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);

  const renderItem = ({ item }) => (
    <Video
      source={{ uri: item.url }}
      style={styles.video}
      resizeMode="contain"
      isLooping
      useNativeControls
      backgroundColor="black"
      onPlaybackStatusUpdate={(status) => setStatus(() => status)}
    />
  );

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.myVideosTabContainer}>
          <View style={styles.sectionContainer}>
            <View style={styles.labels}>
              <Text style={styles.text}>Section X</Text>
              <Pressable
                onPress={() => navigate("Category")}
                android_ripple={{ color: "#210644" }}
              >
                <Text style={styles.pressableLabel}>SHOW ALL</Text>
              </Pressable>
            </View>
            <FlatList
              data={allVideos}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              horizontal={true}
              style={styles.flatlist}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.labels}>
              <Text style={styles.text}>Section Y</Text>
              <Pressable
                onPress={() => navigate("Category")}
                android_ripple={{ color: "#210644" }}
              >
                <Text style={styles.pressableLabel}>SHOW ALL</Text>
              </Pressable>
            </View>
            <FlatList
              data={allVideos}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              horizontal={true}
              style={styles.flatlist}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.labels}>
              <Text style={styles.text}>Section Y</Text>
              <Pressable
                onPress={() => navigate("Category")}
                android_ripple={{ color: "#210644" }}
              >
                <Text style={styles.pressableLabel}>SHOW ALL</Text>
              </Pressable>
            </View>
            <FlatList
              data={allVideos}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              horizontal={true}
              style={styles.flatlist}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.labels}>
              <Text style={styles.text}>Section Y</Text>
              <Pressable
                onPress={() => navigate("Category")}
                android_ripple={{ color: "#210644" }}
              >
                <Text style={styles.pressableLabel}>SHOW ALL</Text>
              </Pressable>
            </View>
            <FlatList
              data={allVideos}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              horizontal={true}
              style={styles.flatlist}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          {/********************************************************/}
        </View>
      </ScrollView>
      <FAB.Group
        open={open}
        icon={open ? "close" : "plus"}
        actions={[
          {
            icon: "plus",
            onPress: () => console.log("Pressed star"),
            label: "Add video",
            labelStyle: styles.actionLabel,
          },
          {
            icon: "square",
            onPress: () => navigate("Compare"),
            label: "Compare video",
            labelStyle: styles.actionLabel,
          },
        ]}
        onStateChange={({ open }) => setOpen(open)}
      />
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
});
