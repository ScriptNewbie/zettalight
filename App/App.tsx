import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Platform, StatusBar } from "react-native";

import Button from "./src/components/basic/Button";
import ColorMode from "./src/contexts/colorMode";
import colors, { ColorMode as AllowedColorMode } from "./src/config/colors";
import Main from "./src/components/screens/Main";
import LiveDataScreen from "./src/components/screens/LiveDataScreen";
import { QueryClient, QueryClientProvider } from "react-query";
import Settings from "./src/components/screens/Settings";
import Charts from "./src/components/screens/Charts/Charts";

export type RoutesProps = {
  Main: undefined;
  LiveData: undefined;
  Settings: undefined;
  Charts: undefined;
};

const Stack = createStackNavigator<RoutesProps>();
const queryClient = new QueryClient();

export default function App() {
  const colorMode: AllowedColorMode = "light";
  const StackNavigator = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        options={{ headerShown: false, title: "Ekran główny" }}
        component={Main}
      />
      <Stack.Screen
        name="LiveData"
        options={{ title: "Szczegóły" }}
        component={LiveDataScreen}
      />
      <Stack.Screen
        name="Settings"
        options={{ title: "Ustawienia" }}
        component={Settings}
      />
      <Stack.Screen
        name="Charts"
        options={{ title: "Wykresy" }}
        component={Charts}
      />
    </Stack.Navigator>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" translucent />
      <ColorMode.Provider value={colorMode}>
        <NavigationContainer>
          <QueryClientProvider client={queryClient}>
            <StackNavigator />
          </QueryClientProvider>
        </NavigationContainer>
      </ColorMode.Provider>
    </>
  );
}
