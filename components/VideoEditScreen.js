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

const { width, height } = Dimensions.get("window");

export default function DrawingComponent({ route, navigation }) {
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
    },
    onPanResponderRelease: () => {
      setPaths((prevPaths) => [
        ...prevPaths,
        { d: currentPath, stroke: color, strokeWidth: lineWidth },
      ]);
      setCurrentPath("");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 35 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: snapshotUri }}
        style={styles.snapshot}
        resizeMode="cover"
      />
      <Svg
        {...panResponder.panHandlers}
        style={styles.overlay}
        viewBox={`0 0 ${width} ${height}`}
      >
        {paths.map((path, index) => (
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
