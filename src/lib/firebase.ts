import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 핫리로드 시 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// TODO(Phase 1): React Native 에서 로그인 상태 영속화를 위해
//   initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }) 로 교체.
//   (@react-native-async-storage/async-storage 설치 후)
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
