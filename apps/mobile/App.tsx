import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/Toast';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      <RootNavigator />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
