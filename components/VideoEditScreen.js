import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BackHandler } from "react-native";
import * as FileSystem from "expo-file-system";

export default function DrawingComponent({ route }) {
  const { videoUri, videoName, position, snapshotUri } = route.params;
  console.log(
    "videoName: ",
    videoName,
    "position: ",
    position,
    "snapshot: ",
    snapshotUri
  );

  useEffect(() => {
    const backAction = async () => {
      if (snapshotUri) {
        try {
          await FileSystem.deleteAsync(snapshotUri, { idempotent: true });
          console.log("Temporary snapshot file deleted:", snapshotUri);
        } catch (error) {
          console.error("Error deleting temporary snapshot file:", error);
        }
      }
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text>HIHI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
