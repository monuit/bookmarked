import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Plus,
  Clock,
  BarChart3,
  MapPin,
  Bookmark,
  Bell,
  Settings,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useRef, useCallback } from "react";
import { router } from "expo-router";
import { useTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();
  const { isReady, auth, signIn } = useAuth();
  const { data: user } = useUser();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    processingQueue: 0,
    categorizedThisWeek: 0,
    topCategory: null,
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch latest stats
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ 
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: colors.textSecondary 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!auth) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        paddingTop: insets.top,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
      }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <Bookmark size={40} color={colors.white} />
        </LinearGradient>

        <Text style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 24,
          color: colors.text,
          textAlign: 'center',
          marginBottom: 8
        }}>
          Welcome to BookmarkAI
        </Text>

        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24
        }}>
          Organize and discover your bookmarks with AI-powered categorization
        </Text>

        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: colors.white
          }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const StatsCard = ({ icon, title, value, subtitle, color }) => (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      flex: 1,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${color}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
      }}>
        {icon}
      </View>
      
      <Text style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 24,
        color: colors.text,
        marginBottom: 4
      }}>
        {value}
      </Text>
      
      <Text style={{
        fontFamily: "Inter_400Regular",
        fontSize: 12,
        color: colors.textTertiary,
        marginBottom: 2
      }}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 11,
          color: colors.textSecondary
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const QuickAction = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${color}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        {icon}
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: "Inter_500Medium",
          fontSize: 15,
          color: colors.text,
          marginBottom: 2
        }}>
          {title}
        </Text>
        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          color: colors.textSecondary
        }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: colors.background
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <View>
            <Text style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </Text>
            <Text style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 24,
              color: colors.text,
              marginTop: 2
            }}>
              {user?.name || user?.email?.split('@')[0] || 'Welcome'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 12, padding: 8 }}>
              <Bell size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={{ padding: 8 }}
            >
              <Settings size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Bookmark Button */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/add-bookmark')}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Plus size={24} color={colors.white} />
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: colors.white,
            marginLeft: 8
          }}>
            Add Bookmark
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          marginBottom: 24,
          gap: 12
        }}>
          <StatsCard
            icon={<Bookmark size={20} color={colors.primary} />}
            title="Total Bookmarks"
            value={stats.totalBookmarks.toString()}
            color={colors.primary}
          />
          <StatsCard
            icon={<Clock size={20} color={colors.warning} />}
            title="Processing"
            value={stats.processingQueue.toString()}
            subtitle="~10-15 min"
            color={colors.warning}
          />
        </View>

        {/* Quick Actions */}
        <Text style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
          color: colors.text,
          marginBottom: 16
        }}>
          Quick Actions
        </Text>

        <QuickAction
          icon={<MapPin size={20} color={colors.info} />}
          title="Explore Map"
          subtitle="View your location-based bookmarks"
          onPress={() => router.push('/(tabs)/map')}
          color={colors.info}
        />

        <QuickAction
          icon={<BarChart3 size={20} color={colors.success} />}
          title="Browse Categories"
          subtitle="See your organized bookmarks"
          onPress={() => router.push('/(tabs)/bookmarks')}
          color={colors.success}
        />

        <QuickAction
          icon={<Clock size={20} color={colors.warning} />}
          title="Processing Queue"
          subtitle={`${stats.processingQueue} items being categorized`}
          onPress={() => router.push('/(tabs)/bookmarks')}
          color={colors.warning}
        />

        {/* Recent Activity */}
        <Text style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
          color: colors.text,
          marginTop: 8,
          marginBottom: 16
        }}>
          Recent Activity
        </Text>

        <View style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Bookmark size={32} color={colors.textTertiary} />
          <Text style={{
            fontFamily: "Inter_500Medium",
            fontSize: 16,
            color: colors.text,
            marginTop: 12,
            marginBottom: 4
          }}>
            No bookmarks yet
          </Text>
          <Text style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center'
          }}>
            Start by adding your first bookmark or importing from TikTok
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}