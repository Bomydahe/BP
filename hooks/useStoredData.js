/*
  * Author: Rastislav Duránik (xduran03)
  * File: useStoredData.js
  * Brief:      
     This is a custom hook in JavaScript that uses 
     AsyncStorage to fetch and store data in a device's
     storage with a specific key and initial value. 
     The hook includes two useEffect hooks to retrieve 
     and store the data, a loadData function to retrieve 
     the data, and a storeData function to store the data.
     It returns an array with the current data state variable
     and the setData function used to update the data.
*/


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
