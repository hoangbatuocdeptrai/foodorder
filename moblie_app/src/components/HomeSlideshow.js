import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

const { width } = Dimensions.get('window');

// Sample banner images - replace with your actual banner images
const bannerImages = [
  { 
    id: 1, 
    image: 'https://images.unsplash.com/photo-1600950207944-0d63e8edbc3f?q=80&w=800', 
    title: 'Summer Collection',
    action: 'Shop Now' 
  },
  { 
    id: 2, 
    image: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?q=80&w=800', 
    title: 'New Arrivals',
    action: 'Explore' 
  },
  { 
    id: 3, 
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=800', 
    title: 'Special Offer',
    action: 'Get 50% Off' 
  },
];

export default function HomeSlideshow({ onBannerPress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Auto-scroll slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeIndex === bannerImages.length - 1) {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        setActiveIndex(0);
      } else {
        scrollViewRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
        setActiveIndex(activeIndex + 1);
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [activeIndex]);
  
  // Handle scroll event
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveIndex(currentIndex);
  };
  
  // Handle banner press
  const handleBannerPress = (banner) => {
    if (onBannerPress) {
      onBannerPress(banner);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {bannerImages.map((banner) => (
          <TouchableOpacity 
            key={banner.id} 
            style={styles.bannerContainer}
            onPress={() => handleBannerPress(banner)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: banner.image }}
              style={styles.banner}
              resizeMode="cover"
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>{banner.action}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.pagination}>
        {bannerImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 16,
  },
  bannerContainer: {
    width,
    height: 200,
    position: 'relative',
  },
  banner: {
    width,
    height: 200,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF4C29',
  },
});