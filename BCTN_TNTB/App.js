import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import RootComponent from './routers/index'
import firestore from '@react-native-firebase/firestore';
import Setting from './views/Admin/Settings'
const App = () => {

  return (
    <RootComponent />
  );
};

export default App;
 