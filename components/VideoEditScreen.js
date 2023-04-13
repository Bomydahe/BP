import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function DrawingComponent() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [color, setColor] = useState("red");
  const [lineWidth, setLineWidth] = useState(5);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setCurrentPath("");
    },
    onPanResponderMove: (event, gestureState) => {
      const { dx, dy } = gestureState;
      const newPoint = `${dx},${dy}`;
      setCurrentPath((prevPath) =>
        prevPath ? `${prevPath} L${newPoint}` : `M${newPoint}`
      );
    },
    onPanResponderRelease: () => {
      setPaths((prevPaths) => [
        ...prevPaths,
        { d: currentPath, stroke: color, strokeWidth: lineWidth },
      ]);
    },
  });

  return (
    <View style={styles.container}>
      <Svg
        {...panResponder.panHandlers}
        style={{ flex: 1 }}
        viewBox="0 0 100 100"
      >
        {paths.map((path, index) => (
          <Path key={index} {...path} fill="none" />
        ))}
        <Path
          d={currentPath}
          stroke={color}
          strokeWidth={lineWidth}
          fill="none"
        />
      </Svg>
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
        {/* You can add a save button here, similar to the one in the provided code */}
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
