import { Pressable, Text, View } from 'react-native';

import { navItems, screens } from '../data/screens';
import { styles } from '../styles/biosStyles';

export function BiosShell({
  activeScreen,
  children,
  isAuthenticated,
  onNavigate,
}) {
  const activeTitle = isAuthenticated ? screens[activeScreen].title : 'Login';

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>BALLCDX SETUP UTILITY</Text>
        <Text style={styles.headerMeta}>ACTIVE: {activeTitle.toUpperCase()}</Text>
      </View>

      <View style={styles.frame}>
        {isAuthenticated && (
          <View style={styles.menuBar}>
            {navItems.map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => onNavigate(key)}
                style={[
                  styles.menuButton,
                  activeScreen === key && styles.menuButtonActive,
                ]}>
                <Text
                  style={[
                    styles.menuText,
                    activeScreen === key && styles.menuTextActive,
                  ]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {children}
      </View>

      <View style={styles.bottomBar}>
        {isAuthenticated ? (
          <>
            <Pressable
              style={[
                styles.footerButton,
                activeScreen === 'settings' && styles.footerButtonActive,
              ]}
              onPress={() => onNavigate('settings')}>
              <Text
                style={[
                  styles.footerButtonText,
                  activeScreen === 'settings' && styles.footerButtonTextActive,
                ]}>
                SETTINGS
              </Text>
            </Pressable>

            <Text style={styles.bottomText}>SESSION: GLI</Text>
          </>
        ) : (
          <Text style={styles.bottomText}>AUTH REQUIRED</Text>
        )}
      </View>
    </View>
  );
}
