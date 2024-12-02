import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Sender from "./src/Sender";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'BarCodeScanner has been deprecated', // The warning message to suppress
  'No height found',
]);
const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar hidden={true} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="Sender" 
              component={Sender} 
              options={{ headerShown: false }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </>
  );
}
