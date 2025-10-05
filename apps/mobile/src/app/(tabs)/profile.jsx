import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/utils/theme';
import { useAuth } from '@/utils/auth/useAuth';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { auth, isReady } = useAuth();

  const connectTikTok = async () => {
    try {
      const base = process.env.EXPO_PUBLIC_BASE_URL;
      if (!base) throw new Error('Base URL not configured');
      // Ask server for TikTok authorize URL; include appRedirect for native close
      const res = await fetch(`${base}/api/tiktok/auth/start?appRedirect=bookmarked://oauth-close`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to init TikTok auth');
      const url = data.authorizeUrl;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Open this URL to connect TikTok', url);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to open TikTok connect');
    }
  };

  const connectInstagram = async () => {
    try {
      const base = process.env.EXPO_PUBLIC_BASE_URL;
      if (!base) throw new Error('Base URL not configured');
      const res = await fetch(`${base}/api/instagram/auth/start?appRedirect=bookmarked://oauth-close`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to init Instagram auth');
      const url = data.authorizeUrl;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Open this URL to connect Instagram', url);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to open Instagram connect');
    }
  };

  const manageSubscription = async () => {
    Alert.alert('Manage Subscription', 'Use the Subscription tab to subscribe or manage your plan.');
  };

  const openTutorial = async () => {
    try {
      const base = process.env.EXPO_PUBLIC_BASE_URL;
      if (!base) throw new Error('Base URL not configured');
      const url = `${base}/tutorial`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Open Tutorial', url);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to open tutorial');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: colors.text }}>Account</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>
          {auth?.user?.email || 'Signed in'}
        </Text>

        <View style={{ marginTop: 24, gap: 12 }}>
          <TouchableOpacity onPress={connectTikTok} style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Connect TikTok</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={connectInstagram} style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Connect Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={manageSubscription} style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Manage Subscription</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openTutorial} style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Open Tutorial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
