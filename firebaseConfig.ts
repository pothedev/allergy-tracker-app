import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyB43dKNOho_7c-fZqRKU5EARN_f3ucAe1A",
  authDomain: "allergytracker-31c28.firebaseapp.com",
  projectId: "allergytracker-31c28",
  storageBucket: "allergytracker-31c28.appspot.com", // ✅ corrected
  messagingSenderId: "188442718977",
  appId: "1:188442718977:web:830fa05737d566686ce100",
  measurementId: "G-J945D072JW"
};

const app = initializeApp(firebaseConfig);

// ✅ Set up persistent auth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager() // Optional for web apps only
  })
});

export { auth, db };
