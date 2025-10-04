import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Clock,
  MapPin,
  ExternalLink,
  MoreVertical,
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

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();
  const { auth } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Sample data - will be replaced with real API calls
  const [categories] = useState([
    { id: "all", name: "All", count: 0, color: "#6B46C1" },
    { id: 1, name: "Food & Recipes", count: 0, color: "#F59E0B" },
    { id: 2, name: "Travel & Places", count: 0, color: "#10B981" },
    { id: 3, name: "Shopping", count: 0, color: "#8B5CF6" },
    { id: 4, name: "Entertainment", count: 0, color: "#EF4444" },
  ]);

  const [bookmarks] = useState([]);
  const [processingQueue] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch bookmarks and categories
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const CategoryPill = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? category.color : colors.cardBackground,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isSelected ? category.color : colors.border,
      }}
    >
      <Text style={{
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: isSelected ? colors.white : colors.text,
        marginRight: category.count > 0 ? 6 : 0
      }}>
        {category.name}
      </Text>
      {category.count > 0 && (
        <View style={{
          backgroundColor: isSelected ? colors.white : category.color,
          borderRadius: 10,
          paddingHorizontal: 6,
          paddingVertical: 2,
          minWidth: 20,
          alignItems: 'center'
        }}>
          <Text style={{
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            color: isSelected ? category.color : colors.white
          }}>
            {category.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const ProcessingQueueItem = ({ item }) => (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.warning + '30',
    }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Clock size={20} color={colors.warning} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: "Inter_500Medium",
          fontSize: 14,
          color: colors.text,
          marginBottom: 2
        }}>
          {item.title}
        </Text>
        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: colors.textSecondary
        }}>
          Processing... • Est. {item.estimatedTime}
        </Text>
      </View>
      
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.warning,
        opacity: 0.6,
      }} />
    </View>
  );

  const BookmarkCard = ({ bookmark }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/bookmark/${bookmark.id}`)}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {bookmark.thumbnailUrl && (
        <Image
          source={bookmark.thumbnailUrl}
          style={{
            width: '100%',
            height: 120,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
          contentFit="cover"
        />
      )}
      
      <View style={{ padding: 16 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8
        }}>
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: colors.text,
            flex: 1,
            marginRight: 8
          }}>
            {bookmark.title}
          </Text>
          <TouchableOpacity style={{ padding: 4 }}>
            <MoreVertical size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
        
        {bookmark.description && (
          <Text style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 12,
            lineHeight: 20
          }} numberOfLines={2}>
            {bookmark.description}
          </Text>
        )}
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {bookmark.locationName && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 12
              }}>
                <MapPin size={12} color={colors.textTertiary} />
                <Text style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.textTertiary,
                  marginLeft: 4
                }}>
                  {bookmark.locationName}
                </Text>
              </View>
            )}
            
            {bookmark.category && (
              <View style={{
                backgroundColor: bookmark.category.color + '20',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2
              }}>
                <Text style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 11,
                  color: bookmark.category.color
                }}>
                  {bookmark.category.name}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={{ padding: 4 }}>
            <ExternalLink size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
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
        paddingBottom: 16,
        backgroundColor: colors.background
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 24,
            color: colors.text
          }}>
            Bookmarks
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{ 
                padding: 8,
                backgroundColor: colors.cardBackground,
                borderRadius: 8,
                marginRight: 8
              }}
            >
              {viewMode === 'grid' ? 
                <List size={20} color={colors.text} /> : 
                <Grid3x3 size={20} color={colors.text} />
              }
            </TouchableOpacity>
            
            <TouchableOpacity style={{ 
              padding: 8,
              backgroundColor: colors.cardBackground,
              borderRadius: 8
            }}>
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16
        }}>
          <Search size={20} color={colors.textTertiary} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search bookmarks..."
            placeholderTextColor={colors.textTertiary}
            style={{
              flex: 1,
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: colors.text,
              marginLeft: 12
            }}
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map(category => (
            <CategoryPill
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
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
        {/* Processing Queue */}
        {processingQueue.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 16
            }}>
              Processing Queue ({processingQueue.length})
            </Text>
            
            {processingQueue.map((item, index) => (
              <ProcessingQueueItem key={index} item={item} />
            ))}
          </View>
        )}

        {/* Bookmarks */}
        {bookmarks.length === 0 && processingQueue.length === 0 ? (
          <View style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            marginTop: 40
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Search size={32} color={colors.primary} />
            </View>
            
            <Text style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              No bookmarks yet
            </Text>
            
            <Text style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24
            }}>
              Start saving bookmarks from TikTok, Instagram, or add them manually to see them organized here.
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/add-bookmark')}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12
              }}
            >
              <Text style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.white
              }}>
                Add Your First Bookmark
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {bookmarks.map(bookmark => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}