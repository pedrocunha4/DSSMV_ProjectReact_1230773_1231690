import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/store/store';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PlansScreen from './src/screens/PlansScreen';
import PlanCreateScreen from './src/screens/PlanCreateScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Plans"
              component={PlansScreen}
              options={{ title: 'Meus Planos' }}
            />
            <Stack.Screen
              name="PlanCreate"
              component={PlanCreateScreen}
              options={{ title: 'Novo Plano' }}
            />
            <Stack.Screen
              name="Exercises"
              component={ExercisesScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
