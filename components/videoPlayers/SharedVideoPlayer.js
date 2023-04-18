import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function SharedVideoPlayer({ route }) {
  const { videoUri, comments, overlays } = route.params;
  const [showControls, setShowControls] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lastPlaybackStatus, setLastPlaybackStatus] = useState(null);
  const [sliderThumbColor, setSliderThumbColor] = useState("transparent");
  const [showSliderThumb, setShowSliderThumb] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentOverlay, setCurrentOverlay] = useState(null);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoSnapshotUri, setVideoSnapshotUri] = useState(null); // Add this to your state variables

  const displayMessage = async (message) => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        setIsPlaying(false);
        await videoRef.current.pauseAsync();
      }
    }
    setVideoSnapshotUri(message.snapshot);

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

    // Update the current overlay based on video playback position
    const currentTime = status.positionMillis;
    const matchingOverlay = overlays.find(
      (overlay) =>
        currentTime >= overlay.time - 1000 && currentTime <= overlay.time + 1000
    );
    setCurrentOverlay(matchingOverlay);

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

  const RedDot = ({ position }) => (
    <View
      style={[
        styles.redDot,
        {
          left: `${position}%`,
        },
      ]}
    />
  );

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
        onReadyForDisplay={(event) => {
          setVideoWidth(event.naturalSize.width);
          setVideoHeight(event.naturalSize.height);
        }}
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
        {lastPlaybackStatus &&
          overlays.map((overlay, index) => {
            const dotPosition =
              (overlay.time / lastPlaybackStatus.durationMillis) * 100;
            return <RedDot key={index} position={dotPosition} />;
          })}
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
        <>
          <View style={styles.modalContainer}>
            <View style={styles.messageModal}>
              <Text style={styles.messageText}>{selectedMessage?.text}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideMessageModal}
              >
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
            <Image
              style={[styles.videoSnapshot]}
              source={{ uri: videoSnapshotUri }}
              resizeMode="contain"
            />
          </View>
        </>
      )}
      {currentOverlay && (
        <Svg
          style={styles.overlaySvg}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          pointerEvents="none"
        >
          {currentOverlay.overlayData.map((pathData, index) => (
            <Path
              key={index}
              d={pathData.d}
              stroke={pathData.stroke}
              strokeWidth={pathData.strokeWidth * 4}
              fill="none"
            />
          ))}
        </Svg>
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
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  messageModal: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
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
    top: 5,
    right: 10,
  },

  overlaySvg: {
    position: "absolute",
    top: -15,
    left: -5,

    zIndex: 2,
    width: "100%",
    height: "100%",
  },
  videoSnapshot: {
    flex: 1,
    width: "100%",
  },

  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },

  redDot: {
    position: "absolute",
    bottom: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(175, 0, 0, 1)",
    zIndex: 1,
  },
});
