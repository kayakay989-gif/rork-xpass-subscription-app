import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

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

export default function MapViewComponent({ gyms }: MapViewComponentProps) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.webMapText}>Map view available on mobile</Text>
        <Text style={styles.webMapSubtext}>{gyms.length} gyms found</Text>
      </View>
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
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  webMapSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
