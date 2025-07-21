// import React, { useState, useEffect } from 'react';
// import { StyleSheet, View, Dimensions, Text, PermissionsAndroid } from 'react-native';
// import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
// import * as Location from 'expo-location';

// export default function MapScreen() {
//   const [location, setLocation] = useState({latitude: 9.033140, longitude: 38.774844});
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         return;
//       }

//       try {
//         let location = await Location.getCurrentPositionAsync({});
//         setLocation(location);
//       } catch (error) {
//         setErrorMsg('Error getting location: ' + error.message);
//       }
//     })();
//   }, []);

//   if (errorMsg) {
//     return (
//       <View style={styles.container}>
//         <Text>{errorMsg}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//           latitudeDelta: 9.010615,
//           longitudeDelta: 38.774844,
//         }}
//         provider={PROVIDER_DEFAULT}
//         showsUserLocation={true}
//         showsMyLocationButton={true}
//         showMyLocationButtonStyle={{
//           position: 'absolute',
//           bottom: 60,
//           right: 60,
//         }}
//         showsCompass={true}
//         showsScale={true}
//         showsPointsOfInterest={true}
//         showsIndoors={true}
//         showsTraffic={true}
//         showsBuildings={true}
//       >
//         {location && (
//           <Marker
//             coordinate={{
//               latitude: location.latitude,
//               longitude: location.longitude,
//             }}
//             title="You are here"
//           />
//         )}
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//     gap: 20,
//   },
//   map: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height,
//   },
// });


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const MapScreen = () => {
  return (
    <View>
      <Text>MapScreen</Text>
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({})