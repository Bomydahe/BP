import { firebase } from "../firebaseConfig";
import * as VideoThumbnails from "expo-video-thumbnails";

export async function uploadThumbnail(localThumbnailUrl) {
  const response = await fetch(localThumbnailUrl);
  const blob = await response.blob();
  const thumbnailName =
    "thumbnails/" +
    localThumbnailUrl.substring(localThumbnailUrl.lastIndexOf("/") + 1);
  const storageRef = firebase.storage().ref().child(thumbnailName);

  await storageRef.put(blob);

  const downloadUrl = await storageRef.getDownloadURL();
  return downloadUrl;
}

/* metadata to save/upload along with videos */
export async function saveVideoMetadata(
  videoName,
  videoUrl,
  thumbnailUrl,
  booleanVar,
  userId
) {
  const videoRef = firebase.firestore().collection("videos").doc(videoName);
  await videoRef.set({
    id: generateUniqueId(),
    url: videoUrl,
    videoName: videoName,
    thumbnail: thumbnailUrl,
    booleanVar: booleanVar,
    userId: userId,
  });
}

export async function uploadVideo(videoUrl) {
  console.log("Uploading video with URL:", videoUrl);
  const localThumbnailUrl = await generateThumbnail(videoUrl);

  // Upload the thumbnail to Firebase Storage and get its download URL
  const thumbnailUrl = await uploadThumbnail(localThumbnailUrl);

  const response = await fetch(videoUrl);
  const blob = await response.blob();
  const videoName = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
  const storageRef = firebase.storage().ref().child(videoName).put(blob);

  try {
    await storageRef;
    console.log("Video uploaded successfully");

    // Get the user ID from Firebase Authentication
    const userId = firebase.auth().currentUser.uid;

    // Get the download URL
    const downloadUrl = await firebase
      .storage()
      .ref(videoName)
      .getDownloadURL();

    // Save video metadata to Firestore with an initial boolean value (e.g., true)
    await saveVideoMetadata(
      videoName,
      downloadUrl,
      thumbnailUrl,
      false,
      userId
    );

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading video:", error);
  }
}

export async function generateThumbnail(videoUri) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0,
    });
    return uri;
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export function generateUniqueId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  ).toUpperCase();
}
