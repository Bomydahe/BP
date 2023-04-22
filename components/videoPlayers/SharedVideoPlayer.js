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
import Svg, { Path } from "react-native-svg";
import { MaterialIcons, Feather } from "@expo/vector-icons";

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
  const [videoSnapshotUri, setVideoSnapshotUri] = useState(null);

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

  const PencilIcon = ({ position }) => (
    <View
      style={[
        styles.pencilIcon,
        {
          left: `${position}%`,
        },
      ]}
    >
      <Feather name="edit" size={12} color="white" />
    </View>
  );

  const scalePathData = (
    pathData,
    originalWidth,
    originalHeight,
    newWidth,
    newHeight
  ) => {
    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    return pathData.replace(
      /(\d+(\.\d+)?),(\d+(\.\d+)?)/g,
      (match, xWhole, xDecimal, yWhole, yDecimal) => {
        const x = parseFloat(xWhole + (xDecimal || ""));
        const y = parseFloat(yWhole + (yDecimal || ""));
        return `${x * scaleX},${y * scaleY}`;
      }
    );
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
            const sliderWidthPercentage = 0.6 * width;
            const sliderStartPercentage = (width - sliderWidthPercentage) / 2;
            const dotPosition =
              sliderStartPercentage +
              (overlay.time / lastPlaybackStatus.durationMillis) *
                sliderWidthPercentage -
              12;
            const dotPositionPercentage = (dotPosition / width) * 100;
            return (
              <PencilIcon
                key={index}
                position={dotPositionPercentage.toFixed(2)}
              />
            );
          })}
      </View>
      {lastPlaybackStatus &&
        comments.map((comment, index) => {
          const sliderWidthPercentage = 0.6 * width;
          const sliderStartPercentage = (width - sliderWidthPercentage) / 2;
          const messagePosition =
            sliderStartPercentage +
            (comment.time / lastPlaybackStatus.durationMillis) *
              sliderWidthPercentage -
            12;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.messageIconContainer, { left: messagePosition }]}
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
            <View style={styles.imageContainer}>
              <Image
                style={{ width: "100%", height: selectedMessage?.scaledHeight }}
                source={{ uri: videoSnapshotUri }}
                resizeMode="stretch"
              />
            </View>
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
              d={scalePathData(
                pathData.d,
                currentOverlay.originalWidth,
                currentOverlay.originalHeight,
                width,
                height
              )}
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
    marginLeft: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  messageModal: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    zIndex: 1000,
  },

  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-25%",
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
    top: 0,
    left: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
  },

  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flex: 1,
  },

  pencilIcon: {
    position: "absolute",
    bottom: 4,
    zIndex: 1,
  },
});
