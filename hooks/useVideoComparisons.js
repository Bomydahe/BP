/*
  * Author: Rastislav Duránik (xduran03)
  * File: useStoredData.js
  * Brief:      
     This is a custom hook in JavaScript that uses AsyncStorage
     to manage video comparisons. It includes functions to load, 
     save, and delete video comparisons from AsyncStorage, as well 
     as a function to generate video thumbnails using the expo-video-thumbnails 
     module. The hook returns an object containing the videoComparisons state
     variable and functions to manage it, including setVideoComparisons, 
     loadVideoComparisons, saveVideoComparisons, generateThumbnail, and
     confirmDeleteVideo.
*/

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as VideoThumbnails from "expo-video-thumbnails";

export const useVideoComparisons = () => {
  const [videoComparisons, setVideoComparisons] = useState([]);

  useEffect(() => {
    (async () => {
      const loadedComparisons = await loadVideoComparisons();
      setVideoComparisons(loadedComparisons);
    })();
  }, []);

  const loadVideoComparisons = async () => {
    try {
      const jsonString = await AsyncStorage.getItem("@videoComparisons");
      if (jsonString !== null) {
        return JSON.parse(jsonString);
      } else {
        return []; // Return an empty array if there's no data
      }
    } catch (error) {
      console.error("Error loading video comparisons:", error);
      return [];
    }
  };

  const saveVideoComparisons = async (videoComparisons) => {
    try {
      const jsonString = JSON.stringify(videoComparisons);
      await AsyncStorage.setItem("@videoComparisons", jsonString);
    } catch (error) {
      console.error("Error saving video comparisons:", error);
    }
  };

  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
      });
      return uri;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  const confirmDeleteVideo = async (deletingVideoId) => {
    // Remove the comparison from the state
    setVideoComparisons((prevComparisons) =>
      prevComparisons.filter((comparison) => comparison.id !== deletingVideoId)
    );

    // Update the stored data
    const updatedComparisons = videoComparisons.filter(
      (comparison) => comparison.id !== deletingVideoId
    );
    await AsyncStorage.setItem(
      "@videoComparisons",
      JSON.stringify(updatedComparisons)
    );
  };

  return {
    videoComparisons,
    setVideoComparisons,
    loadVideoComparisons,
    saveVideoComparisons,
    generateThumbnail,
    confirmDeleteVideo,
  };
};
