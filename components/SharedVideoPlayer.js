import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";

export default function SharedVideoPlayer({ route }) {
  const { videoUri, comments } = route.params;
  const [playbackStatus, setPlaybackStatus] = useState(Video.RESUME_PLAYBACK);
  const [showControls, setShowControls] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lastPlaybackStatus, setLastPlaybackStatus] = useState(null);
  const [sliderThumbColor, setSliderThumbColor] = useState("transparent");

  const handlePlaybackStatus = (status) => {
    if (status.isPlaying) {
      setSliderValue(status.positionMillis / status.durationMillis);
    }
    setLastPlaybackStatus(status);
  };

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };

    lockOrientation();

    return () => {
      const resetOrientation = async () => {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        );
      };

      resetOrientation();
    };
  }, []);

  const videoRef = React.useRef(null);

  const togglePlayback = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        setIsPlaying(false); // Update the isPlaying state
        await videoRef.current.pauseAsync();
      } else {
        setIsPlaying(true); // Update the isPlaying state
        await videoRef.current.playAsync();
      }
    }

    setShowControls(true);
    setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  const handleSliderValueChange = async (value) => {
    if (videoRef.current && lastPlaybackStatus) {
      const newPosition = value * lastPlaybackStatus.durationMillis;
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        style={styles.video}
        onPlaybackStatusUpdate={(status) => handlePlaybackStatus(status)}
      />

      <TouchableOpacity
        style={styles.videoOverlay}
        onPress={togglePlayback}
        activeOpacity={1}
      >
        {showControls && (
          <MaterialIcons
            name={isPlaying ? "play-circle-outline" : "pause-circle-outline"}
            size={50}
            color="white"
          />
        )}
      </TouchableOpacity>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={sliderValue}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="white"
          thumbTintColor={sliderThumbColor}
          onSlidingStart={() => setSliderThumbColor("white")}
          onSlidingComplete={(value) => {
            setSliderThumbColor("transparent");
            handleSliderValueChange(value);
          }}
        />
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
  },
  slider: {
    width: "90%",
    alignSelf: "center",
  },
});
