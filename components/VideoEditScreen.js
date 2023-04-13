import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Video } from "expo-av";
import { SketchCanvas } from "react-native-sketch-canvas";
import { firebase } from "../firebaseConfig";

export default function VideoEditScreen({ route }) {
  const { videoUri, videoName, drawings } = route.params;
  const [color, setColor] = useState("red");
  const [lineWidth, setLineWidth] = useState(5);
  const sketchCanvasRef = React.useRef(null);

  useEffect(() => {
    if (drawings && sketchCanvasRef.current) {
      drawings.forEach((path) => {
        sketchCanvasRef.current.addPath(path);
      });
    }
  }, [drawings]);

  const saveDrawing = async () => {
    try {
      const paths = sketchCanvasRef.current.getPaths();
      const firestore = firebase.firestore();
      const videoRef = firestore.collection("videos").doc(videoName);

      await videoRef.update({ drawings: paths });

      console.log(`Drawing data saved for video ${videoName}`);
    } catch (error) {
      console.error("Error saving drawing data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUri }}
        resizeMode="contain"
        style={styles.video}
      />
      <SketchCanvas
        ref={sketchCanvasRef}
        style={styles.canvas}
        strokeColor={color}
        strokeWidth={lineWidth}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={() => setColor("red")}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "blue" }]}
          onPress={() => setColor("blue")}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "green" }]}
          onPress={() => setColor("green")}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setLineWidth((prev) => (prev < 10 ? prev + 1 : 1))}
        >
          <Text style={styles.buttonText}>Width: {lineWidth}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setColor("transparent")}
        >
          <Text style={styles.buttonText}>Eraser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveDrawing}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "60%",
  },
  canvas: {
    position: "absolute",
    width: "100%",
    height: "60%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});
