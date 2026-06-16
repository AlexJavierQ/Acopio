import React, { useEffect, useRef } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, StyleProp, UIManager, ViewStyle } from 'react-native';

// Habilita LayoutAnimation en Android (no-op en Fabric/New Arch, pero seguro).
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Transición suave para expandir/colapsar (desplegar pedidos, etc.). */
export function animateLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
}

/** Entrada suave: aparece y sube ligeramente al montar. */
export function FadeInView({
  children,
  delay = 0,
  offset = 10,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}

/** Latido sutil y constante (para iconos/insignias de alerta). */
export function Pulse({
  children,
  min = 0.5,
  duration = 1100,
  style,
}: {
  children: React.ReactNode;
  min?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: min, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[{ opacity: v }, style]}>{children}</Animated.View>;
}
