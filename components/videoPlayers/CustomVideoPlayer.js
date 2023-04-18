import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

export default function CustomVideoPlayer({
  videoUri,
  onPlaybackStatusUpdate,
  videoPlayerRef,
  onScaledVideoSizeChange,
}) {
  const [showControls, setShowControls] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lastPlaybackStatus, setLastPlaybackStatus] = useState(null);
  const [sliderThumbColor, setSliderThumbColor] = useState("transparent");
  const [showSliderThumb, setShowSliderThumb] = useState(false);
  const [scaledVideoSize, setScaledVideoSize] = useState({
    width: 0,
    height: 0,
  });

  const handleVideoReadyForDisplay = (event) => {
    const { naturalSize } = event;
    const { width, height } = Dimensions.get("window");
    let ratio = Math.min(
      width / naturalSize.width,
      height / naturalSize.height
    );

    const scaledWidth = naturalSize.width * ratio;
    const scaledHeight = naturalSize.height * ratio;

    setScaledVideoSize({ width: scaledWidth, height: scaledHeight });
    console.log(`Scaled video width: ${scaledWidth}, height: ${scaledHeight}`);

    if (typeof onScaledVideoSizeChange === "function") {
      onScaledVideoSizeChange({ width: scaledWidth, height: scaledHeight });
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const showSliderThumbTemporarily = () => {
    setShowSliderThumb(true);
    setTimeout(() => {
      setShowSliderThumb(false);
    }, 1000);
  };

  const handlePlaybackStatus = (status) => {
    if (status.isPlaying) {
      setSliderValue(status.positionMillis / status.durationMillis);
    }
    setLastPlaybackStatus(status);

    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status);
    }
  };

  const togglePlayback = async () => {
    showSliderThumbTemporarily();
    if (videoPlayerRef.current) {
      const status = await videoPlayerRef.current.getStatusAsync();
      if (status.isPlaying) {
        setIsPlaying(false);
        await videoPlayerRef.current.pauseAsync();
      } else {
        setIsPlaying(true);
        await videoPlayerRef.current.playAsync();
      }
    }

    setShowControls(true);
    setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  const handleSliderValueChange = async (value) => {
    if (videoPlayerRef.current && lastPlaybackStatus) {
      const newPosition = value * lastPlaybackStatus.durationMillis;
      await videoPlayerRef.current.setPositionAsync(newPosition, {
        toleranceMillisBefore: 10,
        toleranceMillisAfter: 10,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoPlayerRef}
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        style={styles.video}
        onPlaybackStatusUpdate={(status) => handlePlaybackStatus(status)}
        onReadyForDisplay={(event) => handleVideoReadyForDisplay(event)}
      />

      <TouchableOpacity
        style={styles.videoOverlay}
        onPress={togglePlayback}
        activeOpacity={1}
      >
        {showControls && (
          <MaterialIcons
            name={isPlaying ? "play-circle-outline" : "pause-circle-outline"}
            size={60}
            color="white"
          />
        )}
      </TouchableOpacity>
      <View style={styles.sliderContainer}>
        <Text style={styles.time}>
          {formatTime(sliderValue * lastPlaybackStatus?.durationMillis || 0)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          minimumTrackTintColor="white"
          maximumTrackTintColor="lightgrey"
          thumbTintColor={showSliderThumb ? "#FFFFFF" : "transparent"}
          onResponderGrant={() => setSliderThumbColor("#FFFFFF")}
          onResponderRelease={() => setSliderThumbColor("transparent")}
        />
        <Text style={styles.time}>
          {formatTime(lastPlaybackStatus?.durationMillis || 0)}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    width: "70%",
    alignSelf: "center",
  },
  time: {
    color: "white",
    fontSize: 14,
  },
});
