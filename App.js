import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Sender from "./src/Sender";
import Receiver from "./src/Receiver";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Sender" component={Sender} />
        <Stack.Screen name="Receiver" component={Receiver} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
