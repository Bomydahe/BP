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
  const [showSliderThumb, setShowSliderThumb] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const displayMessage = async (message) => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        setIsPlaying(false);
        await videoRef.current.pauseAsync();
      }
    }
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const hideMessageModal = () => {
    setShowMessageModal(false);
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
    showSliderThumbTemporarily();
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
      await videoRef.current.setPositionAsync(newPosition, {
        toleranceMillisBefore: 10,
        toleranceMillisAfter: 10,
      });
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
            size={70}
            color="white"
          />
        )}
      </TouchableOpacity>
      <View style={styles.sliderContainer}>
        <Text style={styles.timeText}>
          {lastPlaybackStatus && formatTime(lastPlaybackStatus.positionMillis)}
        </Text>
        <Slider
          style={styles.slider}
          value={sliderValue}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="white"
          maximumTrackTintColor="lightgrey"
          thumbTintColor={showSliderThumb ? "white" : "transparent"}
          onSlidingStart={() => setSliderThumbColor("white")}
          onValueChange={(value) => {
            handleSliderValueChange(value);
          }}
          onSlidingComplete={() => {
            setSliderThumbColor("transparent");
          }}
        />
        <Text style={styles.timeText}>
          {lastPlaybackStatus && formatTime(lastPlaybackStatus.durationMillis)}
        </Text>
      </View>
      {lastPlaybackStatus &&
        comments.map((comment, index) => {
          const messagePosition =
            (comment.time / lastPlaybackStatus.durationMillis) * 100;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.messageIconContainer,
                { left: `${messagePosition}%` },
              ]}
              onPress={() => displayMessage(comment)}
            >
              <MaterialIcons name="message" size={24} color="white" />
            </TouchableOpacity>
          );
        })}
      {showMessageModal && (
        <View style={styles.messageModal}>
          <Text style={styles.messageText}>{selectedMessage?.text}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideMessageModal}
          >
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      )}
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

  sliderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 14,
  },
  slider: {
    width: "70%",
    alignSelf: "center",
  },

  messageIconContainer: {
    position: "absolute",
    bottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  messageModal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  messageText: {
    color: "black",
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
});
