import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import PropertiesScreen from './src/screens/PropertiesScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import GuidesScreen from './src/screens/GuidesScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider } from './src/lib/auth';
import { theme } from './src/lib/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Accueil:    'home-outline',
            Biens:      'business-outline',
            Guides:     'book-outline',
            Communauté: 'people-outline',
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Biens" component={PropertiesScreen} />
      <Tab.Screen name="Guides" component={GuidesScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen
              name="PropertyDetail"
              component={PropertyDetailScreen}
              options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: '#fff' }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
