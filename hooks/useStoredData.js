import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useStoredData = (key, initialValue) => {
  const [data, setData] = useState(initialValue);

  /* Fetching & storing data(categories, videos) */
  useEffect(() => {
    //clearData();
    loadData();
  }, []);

  useEffect(() => {
    storeData(data);
  }, [data]);

  // Clears asynch storage of device
  /* clear asyncstorage data
  const clearData = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  }; */

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const storeData = async (dataToStore) => {
    try {
      const dataString = JSON.stringify(dataToStore);
      await AsyncStorage.setItem(key, dataString);
    } catch (error) {
      console.log(error);
    }
  };

  return [data, setData];
};

export default useStoredData;
