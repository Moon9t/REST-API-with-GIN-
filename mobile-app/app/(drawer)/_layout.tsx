import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Placeholder for auth context - replace with actual auth context when implemented
const useAuth = () => ({
  user: { name: 'John Doe', email: 'john.doe@example.com', avatar: null },
  logout: () => console.log('Logout'),
});

const CustomDrawerContent = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  // Placeholder for theme toggle - replace with actual theme context when implemented
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateToSettings = () => {
    // Assuming settings screen exists or will be added
    navigation.navigate('settings' as never);
  };

  const navigateToProfile = () => {
    // Assuming profile screen exists or will be added
    navigation.navigate('profile' as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Image
          size={60}
          source={user.avatar ? { uri: user.avatar } : undefined}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {user.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Navigation Items */}
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.closeDrawer()}>
        <MaterialCommunityIcons
          name="home"
          size={24}
          color={theme.colors.onSurface}
        />
        <Text variant="bodyLarge" style={[styles.drawerItemText, { color: theme.colors.onSurface }]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.drawerItem} onPress={navigateToProfile}>
        <MaterialCommunityIcons
          name="account"
          size={24}
          color={theme.colors.onSurface}
        />
        <Text variant="bodyLarge" style={[styles.drawerItemText, { color: theme.colors.onSurface }]}>
          Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.drawerItem} onPress={navigateToSettings}>
        <MaterialCommunityIcons
          name="cog"
          size={24}
          color={theme.colors.onSurface}
        />
        <Text variant="bodyLarge" style={[styles.drawerItemText, { color: theme.colors.onSurface }]}>
          Settings
        </Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <View style={styles.themeToggle}>
        <MaterialCommunityIcons
          name="theme-light-dark"
          size={24}
          color={theme.colors.onSurface}
        />
        <Text variant="bodyLarge" style={[styles.drawerItemText, { color: theme.colors.onSurface }]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
          thumbColor={isDarkMode ? theme.colors.onPrimary : theme.colors.outline}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.colors.errorContainer }]} onPress={logout}>
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={theme.colors.onErrorContainer}
        />
        <Text variant="bodyLarge" style={[styles.logoutText, { color: theme.colors.onErrorContainer }]}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
      {/* Add additional drawer screens here as needed */}
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />
      <Drawer.Screen
        name="profile-drawer"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  drawerItemText: {
    marginLeft: 15,
    flex: 1,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 15,
    fontWeight: 'bold',
  },
});