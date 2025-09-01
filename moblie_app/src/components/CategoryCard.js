import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../api/config';

const { width } = Dimensions.get('window');
const cardSize = width / 3 - 16; // Three cards per row with margins

export default function CategoryCard({ category }) {
  const navigation = useNavigation();
  
  // Handle card press
  const handlePress = () => {
    navigation.navigate('CategoryProducts', { 
      categoryId: category.id,
      categoryName: category.name 
    });
  };
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: getImageUrl(category.image_url) || 'https://via.placeholder.com/100' }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardSize,
    height: cardSize + 30,
    alignItems: 'center',
    margin: 4,
  },
  image: {
    width: cardSize,
    height: cardSize,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  name: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 