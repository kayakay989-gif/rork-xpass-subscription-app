import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapViewComponentProps {
  gyms: any[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress: () => void;
}

export default function MapViewComponent({ gyms, initialRegion, onMarkerPress }: MapViewComponentProps) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {gyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{
              latitude: gym.latitude,
              longitude: gym.longitude,
            }}
            title={gym.name}
            description={gym.address}
            onCalloutPress={onMarkerPress}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
