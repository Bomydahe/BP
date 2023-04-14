import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  PanResponder,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { BackHandler } from "react-native";
import * as FileSystem from "expo-file-system";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { firebase } from "../firebaseConfig";

const { width, height } = Dimensions.get("window");

export default function VideoEditScreen({ route, navigation }) {
  const { videoUri, videoName, position, snapshotUri } = route.params;
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [color, setColor] = useState("red");
  const [lineWidth, setLineWidth] = useState(5);

  const handleGoBack = async () => {
    if (snapshotUri) {
      try {
        await FileSystem.deleteAsync(snapshotUri, { idempotent: true });
        console.log("Temporary snapshot file deleted:", snapshotUri);
      } catch (error) {
        console.error("Error deleting temporary snapshot file:", error);
      }
    }
    navigation.goBack();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setCurrentPath("");
    },
    onPanResponderMove: (event, gestureState) => {
      const { moveX, moveY } = gestureState;
      const newPoint = `${moveX},${moveY}`;
      setCurrentPath((prevPath) =>
        prevPath ? `${prevPath} L${newPoint}` : `M${newPoint}`
      );
      console.log("Current path:", currentPath);
    },

    onPanResponderRelease: () => {
      setPaths((prevPaths) => {
        const newPaths = [
          ...prevPaths,
          { d: currentPath, stroke: color, strokeWidth: lineWidth },
        ];
        console.log("Paths:", newPaths);
        return newPaths;
      });
      setCurrentPath("");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 10 }}>
          <Ionicons name="save" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  async function addOverlay(videoName, overlayData, time) {
    try {
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      // Get the current overlays array from the video document
      const videoDoc = await videoRef.get();
      const overlays = videoDoc.data().overlays || [];

      // Create a new overlay object with the provided overlay data and time
      const newOverlay = { overlayData: overlayData, time: time };

      // Add the new overlay to the existing overlays array
      overlays.push(newOverlay);

      // Update the overlays field in the video document with the new overlays array
      await videoRef.update({ overlays: overlays });

      console.log(`Overlay added to video ${videoName}:`, newOverlay);
    } catch (error) {
      console.error("Error adding overlay:", error);
    }
  }

  const handleSave = async () => {
    setPaths((currentPaths) => {
      console.log("paths:", currentPaths);
      (async () => {
        try {
          // Create a new array with all necessary data
          const pathsData = currentPaths.map((path) => ({
            d: path.d,
            stroke: path.stroke,
            strokeWidth: (path.strokeWidth / width) * 100, // store strokeWidth as a percentage
          }));

          console.log("pathsdata:", pathsData);

          // Add the path data to Firestore
          await addOverlay(videoName, pathsData, position);

          // Navigate back to the previous component
          navigation.goBack();
        } catch (error) {
          console.error("Error saving overlay:", error);
        }
      })();
      return currentPaths;
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: snapshotUri }}
        style={styles.snapshot}
        resizeMode="cover"
      />
      <View {...panResponder.panHandlers} style={styles.overlay}>
        <Svg viewBox={`0 0 ${width} ${height}`} style={styles.overlay}>
          {Array.isArray(paths) &&
            paths.map((path, index) => (
              <Path key={index} {...path} fill="none" />
            ))}
          {currentPath !== paths[paths.length - 1]?.d && (
            <Path
              d={currentPath}
              stroke={color}
              strokeWidth={lineWidth}
              fill="none"
            />
          )}
        </Svg>
      </View>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setColor("red")}>
          <FontAwesome name="circle" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setColor("blue")}>
          <FontAwesome name="circle" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setColor("green")}>
          <FontAwesome name="circle" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLineWidth((prev) => (prev < 10 ? prev + 1 : 1))}
        >
          <Text style={styles.toolbarText}>Width: {lineWidth}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPaths((prevPaths) => prevPaths.slice(0, -1))}
        >
          <FontAwesome name="undo" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  snapshot: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  toolbar: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 10,
  },
  toolbarText: {
    color: "white",
    fontSize: 18,
  },
});
