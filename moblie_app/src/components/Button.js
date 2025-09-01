import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  // Determine button styles based on variant
  const buttonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };
  
  // Determine text styles based on variant
  const textStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      case 'secondary':
      case 'primary':
      case 'danger':
        return styles.textPrimary;
      default:
        return styles.textPrimary;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle(),
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF4C29' : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, textStyle(), disabled && styles.textDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonPrimary: {
    backgroundColor: '#FF4C29',
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: '#2C394B',
    elevation: 2,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4C29',
  },
  buttonDanger: {
    backgroundColor: '#FF1E00',
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#FF4C29',
  },
  textDisabled: {
    color: '#888888',
  },
}); 