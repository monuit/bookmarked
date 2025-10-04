import { Tabs } from "expo-router";
import { Home, Bookmark, Map, Star, User } from "lucide-react-native";
import { useTheme } from "@/utils/theme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.headerBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_400Regular",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => <Map color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "For You",
          tabBarIcon: ({ color, size }) => <Star color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add-bookmark"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="bookmark/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
