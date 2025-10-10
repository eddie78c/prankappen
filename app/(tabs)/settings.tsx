import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Image, Alert, Platform, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { useAuth } from '../../contexts/AuthContext';
import { availableCurrencies, getCurrencySymbol } from '../../utils/currency';
// import PinInput, { PinInputProps } from '../components/PinInput';

// Reusable InputContainer component
const InputContainer = ({ label, labelStyle, value, onChangeText, placeholder, keyboardType, theme, children }: any) => (
  <View style={[styles.compactInputContainer, { backgroundColor: theme.colors.surface }]}>
    <Text style={[styles.inputLabel, { color: theme.colors.text }, labelStyle]}>
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
  const currentSoundRef = useRef<any>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showPrankSettings, setShowPrankSettings] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showAffiliates, setShowAffiliates] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled || false);
  const [tempReceiverName, setTempReceiverName] = useState(settings.receiverName);
  const [tempAmount, setTempAmount] = useState(settings.defaultAmount.toString());
  const [tempProfileLocation, setTempProfileLocation] = useState(settings.profileLocation);
  const [tempProfileBalance, setTempProfileBalance] = useState(settings.profileBalance.toString());
  const [tempLaughterSound, setTempLaughterSound] = useState(settings.laughterSound || 'Chuckle.mp3');
  const [tempPin, setTempPin] = useState('');
  const [tempConfirmPin, setTempConfirmPin] = useState('');
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [payoutEmail, setPayoutEmail] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  // Generate dynamic referral code
  const generateReferralCode = () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
    return `PRANK${randomNum}`;
  };

  const [referralCode, setReferralCode] = useState(generateReferralCode());

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

  const playSoundUri = async (uri: any) => {
    try {
      // Stop current sound if playing
      if (currentSoundRef.current) {
        await currentSoundRef.current.unloadAsync();
        currentSoundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(uri);
      currentSoundRef.current = sound;
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          currentSoundRef.current = null;
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const savePrankSettings = () => {
    updateSettings({
      receiverName: tempReceiverName,
      defaultAmount: parseFloat(tempAmount) || settings.defaultAmount,
      laughterSound: tempLaughterSound,
      profileLocation: tempProfileLocation,
      profileBalance: parseFloat(tempProfileBalance) || settings.profileBalance,
    });
    setShowPrankSettings(false);
    Alert.alert(translations.settingsSaved || 'Settings saved', translations.prankSettingsUpdated || 'Prank settings updated');
  };


  const handleCurrencySelect = (currency: string) => {
    updateSettings({ currency });
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
          icon: <Ionicons name="people" size={24} color={theme.colors.primary} />,
          title: translations.affiliateProgram,
          type: 'navigation',
          onPress: () => setShowAffiliates(!showAffiliates),
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
          onPress: () => setShowSecurity(!showSecurity),
        },
        {
          icon: <Ionicons name="notifications" size={24} color={theme.colors.primary} />,
          title: translations.notifications,
          type: 'navigation',
          onPress: () => setShowNotifications(!showNotifications),
        },
        {
          icon: <Ionicons name="star" size={24} color={theme.colors.primary} />,
          title: translations.rateUs,
          type: 'navigation',
          onPress: () => setShowRating(!showRating),
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
          onPress: () => setShowHelpCenter(!showHelpCenter),
        },
        {
          icon: <Ionicons name="information-circle" size={24} color={theme.colors.primary} />,
          title: translations.about,
          type: 'navigation',
          onPress: () => setShowAbout(!showAbout),
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

  const showBackButton = showLanguageSelector || showCurrencySelector || showPrankSettings || showAffiliates || showHelpCenter || showAbout || showSecurity || showNotifications || showRating;

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
              setShowPrankSettings(false);
              setShowAffiliates(false);
              setShowHelpCenter(false);
              setShowAbout(false);
              setShowSecurity(false);
              setShowNotifications(false);
              setShowRating(false);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {showLanguageSelector ? translations.selectLanguage :
           showCurrencySelector ? translations.selectCurrency :
           showPrankSettings ? translations.prankConfiguration :
           showAffiliates ? translations.affiliateProgram :
           showHelpCenter ? translations.helpCenter :
           showAbout ? translations.about :
           showSecurity ? translations.security :
           showNotifications ? translations.notifications :
           showRating ? translations.rateUs :
           translations.settings}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

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
        {showPrankSettings && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.prankConfiguration}
              </Text>

              <InputContainer
                label={translations.receiverPhoto}
                labelStyle={{ textAlign: 'center' }}
                theme={theme}
              >
                <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
                  <Image source={settings.receiverPhoto ? { uri: settings.receiverPhoto } : require('../../assets/images/avatar.jpg')} style={styles.photo} resizeMode="cover" />
                  <View style={styles.photoOverlay}>
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </InputContainer>

              <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}>
                <InputContainer
                  label={translations.receiverName}
                  value={tempReceiverName}
                  onChangeText={setTempReceiverName}
                  placeholder={translations.enterReceiverName}
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
              </View>

              <InputContainer
                label={`${translations.defaultAmount} (${settings.currency})`}
                value={tempAmount}
                onChangeText={setTempAmount}
                keyboardType="numeric"
                placeholder={translations.enterAmount}
                theme={theme}
              />

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
                    playSoundUri(require('@/assets/sounds/a-pay.mp3'));
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
                      onPress={() => {
                        setTempLaughterSound(sound.file);
                        const soundPath = sound.file === 'Chuckle.mp3' ? require('@/assets/sounds/laugh/Chuckle.mp3') :
                                         sound.file === 'Giggle.mp3' ? require('@/assets/sounds/laugh/Giggle.mp3') :
                                         require('@/assets/sounds/laugh/Tee-hee.mp3');
                        playSoundUri(soundPath);
                      }}
                    >
                      <Text style={[styles.laughterText, { color: theme.colors.text }]}>
                        {sound.name}
                      </Text>
                      {tempLaughterSound === sound.file && (
                        <View style={[styles.selectedDot, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </TouchableOpacity>
                  ))}

                  {settings.customSounds.map((soundUri, index) => (
                    <TouchableOpacity
                      key={`custom-${index}`}
                      style={[
                        styles.laughterOption,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: tempLaughterSound === soundUri ? theme.colors.primary : theme.colors.border,
                          borderWidth: tempLaughterSound === soundUri ? 2 : 1,
                        }
                      ]}
                      onPress={() => {
                        setTempLaughterSound(soundUri);
                        playSoundUri({ uri: soundUri });
                      }}
                    >
                      <Text style={[styles.laughterText, { color: theme.colors.text }]}>
                        Custom {index + 1}
                      </Text>
                      {tempLaughterSound === soundUri && (
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
              
              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={savePrankSettings}
              >
                <Ionicons name="save" size={18} color={theme.colors.surface} style={styles.saveButtonIcon} />
                <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                  {translations.saveSettings}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeConfigButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
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

        {/* Help Center */}
        {showHelpCenter && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <View style={[styles.helpContent, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                  {translations.welcomeToPrankBank}
                </Text>

                <Text style={[styles.helpSubTitle, { color: theme.colors.primary }]}>
                  {translations.gettingStarted}
                </Text>

                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  {translations.settingUpProfile}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.goToSettingsConfigure}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletReceiverName}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletLocation}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletTotalBalance}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletDefaultAmount}
                </Text>

                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  {translations.soundSettings}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.makePranksConvincing}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletLaughterSounds}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletCustomSounds}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletRequestSound}
                </Text>

                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  {translations.photoSettings}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.addReceiverPhoto}
                </Text>

                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  {translations.fartsKnockFeatures}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.additionalPrankTools}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletFarts}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.bulletKnock}
                </Text>

                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  {translations.howToExecutePrank}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.followStepsPerfectPrank}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.step1SetupProfile}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.step2ChooseSounds}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.step3NavigateMainScreen}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.step4ShowTransactionScreen}
                </Text>
                <Text style={[styles.helpBullet, { color: theme.colors.textSecondary }]}>
                  {translations.step5EnjoyReaction}
                </Text>

                <Text style={[styles.helpWarning, { color: 'orange' }]}>
                  {translations.importantNote}
                </Text>
                <Text style={[styles.helpSubText, { color: theme.colors.textSecondary }]}>
                  {translations.alwaysPrankResponsibly}
                </Text>

                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  Enjoy your pranks responsibly! 🎭
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* About */}
        {showAbout && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <View style={[styles.aboutContent, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.aboutDescription}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.aboutFeatures}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.aboutHowItWorks}
                </Text>

                <Text style={[styles.aboutWarning, { color: 'red' }]}>
                  {translations.legalDisclaimer}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.legalText1}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.legalText2}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.legalText3}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.legalText4}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.version}
                </Text>

                <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                  {translations.copyright}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Security */}
        {showSecurity && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.security}
              </Text>

              <View style={[styles.securityContent, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.securityText, { color: theme.colors.text }]}>
                  {translations.setPinCode}
                </Text>

                <View style={styles.pinInputsContainer}>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      marginBottom: 8,
                    }]}
                    placeholder={translations.enter4DigitPin}
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={true}
                    value={tempPin}
                    onChangeText={setTempPin}
                  />

                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      marginBottom: 8,
                    }]}
                    placeholder={translations.confirm4DigitPin}
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={true}
                    value={tempConfirmPin}
                    onChangeText={setTempConfirmPin}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: theme.colors.primary, marginTop: 16 }]}
                  onPress={() => {
                    if (tempPin === tempConfirmPin) {
                      if (tempPin.length === 4) {
                        updateSettings({ pin: tempPin });
                        Alert.alert(translations.pinSet || 'PIN Set', 'Your PIN has been set successfully.');
                        setTempPin('');
                        setTempConfirmPin('');
                        setShowSecurity(false);
                      } else if (tempPin.length === 0) {
                        updateSettings({ pin: null });
                        Alert.alert(translations.pinDisabled || 'PIN Disabled', 'PIN has been disabled.');
                        setTempPin('');
                        setTempConfirmPin('');
                        setShowSecurity(false);
                      } else {
                        Alert.alert(translations.invalidPin || 'Invalid PIN', translations.enter4DigitPinOrEmpty || 'Please enter a 4-digit PIN or leave empty to disable.');
                      }
                    } else {
                      Alert.alert(translations.pinMismatch || 'PIN Mismatch', translations.pinsDoNotMatch || 'PINs do not match. Please try again.');
                    }
                  }}
                >
                  <Ionicons name="save" size={18} color={theme.colors.surface} style={styles.saveButtonIcon} />
                  <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                    {translations.savePin}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.securitySubText, { color: theme.colors.textSecondary }]}>
                  {translations.pinSecuritySubText}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Notifications */}
        {showNotifications && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.notifications}
              </Text>

              <View style={[styles.notificationsContent, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.notificationItem}>
                  <Text style={[styles.notificationText, { color: theme.colors.text }]}>
                    {translations.receiveUpdatesOffers}
                  </Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={(value) => {
                      setNotificationsEnabled(value);
                      updateSettings({ notificationsEnabled: value });
                    }}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={theme.colors.surface}
                  />
                </View>

                {notificationsEnabled && (
                  <Text style={[styles.notificationSubText, { color: theme.colors.textSecondary }]}>
                    {translations.notificationsEnabledText}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Rating */}
        {showRating && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.rateUs}
              </Text>

              <View style={[styles.notificationsContent, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.notificationText, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                  {translations.rateAppQuestion}
                </Text>

                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRatingStars(star)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= ratingStars ? "star" : "star-outline"}
                        size={32}
                        color={star <= ratingStars ? theme.colors.primary : theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    marginTop: 16,
                    height: 80,
                    textAlignVertical: 'top',
                  }]}
                  placeholder={translations.writeComment}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: theme.colors.primary, marginTop: 16 }]}
                  onPress={() => {
                    if (ratingStars >= 4) {
                      // Open store
                      const storeUrl = Platform.OS === 'ios'
                        ? 'https://apps.apple.com/app/prank-bank/id123456789' // Replace with actual App Store ID
                        : 'https://play.google.com/store/apps/details?id=com.prankbank.app'; // Replace with actual package name
                      Linking.openURL(storeUrl);
                      setShowRating(false);
                      setRatingStars(0);
                      setRatingComment('');
                    } else {
                      setShowThankYou(true);
                    }
                  }}
                >
                  <Ionicons name="send" size={18} color={theme.colors.surface} style={styles.saveButtonIcon} />
                  <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                    {translations.submitRating}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Affiliates Panel */}
        {showAffiliates && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              {/* Earnings Overview */}
              <View style={[styles.affiliateCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.earningsTitle, { color: theme.colors.text, textAlign: 'center' }]}>
                  {translations.totalEarned}
                </Text>
                <Text style={[styles.earningsAmount, { color: theme.colors.primary, textAlign: 'center' }]}>
                  $47.00
                </Text>
                <Text style={[styles.earningsSubText, { color: theme.colors.textSecondary }]}>
                  {translations.earnPerReferral}
                </Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statCardValue, { color: theme.colors.primary }]}>47</Text>
                  <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                    {translations.totalReferrals}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statCardValue, { color: theme.colors.success }]}>$5.00</Text>
                  <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                    {translations.pendingPayouts}
                  </Text>
                </View>
              </View>

              {/* Referral Link */}
              <View style={[styles.affiliateCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {translations.referralLink}
                </Text>
                <TouchableOpacity
                  style={[styles.linkContainer, { backgroundColor: theme.colors.background }]}
                  onPress={() => {
                    // In a real app, you'd use Clipboard.setStringAsync(link)
                    Alert.alert(translations.copied || 'Copied!', 'Referral link copied to clipboard');
                    setShowCopiedMessage(true);
                    setTimeout(() => setShowCopiedMessage(false), 2000);
                  }}
                >
                  <Text style={[styles.linkText, { color: theme.colors.text }]} numberOfLines={1}>
                    https://prankbank.app/ref/{referralCode}
                  </Text>
                  <View style={styles.linkActions}>
                    <Ionicons name="copy" size={14} color={theme.colors.textSecondary} style={styles.copyIcon} />
                    {showCopiedMessage && (
                      <Text style={[styles.copiedText, { color: theme.colors.success }]}>
                        Copied!
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.referralCode, { color: theme.colors.textSecondary }]}>
                  Referral Code: {referralCode}
                </Text>
              </View>

              {/* Payout Request */}
              <View style={[styles.affiliateCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {translations.requestPayout}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  {translations.minimumPayout}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {translations.paypalEmail}
                  </Text>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    placeholder={translations.enterPaypalEmail}
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={payoutEmail}
                    onChangeText={setPayoutEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {translations.payoutAmount}
                  </Text>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    placeholder={translations.enterPayoutAmount}
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={payoutAmount}
                    onChangeText={setPayoutAmount}
                  />
                </View>

                {payoutError ? (
                  <Text style={[styles.errorText, { color: theme.colors.error || 'red' }]}>
                    {payoutError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.payoutButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    const amount = parseFloat(payoutAmount);
                    const available = 47.00; // $1 per referral

                    setPayoutError(''); // Clear previous error

                    if (!payoutEmail.trim()) {
                      setPayoutError(translations.invalidPaypalEmail || 'Please enter your PayPal email address');
                      return;
                    }

                    if (isNaN(amount) || amount <= 0) {
                      setPayoutError(translations.invalidPayoutAmount || 'Please enter a valid payout amount');
                      return;
                    }

                    if (amount < 50) {
                      setPayoutError(translations.minimumPayoutAmount || 'The minimum payout amount is $50. You currently have $47.00 available.');
                      return;
                    }

                    if (amount > available) {
                      setPayoutError((translations.insufficientEarnings || 'You cannot request more than your available earnings. You have $47.00 available, but requested $[amount].').replace('$[amount]', `$${amount}`));
                      return;
                    }

                    Alert.alert('Success', translations.payoutRequested || 'Payout requested successfully');
                    setPayoutEmail('');
                    setPayoutAmount('');
                    setPayoutError('');
                  }}
                >
                  <Ionicons name="card" size={18} color={theme.colors.surface} style={styles.buttonIcon} />
                  <Text style={[styles.payoutButtonText, { color: theme.colors.surface }]}>
                    {translations.requestPayout}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Payout History */}
              <View style={[styles.affiliateCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {translations.payoutHistory}
                </Text>

                <View style={styles.historyList}>
                  {[
                    { id: '1', amount: 150.00, date: '2025-01-15', status: 'completed', method: 'PayPal' },
                    { id: '2', amount: 200.00, date: '2025-01-01', status: 'completed', method: 'PayPal' },
                    { id: '3', amount: 100.00, date: '2024-12-15', status: 'completed', method: 'PayPal' },
                  ].map((item) => (
                    <View key={item.id} style={[styles.payoutItem, { backgroundColor: theme.colors.background }]}>
                      <View style={styles.payoutLeft}>
                        <Text style={[styles.payoutAmount, { color: theme.colors.primary }]}>${item.amount}</Text>
                        <Text style={[styles.payoutDate, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                      </View>
                      <View style={styles.payoutRight}>
                        <Text style={[styles.payoutMethod, { color: theme.colors.text }]}>{item.method}</Text>
                        <View style={[styles.statusBadge, {
                          backgroundColor: item.status === 'completed' ? theme.colors.success + '20' : theme.colors.warning + '20'
                        }]}>
                          <Text style={[styles.statusText, {
                            color: item.status === 'completed' ? theme.colors.success : theme.colors.warning
                          }]}>
                            {item.status === 'completed' ? 'Completed' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.closeConfigButton, { backgroundColor: theme.colors.border }]}
                onPress={() => setShowAffiliates(false)}
              >
                <Text style={[styles.closeConfigText, { color: theme.colors.text }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Settings Groups */}
        {!showLanguageSelector && !showCurrencySelector && !showPrankSettings && !showAffiliates && !showHelpCenter && !showAbout && !showSecurity && !showNotifications && !showRating && (
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
                  onPress={() => {
                    logout();
                    // Navigate back to home tab to show PIN screen if needed
                    // The AuthContext will handle the state change
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color="rgb(220, 38, 38)" style={styles.logoutIcon} />
                  <Text style={[styles.logoutText, { color: theme.colors.text }]}>
                    {translations.logOut || 'Log Out'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.footerTextContainer}>
                  <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                    © 2025 Premium{' '}
                    <Text style={[styles.strikethroughText, { color: theme.colors.textSecondary }]}>
                      Bank
                    </Text>
                    {' '}Prank. All rights reserved.
                  </Text>
                  <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                    Made with ❤️ for secure{' '}
                    <Text style={[styles.strikethroughText, { color: theme.colors.textSecondary }]}>
                      banking
                    </Text>
                    {' '}pranking.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThankYou(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.thankYouModal, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="heart" size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.thankYouTitle, { color: theme.colors.text }]}>
              {translations.thankYou}
            </Text>
            <Text style={[styles.thankYouText, { color: theme.colors.textSecondary }]}>
              {translations.thankYouFeedback}
            </Text>
            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setShowThankYou(false);
                setShowRating(false);
                setRatingStars(0);
                setRatingComment('');
              }}
            >
              <Text style={[styles.closeModalText, { color: theme.colors.surface }]}>
                {translations.close}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    marginTop: 20,
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
  footerTextContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
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
    marginBottom: 4,
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
    alignSelf: 'center',
    position: 'relative',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
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
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveButtonIcon: {
    marginRight: 8,
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

  // Help and About styles
  helpContent: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  helpSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  helpText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpSubText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  helpBullet: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 20,
  },
  helpWarning: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  aboutContent: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  aboutWarning: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  // Security and Notifications styles
  securityContent: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  securityText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  securitySubText: {
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  pinInputsContainer: {
    marginBottom: 16,
  },
  notificationsContent: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  notificationSubText: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouModal: {
    width: '80%',
    maxWidth: 300,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Affiliate styles
  affiliateCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  earningsSubText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginRight: 4,
  },
  copiedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  referralCode: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  payoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  historyList: {
    marginTop: 8,
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
    marginBottom: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  payoutLeft: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  payoutDate: {
    fontSize: 10,
    marginTop: 1,
  },
  payoutRight: {
    alignItems: 'flex-end',
  },
  payoutMethod: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
});
