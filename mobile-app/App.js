import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import {colors} from './src/styles/theme';

const Stack = createStackNavigator();

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: '당뇨 케어'}}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{title: '음식 촬영'}}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{title: '분석 결과'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;
