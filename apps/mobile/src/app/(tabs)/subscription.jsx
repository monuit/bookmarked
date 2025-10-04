import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/utils/theme';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const buyOnIOS = async () => {
    Alert.alert('Coming soon', 'In-app purchases will be enabled once product IDs are configured.');
  };

  const buyOnWeb = async () => {
    try {
      const res = await fetch('/api/billing/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'subscription' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to init checkout');
      // Open in browser; Expo WebView or Linking can handle it
      if (typeof window !== 'undefined') {
        window.location.href = data.url;
      } else {
        Alert.alert('Checkout URL', data.url);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to start checkout');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: colors.text }}>Bookmarked Pro</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>
          Auto-renewing subscription. Cancel anytime. Refunds within 30 days if not used.
        </Text>

        <View style={{ marginTop: 24, gap: 12 }}>
          <TouchableOpacity onPress={buyOnIOS} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: colors.white, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Subscribe with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={buyOnWeb} style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }}>Checkout on Web (Stripe)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
