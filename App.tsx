import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import TimerRing from './src/components/TimerRing';

// Le decimos al sistema que muestre y suene la alerta incluso si tienes la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Reemplaza a shouldShowAlert
    shouldShowList: true,   // Lo manda al centro de notificaciones
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isDark, setIsDark] = useState(true);
  
  const activeTheme = {
    bg: isDark ? '#09090B' : '#FFFFFF',
    icon: isDark ? '#FAFAFA' : '#09090B',
    buttonAccent: isDark ? '#38BDF8' : '#0284C7',
    buttonIcon: isDark ? '#09090B' : '#FFFFFF',
  };
  
  const maxSeconds = 90 * 60;
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds);
  const [isActive, setIsActive] = useState(false);
  
  // Guardamos el ID de la notificación para poder cancelarla si es necesario
  const [notificationId, setNotificationId] = useState<string | null>(null);

  // Pedimos permisos la primera vez que carga la app
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Bro, necesitamos permisos de notificación para poder despertarte.');
      }
    })();
  }, []);

  // Lógica visual del temporizador
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      setNotificationId(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // Función maestra para controlar el inicio y cancelación
  const toggleTimer = async () => {
    if (isActive) {
      // CANCELAR: Frenamos el reloj visual y cancelamos la alarma nativa
      setIsActive(false);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        setNotificationId(null);
      }
    } else {
      // INICIAR: Arrancamos el reloj visual y programamos la alarma nativa
      if (secondsLeft <= 0) return;
      setIsActive(true);
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Despierta, bro! ⏰",
          body: "Tu siestita ha terminado. Es hora de darle con todo.",
          sound: true, // Usará el sonido de alarma por defecto del celular
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsLeft,
        },
      });
      setNotificationId(id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <TouchableOpacity 
        style={styles.themeToggle} 
        onPress={() => setIsDark(!isDark)}
      >
        <MaterialCommunityIcons 
          name={isDark ? "weather-sunny" : "weather-night"} 
          size={28} 
          color={activeTheme.icon} 
        />
      </TouchableOpacity>

      <TimerRing 
        secondsLeft={secondsLeft} 
        setSecondsLeft={setSecondsLeft} 
        isActive={isActive} 
        maxSeconds={maxSeconds} 
        isDark={isDark} 
      />
      
      <TouchableOpacity 
        style={[styles.playButton, { backgroundColor: activeTheme.buttonAccent }]} 
        onPress={toggleTimer} 
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name={isActive ? "close" : "bed"} 
          size={40} 
          color={activeTheme.buttonIcon} 
        />
      </TouchableOpacity>
      
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  playButton: {
    marginTop: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  }
});