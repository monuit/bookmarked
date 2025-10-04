import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Plus,
  Link,
  Share2,
  Camera,
  Clipboard as ClipboardIcon,
  Globe,
  Instagram,
  MessageSquare,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import { useTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import * as Clipboard from "expo-clipboard";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function AddBookmarkScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { auth } = useAuth();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTikTokInput, setShowTikTokInput] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleTikTokImport = async (urlToImport) => {
    const url = urlToImport || tiktokUrl;

    if (!url.trim() || !url.includes("tiktok.com")) {
      Alert.alert("Error", "Please enter a valid TikTok URL");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/tiktok/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiktokUrl: url.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import TikTok video");
      }

      Alert.alert(
        "Success",
        "TikTok video imported! It will be categorized by AI in 10-15 minutes.",
        [
          {
            text: "OK",
            onPress: () => {
              setTiktokUrl("");
              setShowTikTokInput(false);
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error importing TikTok:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to import TikTok video. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showTikTokDialog = () => {
    Alert.prompt(
      "Import from TikTok",
      "Paste the TikTok video URL you want to save:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: (inputUrl) => {
            if (inputUrl && inputUrl.trim()) {
              handleTikTokImport(inputUrl.trim());
            }
          },
        },
      ],
      "plain-text",
      "",
      "url",
    );
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (
        clipboardContent &&
        (clipboardContent.startsWith("http") ||
          clipboardContent.startsWith("https"))
      ) {
        setUrl(clipboardContent);
        // Try to extract title from URL
        if (!title) {
          const domain = new URL(clipboardContent).hostname;
          setTitle(domain.replace("www.", ""));
        }
      }
    } catch (error) {
      console.error("Error pasting from clipboard:", error);
    }
  };

  const handleAddBookmark = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert("Error", "Please enter both title and URL");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          description: description.trim() || null,
          sourcePlatform: "manual",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add bookmark");
      }

      Alert.alert(
        "Success",
        "Bookmark added! It will be categorized by AI in 10-15 minutes.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Error adding bookmark:", error);
      Alert.alert("Error", "Failed to add bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ icon, title, subtitle, onPress, color, gradient }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          style={{
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            {icon}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.white,
                marginBottom: 2,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.white,
                opacity: 0.8,
              }}
            >
              {subtitle}
            </Text>
          </View>
        </LinearGradient>
      ) : (
        <View
          style={{
            backgroundColor: colors.cardBackground,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${color}20`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            {icon}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.text,
                marginBottom: 2,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const openShareSheet = async () => {
    try {
      await Share.share({
        message:
          Platform.OS === "ios"
            ? "Share any URL to this app to automatically save it as a bookmark!"
            : "Share URLs to BookmarkAI to save them automatically",
        title: "Save to BookmarkAI",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.text,
              }}
            >
              Add Bookmark
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Import Options */}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginTop: 24,
              marginBottom: 16,
            }}
          >
            Quick Import
          </Text>

          <QuickAction
            icon={<Share2 size={24} color={colors.white} />}
            title="Import from TikTok"
            subtitle="Automatically extract your saved videos"
            gradient={["#FF0050", "#FF4081"]}
            onPress={showTikTokDialog}
          />

          <QuickAction
            icon={<Instagram size={20} color={colors.info} />}
            title="Share from Instagram"
            subtitle="Use the share button in Instagram"
            color={colors.info}
            onPress={openShareSheet}
          />

          <QuickAction
            icon={<MessageSquare size={20} color={colors.success} />}
            title="Share from WhatsApp"
            subtitle="Forward links directly to this app"
            color={colors.success}
            onPress={openShareSheet}
          />

          <QuickAction
            icon={<ClipboardIcon size={20} color={colors.warning} />}
            title="Paste from Clipboard"
            subtitle="Automatically detect URLs you've copied"
            color={colors.warning}
            onPress={pasteFromClipboard}
          />

          {/* Manual Entry */}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginTop: 32,
              marginBottom: 16,
            }}
          >
            Add Manually
          </Text>

          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Title Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter bookmark title..."
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            {/* URL Input */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  URL *
                </Text>
                <TouchableOpacity onPress={pasteFromClipboard}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.primary,
                    }}
                  >
                    Paste
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Globe size={16} color={colors.textTertiary} />
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    flex: 1,
                    fontFamily: "Inter_400Regular",
                    fontSize: 16,
                    color: colors.text,
                    marginLeft: 12,
                  }}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Description Input */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description or notes..."
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  height: 100,
                  textAlignVertical: "top",
                }}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Info Card */}
          <View
            style={{
              backgroundColor: colors.info + "10",
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
              borderWidth: 1,
              borderColor: colors.info + "30",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.info,
                marginBottom: 8,
              }}
            >
              ✨ AI-Powered Organization
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: colors.textSecondary,
                lineHeight: 18,
              }}
            >
              Your bookmark will be automatically categorized using AI within
              10-15 minutes. We'll also extract location data and suggest
              improvements to help you find it later.
            </Text>
          </View>
        </ScrollView>

        {/* Add Button */}
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleAddBookmark}
            disabled={isLoading || !title.trim() || !url.trim()}
            style={{
              backgroundColor:
                !title.trim() || !url.trim()
                  ? colors.textDisabled
                  : colors.primary,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Plus size={20} color={colors.white} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.white,
                marginLeft: 8,
              }}
            >
              {isLoading ? "Adding..." : "Add Bookmark"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
