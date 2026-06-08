import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import BillListScreen from '../screens/BillListScreen';
import BillFormScreen from '../screens/BillFormScreen';
import AiInputScreen from '../screens/AiInputScreen';
import StatsScreen from '../screens/StatsScreen';
import AiReportScreen from '../screens/AiReportScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function BillStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillList" component={BillListScreen} />
      <Stack.Screen name="BillForm" component={BillFormScreen} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsMain" component={StatsScreen} />
      <Stack.Screen name="AiReport" component={AiReportScreen} />
    </Stack.Navigator>
  );
}

export type MainTabParamList = {
  BillTab: undefined;
  AiInput: undefined;
  StatsTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list';
          if (route.name === 'BillTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'AiInput') iconName = focused ? 'sparkles' : 'sparkles-outline';
          else if (route.name === 'StatsTab') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      })}
    >
      <Tab.Screen name="BillTab" component={BillStack} options={{ title: '账单' }} />
      <Tab.Screen name="AiInput" component={AiInputScreen} options={{ title: 'AI记账' }} />
      <Tab.Screen name="StatsTab" component={StatsStack} options={{ title: '统计' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
    </Tab.Navigator>
  );
}
