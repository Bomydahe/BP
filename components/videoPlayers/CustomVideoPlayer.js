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
  secondaryVideoPlayerRef,
  hideControls,
  hidePlayPause,
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
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    // Sync secondary video player when primary video player state changes
    if (secondaryVideoPlayerRef && secondaryVideoPlayerRef.current) {
      if (isPlaying) {
        secondaryVideoPlayerRef.current.playAsync();
      } else {
        secondaryVideoPlayerRef.current.pauseAsync();
      }
      secondaryVideoPlayerRef.current.setRateAsync(playbackRate, true);
    }
  }, [isPlaying, playbackRate]);

  const handlePlaybackRateChange = async (newRate) => {
    setPlaybackRate(newRate);
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.setRateAsync(newRate, true);
    }

    if (secondaryVideoPlayerRef && secondaryVideoPlayerRef.current) {
      await secondaryVideoPlayerRef.current.setRateAsync(newRate, true);
    }
  };

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
    }, 2000);
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
    }, 5000);
  };

  const handleSliderValueChange = async (value) => {
    if (videoPlayerRef.current && lastPlaybackStatus) {
      setSliderValue(value);
      const newPosition = value * lastPlaybackStatus.durationMillis;
      await videoPlayerRef.current.setPositionAsync(newPosition, {
        toleranceMillisBefore: 10,
        toleranceMillisAfter: 10,
      });

      // Sync secondary video player
      if (secondaryVideoPlayerRef && secondaryVideoPlayerRef.current) {
        await secondaryVideoPlayerRef.current.setPositionAsync(newPosition, {
          toleranceMillisBefore: 10,
          toleranceMillisAfter: 10,
        });
      }
    }
  };

  const changeVideoPosition = async (delta) => {
    if (videoPlayerRef.current && lastPlaybackStatus) {
      const newPosition = lastPlaybackStatus.positionMillis + delta;
      await videoPlayerRef.current.setPositionAsync(newPosition, {
        toleranceMillisBefore: 10,
        toleranceMillisAfter: 10,
      });

      // Sync secondary video player
      if (secondaryVideoPlayerRef && secondaryVideoPlayerRef.current) {
        await secondaryVideoPlayerRef.current.setPositionAsync(newPosition, {
          toleranceMillisBefore: 10,
          toleranceMillisAfter: 10,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoPlayerRef}
        source={{ uri: videoUri }}
        rate={playbackRate}
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
        onPress={hidePlayPause ? null : togglePlayback}
        activeOpacity={1}
      >
        {!hidePlayPause && showControls && (
          <MaterialIcons
            name={isPlaying ? "play-circle-outline" : "pause-circle-outline"}
            size={60}
            color="white"
          />
        )}
      </TouchableOpacity>
      {!hideControls && showControls && (
        <>
          <View style={styles.sliderContainer}>
            <Text style={styles.time}>
              {formatTime(
                sliderValue * lastPlaybackStatus?.durationMillis || 0
              )}
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
          <View style={styles.controlButtonsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeVideoPosition(-10000)}
            >
              <MaterialIcons name="replay-10" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { borderWidth: 1, borderColor: "white" },
              ]}
              onPress={() => {
                const newRate = playbackRate === 2 ? 0.25 : playbackRate * 2;
                handlePlaybackRateChange(newRate);
              }}
            >
              <Text style={styles.controlButtonText}>{`${playbackRate}x`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeVideoPosition(10000)}
            >
              <MaterialIcons name="forward-10" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
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
    bottom: 60,
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
  controlButtonsContainer: {
    position: "absolute",
    left: 50,
    right: 50,
    bottom: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  controlButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonText: {
    color: "white",
    fontSize: 16,
  },
});
