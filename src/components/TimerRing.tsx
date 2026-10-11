import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const size = width * 0.8;
const strokeWidth = 15;
const radius = (size - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;
const trackLength = circumference * 0.75;
const gapLength = circumference * 0.25;

interface Props {
  secondsLeft: number;
  setSecondsLeft: (secs: number) => void;
  isActive: boolean;
  maxSeconds: number;
  isDark: boolean;
}

export default function TimerRing({ secondsLeft, setSecondsLeft, isActive, maxSeconds, isDark }: Props) {
  // Paleta moderna sincronizada con App.tsx
  const theme = {
    track: isDark ? '#27272A' : '#E4E4E7', // Gris zinc oscuro vs Gris zinc claro
    progress: isDark ? '#38BDF8' : '#0284C7', // Azul cielo vibrante
    text: isDark ? '#FAFAFA' : '#09090B', // Texto súper contrastante
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isActive,
      onMoveShouldSetPanResponder: () => !isActive,
      onPanResponderMove: (evt) => {
        if (isActive) return;
        const { locationX, locationY } = evt.nativeEvent;
        const dx = locationX - size / 2;
        const dy = locationY - size / 2;
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        
        let shiftedAngle = angle - 135;
        if (shiftedAngle < 0) shiftedAngle += 360;
        
        if (shiftedAngle > 270) shiftedAngle = shiftedAngle > 315 ? 0 : 270;
        
        const newProgress = shiftedAngle / 270;
        const newMinutes = Math.round(newProgress * (maxSeconds / 60));
        setSecondsLeft(newMinutes * 60);
      }
    })
  ).current;

  const progress = secondsLeft / maxSeconds;
  const progressLength = progress * trackLength;
  const angleDeg = 135 + (progress * 270);
  const angleRad = angleDeg * (Math.PI / 180);
  const cx = size / 2;
  const cy = size / 2;
  
  const knobX = cx + radius * Math.cos(angleRad);
  const knobY = cy + radius * Math.sin(angleRad);

  const formatTime = () => {
    if (!isActive) return Math.round(secondsLeft / 60).toString();
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers} style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle stroke={theme.track} fill="none" cx={cx} cy={cy} r={radius} strokeWidth={strokeWidth} strokeDasharray={`${trackLength} ${gapLength}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
          <Circle stroke={theme.progress} fill="none" cx={cx} cy={cy} r={radius} strokeWidth={strokeWidth} strokeDasharray={`${progressLength} ${circumference}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
          <Circle cx={knobX} cy={knobY} r={strokeWidth * 1.1} fill={theme.progress} />
        </Svg>
      </View>
      
      <View style={styles.textContainer} pointerEvents="none">
        <Text style={[styles.timeText, { color: theme.text }, isActive && { fontSize: 48 }]}>
          {formatTime()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  textContainer: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  timeText: { fontSize: 64, fontWeight: '200' }, // Fuente más ligera para el look moderno
});