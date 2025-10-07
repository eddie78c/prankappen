import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { useAuth } from '../../contexts/AuthContext';
import { availableCurrencies, getCurrencySymbol } from '../../utils/currency';

// Återanvändbar InputContainer komponent
const InputContainer = ({ label, value, onChangeText, placeholder, keyboardType, theme, children }: any) => (
  <View style={[styles.compactInputContainer, { backgroundColor: theme.colors.surface }]}>
    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
      {label}
    </Text>
    {children || (
      <TextInput
        style={[styles.textInput, {
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border,
        }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
      />
    )}
  </View>
);

// Wheel Picker component for mobile-style selection
const WheelPicker = ({ items, selectedValue, onSelect, theme, renderItem, onClose }: any) => {
  const ITEM_HEIGHT = 60;
  const VISIBLE_ITEMS = 5;
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);

  // Find current index based on selectedValue
  const currentIndex = Math.max(0, items.findIndex((item: any) =>
    (item.code || item.file || item) === selectedValue
  ));

  React.useEffect(() => {
    // Update selected index when selectedValue changes
    setCurrentSelectedIndex(currentIndex);

    // Scroll to selected item when it changes
    if (scrollViewRef.current && currentIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: currentIndex * ITEM_HEIGHT,
          animated: true,
        });
      }, 100);
    }
  }, [currentIndex, selectedValue]);

  const handleMomentumScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex));

    // Only update if the selection actually changed
    if (clampedIndex !== currentSelectedIndex) {
      setCurrentSelectedIndex(clampedIndex);

      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Call onSelect with the selected item
      const selectedItem = items[clampedIndex];
      if (selectedItem) {
        onSelect(selectedItem.code || selectedItem.file || selectedItem);
      }
    }

    // Snap to the nearest item
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleItemPress = (index: number) => {
    setCurrentSelectedIndex(index);

    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scroll to the selected item
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });

    // Call onSelect with the selected item
    const selectedItem = items[index];
    if (selectedItem) {
      onSelect(selectedItem.code || selectedItem.file || selectedItem);
    }
  };

  const renderPickerItem = ({ item, index }: any) => {
    const isSelected = index === currentSelectedIndex;
    const isNearCenter = Math.abs(index - currentSelectedIndex) <= 1;

    return (
      <TouchableOpacity
        style={styles.pickerItem}
        onPress={() => handleItemPress(index)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.pickerItemContent,
          {
            opacity: isSelected ? 1 : isNearCenter ? 0.7 : 0.4,
            transform: [{ scale: isSelected ? 1.05 : 1 }]
          }
        ]}>
          {renderItem(item, isSelected)}
          {isSelected && (
            <View style={styles.selectedHighlight}>
              <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.pickerContainer}>
      <View style={[styles.pickerMask, { height: CONTAINER_HEIGHT }]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={styles.pickerContent}
        >
          {items.map((item: any, index: number) => (
            <View key={`${item.code || item.file || 'item'}-${index}`}>
              {renderPickerItem({ item, index })}
            </View>
          ))}
        </ScrollView>
        {/* Selection indicator lines */}
        <View style={[styles.selectionIndicator, { top: ITEM_HEIGHT * 2 }]}>
          <View style={[styles.indicatorLine, { backgroundColor: theme.colors.primary }]} />
        </View>
        <View style={[styles.selectionIndicator, { bottom: ITEM_HEIGHT * 2 }]}>
          <View style={[styles.indicatorLine, { backgroundColor: theme.colors.primary }]} />
        </View>
      </View>
    </View>
  );
};

export default function MoreScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { translations, currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { settings, updateSettings } = usePrank();
  const { logout } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showPrankSettings, setShowPrankSettings] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [tempReceiverName, setTempReceiverName] = useState(settings.receiverName);
  const [tempAmount, setTempAmount] = useState(settings.defaultAmount.toString());
  const [tempProfileName, setTempProfileName] = useState(settings.profileName);
  const [tempProfileLocation, setTempProfileLocation] = useState(settings.profileLocation);
  const [tempProfileBalance, setTempProfileBalance] = useState(settings.profileBalance.toString());
  const [tempLaughterSound, setTempLaughterSound] = useState(settings.laughterSound || 'Chuckle.mp3');

  const laughterSounds = [
    { name: 'Chuckle', file: 'Chuckle.mp3' },
    { name: 'Giggle', file: 'Giggle.mp3' },
    { name: 'Tee-hee', file: 'Tee-hee.mp3' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(translations.permissionNeeded || 'Permission needed', translations.cameraPermission || 'Camera permission is required');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateSettings({ receiverPhoto: result.assets[0].uri });
    }
  };

  const pickCustomSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempLaughterSound(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(translations.error || 'Error', translations.failedToPickSound || 'Failed to pick sound');
    }
  };

  const savePrankSettings = () => {
    updateSettings({
      receiverName: tempReceiverName,
      defaultAmount: parseFloat(tempAmount) || settings.defaultAmount,
      laughterSound: tempLaughterSound,
    });
    setShowPrankSettings(false);
    Alert.alert(translations.settingsSaved || 'Settings saved', translations.prankSettingsUpdated || 'Prank settings updated');
  };

  const saveProfileSettings = () => {
    updateSettings({
      profileName: tempProfileName,
      profileLocation: tempProfileLocation,
      profileBalance: parseFloat(tempProfileBalance) || settings.profileBalance,
    });
    setShowProfileSettings(false);
    Alert.alert(translations.profileUpdated || 'Profile updated', translations.profileUpdated || 'Profile updated');
  };

  const handleCurrencySelect = (currency: string) => {
    updateSettings({ currency });
    // Don't close automatically - let user close with back button
  };

  const settingsGroups = [
    {
      title: translations.appearance,
      items: [
        {
          icon: <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.colors.primary} />,
          title: translations.darkMode,
          type: 'switch',
          value: isDark,
          onPress: toggleTheme,
        },
        {
          icon: <Ionicons name="globe" size={24} color={theme.colors.primary} />,
          title: translations.language,
          type: 'selector',
          value: availableLanguages.find(lang => lang.code === currentLanguage)?.name,
          onPress: () => setShowLanguageSelector(!showLanguageSelector),
        },
        {
          icon: <Ionicons name="cash" size={24} color={theme.colors.primary} />,
          title: translations.currency,
          type: 'selector',
          value: `${settings.currency} (${getCurrencySymbol(settings.currency)})`,
          onPress: () => setShowCurrencySelector(!showCurrencySelector),
        },
      ],
    },
    {
      title: translations.prankSettings,
      items: [
        {
          icon: <Ionicons name="settings" size={24} color={theme.colors.primary} />,
          title: translations.configurePrank,
          type: 'navigation',
          onPress: () => setShowPrankSettings(!showPrankSettings),
        },
        {
          icon: <Ionicons name="person" size={24} color={theme.colors.primary} />,
          title: translations.profileSettings,
          type: 'navigation',
          onPress: () => setShowProfileSettings(!showProfileSettings),
        },
      ],
    },
    {
      title: translations.services,
      items: [
        {
          icon: <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />,
          title: translations.security,
          type: 'navigation',
          onPress: () => {},
        },
        {
          icon: <Ionicons name="notifications" size={24} color={theme.colors.primary} />,
          title: translations.notifications,
          type: 'navigation',
          onPress: () => {},
        },
      ],
    },
    {
      title: translations.support,
      items: [
        {
          icon: <Ionicons name="help-circle" size={24} color={theme.colors.primary} />,
          title: translations.helpCenter,
          type: 'navigation',
          onPress: () => {},
        },
        {
          icon: <Ionicons name="information-circle" size={24} color={theme.colors.primary} />,
          title: translations.about,
          type: 'navigation',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: string) => (
    <Animated.View
      key={index}
      entering={FadeInDown.delay(parseInt(index.split('-')[1]) * 50).springify()}
    >
      <TouchableOpacity
        style={[styles.compactSettingItem, { backgroundColor: theme.colors.surface }]}
        onPress={item.onPress}
        activeOpacity={item.type === 'switch' ? 1 : 0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.compactSettingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            {item.icon}
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.compactSettingTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            {item.value && item.type === 'selector' && (
              <Text style={[styles.compactSettingValue, { color: theme.colors.textSecondary }]}>
                {item.value}
              </Text>
            )}
          </View>
        </View>
        
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );

  const showBackButton = showLanguageSelector || showCurrencySelector || showProfileSettings || showPrankSettings;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {showBackButton && (
          <TouchableOpacity
            style={[styles.backButton, { position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'center' }]}
            onPress={() => {
              setShowLanguageSelector(false);
              setShowCurrencySelector(false);
              setShowProfileSettings(false);
              setShowPrankSettings(false);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {showLanguageSelector ? translations.selectLanguage :
           showCurrencySelector ? translations.selectCurrency :
           showProfileSettings ? translations.profileConfiguration :
           showPrankSettings ? translations.prankConfiguration :
           translations.settings}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bank Info */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={[styles.bankInfo, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.bankLogo, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.bankLogoText, { color: theme.colors.surface }]}>P</Text>
            </View>
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: theme.colors.text }]}>
                {translations.bankName}
              </Text>
              <Text style={[styles.bankVersion, { color: theme.colors.textSecondary }]}>
                {translations.version}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Language Selector */}
        {showLanguageSelector && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.selectLanguage}
              </Text>
              <WheelPicker
                items={availableLanguages}
                selectedValue={currentLanguage}
                onSelect={(code: string) => {
                  setLanguage(code as any);
                  // Don't close automatically - let user close with back button
                }}
                theme={theme}
                renderItem={(language: any, isSelected: boolean) => (
                  <>
                    <Text style={[styles.pickerSymbol, { color: isSelected ? theme.colors.primary : theme.colors.textSecondary }]}>
                      {language.flag}
                    </Text>
                    <Text style={[
                      styles.pickerText,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.text,
                        fontWeight: isSelected ? '700' : '600',
                        fontSize: isSelected ? 20 : 18
                      }
                    ]}>
                      {language.name}
                    </Text>
                  </>
                )}
              />
            </View>
          </Animated.View>
        )}

        {/* Currency Selector */}
        {showCurrencySelector && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.selectCurrency}
              </Text>
              <WheelPicker
                items={availableCurrencies}
                selectedValue={settings.currency}
                onSelect={handleCurrencySelect}
                theme={theme}
                renderItem={(currency: any, isSelected: boolean) => (
                  <>
                    <Text style={[styles.pickerSymbol, { color: isSelected ? theme.colors.primary : theme.colors.textSecondary }]}>
                      {currency.symbol}
                    </Text>
                    <Text style={[
                      styles.pickerText,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.text,
                        fontWeight: isSelected ? '700' : '600',
                        fontSize: isSelected ? 20 : 18
                      }
                    ]}>
                      {currency.code} - {currency.name}
                    </Text>
                  </>
                )}
              />
            </View>
          </Animated.View>
        )}

        {/* Configuration Panel */}
        {(showProfileSettings || showPrankSettings) && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {showProfileSettings ? translations.profileConfiguration : translations.prankConfiguration}
              </Text>
              
              {showProfileSettings ? (
                <>
                  <InputContainer
                    label={translations.profileName}
                    value={tempProfileName}
                    onChangeText={setTempProfileName}
                    placeholder={translations.enterProfileName}
                    theme={theme}
                  />

                  <InputContainer
                    label={translations.location}
                    value={tempProfileLocation}
                    onChangeText={setTempProfileLocation}
                    placeholder={translations.enterLocation}
                    theme={theme}
                  />

                  <InputContainer
                    label={`${translations.totalBalance} (${settings.currency})`}
                    value={tempProfileBalance}
                    onChangeText={setTempProfileBalance}
                    keyboardType="numeric"
                    placeholder={translations.enterBalance}
                    theme={theme}
                  />
                </>
              ) : (
                <>
                  <InputContainer
                    label={translations.receiverName}
                    value={tempReceiverName}
                    onChangeText={setTempReceiverName}
                    placeholder={translations.enterReceiverName}
                    theme={theme}
                  />

                  <InputContainer
                    label={`${translations.defaultAmount} (${settings.currency})`}
                    value={tempAmount}
                    onChangeText={setTempAmount}
                    keyboardType="numeric"
                    placeholder={translations.enterAmount}
                    theme={theme}
                  />

                  <InputContainer
                    label={translations.receiverPhoto}
                    theme={theme}
                  >
                    <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
                      {settings.receiverPhoto ? (
                        <Image source={{ uri: settings.receiverPhoto }} style={styles.photo} />
                      ) : (
                        <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.background }]}>
                          <Ionicons name="camera" size={24} color={theme.colors.textSecondary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </InputContainer>
                  
                  <InputContainer
                    label={translations.requestSound}
                    theme={theme}
                  >
                    <TouchableOpacity
                      style={[
                        styles.soundButton, {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        }
                      ]}
                      onPress={() => {
                        updateSettings({ requestSound: 'a-pay.mp3' });
                        Alert.alert(translations.soundSelected || 'Sound selected', translations.aPaySound || 'A-Pay sound selected');
                      }}
                    >
                      <Text style={[styles.soundButtonText, { color: theme.colors.text }]}>
                        {settings.requestSound || 'Select Sound'}
                      </Text>
                    </TouchableOpacity>
                  </InputContainer>

                  <InputContainer
                    label={translations.typesOfLaughter}
                    theme={theme}
                  >
                    <View style={styles.laughterGrid}>
                      {laughterSounds.map((sound) => (
                        <TouchableOpacity
                          key={sound.file}
                          style={[
                            styles.laughterOption,
                            {
                              backgroundColor: theme.colors.background,
                              borderColor: tempLaughterSound === sound.file ? theme.colors.primary : theme.colors.border,
                              borderWidth: tempLaughterSound === sound.file ? 2 : 1,
                            }
                          ]}
                          onPress={() => setTempLaughterSound(sound.file)}
                        >
                          <Text style={[styles.laughterText, { color: theme.colors.text }]}>
                            {sound.name}
                          </Text>
                          {tempLaughterSound === sound.file && (
                            <View style={[styles.selectedDot, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </TouchableOpacity>
                      ))}
                      
                      <TouchableOpacity
                        style={[
                          styles.laughterOption,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                          }
                        ]}
                        onPress={pickCustomSound}
                      >
                        <Text style={[styles.laughterText, { color: theme.colors.textSecondary }]}>
                          + Custom
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </InputContainer>
                </>
              )}
              
              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={showProfileSettings ? saveProfileSettings : savePrankSettings}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                  {showProfileSettings ? translations.saveProfile : translations.saveSettings}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeConfigButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setShowProfileSettings(false);
                  setShowPrankSettings(false);
                }}
              >
                <Text style={[styles.closeConfigText, { color: theme.colors.text }]}>
                  {translations.close}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Settings Groups */}
        {!showLanguageSelector && !showCurrencySelector && !showProfileSettings && !showPrankSettings && (
          <>
            {settingsGroups.map((group, groupIndex) => (
              <Animated.View 
                key={groupIndex}
                entering={FadeInDown.delay((groupIndex + 1) * 200)}
              >
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {group.title}
                  </Text>
                  {group.items.map((item, itemIndex) => renderSettingItem(item, `${group.title}-${itemIndex}`))}
                </View>
              </Animated.View>
            ))}

            {/* Footer */}
            <Animated.View entering={FadeInDown.delay(1000)}>
              <View style={[styles.footer, { borderTopWidth: 1, borderTopColor: theme.colors.border }] }>
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    { borderColor: 'rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.10)' }
                  ]}
                  onPress={logout}
                >
                  <Ionicons name="log-out-outline" size={18} color="rgb(220, 38, 38)" style={styles.logoutIcon} />
                  <Text style={[styles.logoutText, { color: theme.colors.text }]}>
                    {translations.logout || 'Logga ut'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  {translations.copyright}
                </Text>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  {translations.madeWith}
                </Text>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    paddingTop: 0,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
    zIndex: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: 48,
    paddingHorizontal: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bankLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bankVersion: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  compactSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactSettingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingText: {
    flex: 1,
  },
  compactSettingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactSettingValue: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  logoutButton: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutIcon: {
    marginRight: 8,
  },
  compactInputContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  photoButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  photo: {
    width: 60,
    height: 60,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  soundButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  soundButtonText: {
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeConfigButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeConfigText: {
    fontSize: 12,
  },

  laughterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  laughterOption: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    position: 'relative',
  },
  laughterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Wheel Picker styles
  pickerContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  pickerMask: {
    overflow: 'hidden',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
  },
  pickerContent: {
    paddingTop: 120, // Center the content
    paddingBottom: 120,
  },
  pickerItem: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    position: 'relative',
  },
  selectedHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorLine: {
    height: 2,
    width: '80%',
    borderRadius: 1,
  },
  pickerSymbol: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  pickerText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
