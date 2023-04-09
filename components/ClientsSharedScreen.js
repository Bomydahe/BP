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
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

export default function ClientsSharedScreen(props) {
  const [status, setStatus] = React.useState({});
  const { navigate } = useNavigation();
  const categories = [
    { id: 0, name: "New videos", videos: [] },
    { id: 1, name: "Handled videos", videos: [] },
  ];

  useFocusEffect(
    React.useCallback(() => {
      props.navigation.setOptions({
        title: "Shared with " + props.route.params.clientName,
      });
    }, [props.navigation, props.route.params.clientName])
  );

  /* removing video */
  function handleRemoveVideo(videoId) {
    categories.map((category) => {
      return {
        ...category,
        videos: category.videos.filter((video) => video.id !== videoId),
      };
    });
  }

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() =>
          navigate("VideoPlayer", {
            videoUri: item.url,
            videoId: item.id,
          })
        }
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.video}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeVideoButton}
        onPress={() => handleRemoveVideo(item.id)}
      >
        <AntDesign name="close" size={24} color="white" />
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView>
      <ScrollView>
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
});
