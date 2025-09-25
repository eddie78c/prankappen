import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { availableCurrencies, getCurrencySymbol } from '../../utils/currency';

// Återanvändbar GridOption komponent
const GridOption = ({ item, isSelected, onPress, theme, children }: any) => (
  <Animated.View style={styles.compactGridItem}>
    <TouchableOpacity
      style={[
        styles.compactOption,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={onPress}
    >
      {children}
      {isSelected && (
        <View style={[styles.compactSelectedIndicator, { backgroundColor: theme.colors.primary }]} />
      )}
    </TouchableOpacity>
  </Animated.View>
);

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

// Återanvändbar SelectionGrid komponent
const SelectionGrid = ({ items, selectedValue, onSelect, theme, renderItem }: any) => (
  <View style={styles.compactGrid}>
    {items.map((item: any, index: number) => (
      <GridOption
        key={item.code || item.file || index}
        item={item}
        isSelected={selectedValue === (item.code || item.file)}
        onPress={() => onSelect(item.code || item.file || item)}
        theme={theme}
      >
        {renderItem(item)}
      </GridOption>
    ))}
  </View>
);

export default function MoreScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { translations, currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { settings, updateSettings } = usePrank();
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
      Alert.alert('Permission needed', 'We need camera roll permissions to select a photo.');
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
      Alert.alert('Error', 'Failed to pick custom sound');
    }
  };

  const savePrankSettings = () => {
    updateSettings({
      receiverName: tempReceiverName,
      defaultAmount: parseFloat(tempAmount) || settings.defaultAmount,
      laughterSound: tempLaughterSound,
    });
    setShowPrankSettings(false);
    Alert.alert('Settings Saved', 'Prank settings have been updated!');
  };

  const saveProfileSettings = () => {
    updateSettings({
      profileName: tempProfileName,
      profileLocation: tempProfileLocation,
      profileBalance: parseFloat(tempProfileBalance) || settings.profileBalance,
    });
    setShowProfileSettings(false);
    Alert.alert('Profile Updated', 'Profile settings have been updated!');
  };

  const handleCurrencySelect = (currency: string) => {
    updateSettings({ currency });
    setShowCurrencySelector(false);
  };

  const settingsGroups = [
    {
      title: 'Appearance',
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
          title: 'Currency',
          type: 'selector',
          value: `${settings.currency} (${getCurrencySymbol(settings.currency)})`,
          onPress: () => setShowCurrencySelector(!showCurrencySelector),
        },
      ],
    },
    {
      title: 'Prank Settings',
      items: [
        {
          icon: <Ionicons name="settings" size={24} color={theme.colors.primary} />,
          title: 'Configure Prank',
          type: 'navigation',
          onPress: () => setShowPrankSettings(!showPrankSettings),
        },
        {
          icon: <Ionicons name="person" size={24} color={theme.colors.primary} />,
          title: 'Profile Settings',
          type: 'navigation',
          onPress: () => setShowProfileSettings(!showProfileSettings),
        },
      ],
    },
    {
      title: 'Services',
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
      title: 'Support',
      items: [
        {
          icon: <Ionicons name="help-circle" size={24} color={theme.colors.primary} />,
          title: 'Help Center',
          type: 'navigation',
          onPress: () => {},
        },
        {
          icon: <Ionicons name="information-circle" size={24} color={theme.colors.primary} />,
          title: 'About',
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
        ) : (
          <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>›</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translations.more}
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
                Version 2.1.0
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Language Selector */}
        {showLanguageSelector && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Select Language
              </Text>
              <SelectionGrid
                items={availableLanguages}
                selectedValue={currentLanguage}
                onSelect={(code: string) => {
                  setLanguage(code as any);
                  setShowLanguageSelector(false);
                }}
                theme={theme}
                renderItem={(language: any) => (
                  <>
                    <Text style={styles.compactSymbol}>{language.flag}</Text>
                    <Text style={[styles.compactCode, { color: theme.colors.text }]}>
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
                Select Currency
              </Text>
              <SelectionGrid
                items={availableCurrencies}
                selectedValue={settings.currency}
                onSelect={handleCurrencySelect}
                theme={theme}
                renderItem={(currency: any) => (
                  <>
                    <Text style={styles.compactSymbol}>{currency.symbol}</Text>
                    <Text style={[styles.compactCode, { color: theme.colors.text }]}>
                      {currency.code}
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
                {showProfileSettings ? 'Profile Configuration' : 'Prank Configuration'}
              </Text>
              
              {showProfileSettings ? (
                <>
                  <InputContainer
                    label="Profile Name"
                    value={tempProfileName}
                    onChangeText={setTempProfileName}
                    placeholder="Enter profile name"
                    theme={theme}
                  />
                  
                  <InputContainer
                    label="Location"
                    value={tempProfileLocation}
                    onChangeText={setTempProfileLocation}
                    placeholder="Enter location"
                    theme={theme}
                  />
                  
                  <InputContainer
                    label={`Total Balance (${settings.currency})`}
                    value={tempProfileBalance}
                    onChangeText={setTempProfileBalance}
                    keyboardType="numeric"
                    placeholder="Enter balance"
                    theme={theme}
                  />
                </>
              ) : (
                <>
                  <InputContainer
                    label="Receiver Name"
                    value={tempReceiverName}
                    onChangeText={setTempReceiverName}
                    placeholder="Enter receiver name"
                    theme={theme}
                  />
                  
                  <InputContainer
                    label={`Default Amount (${settings.currency})`}
                    value={tempAmount}
                    onChangeText={setTempAmount}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    theme={theme}
                  />
                  
                  <InputContainer
                    label="Receiver Photo"
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
                    label="Request Sound"
                    theme={theme}
                  >
                    <TouchableOpacity 
                      style={[styles.soundButton, { 
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                      }]}
                      onPress={() => {
                        updateSettings({ requestSound: 'a-pay.mp3' });
                        Alert.alert('Sound Selected', 'A-Pay sound will play on Request');
                      }}
                    >
                      <Text style={[styles.soundButtonText, { color: theme.colors.text }]}>
                        {settings.requestSound || 'Select Sound'}
                      </Text>
                    </TouchableOpacity>
                  </InputContainer>
                  
                  <InputContainer
                    label="Types of Laughter"
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
                  {showProfileSettings ? 'Save Profile' : 'Save Settings'}
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
                  Close
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
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  © 2024 Premium Bank. All rights reserved.
                </Text>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  Made with ❤️ for secure banking
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
    height: 88,
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 16,
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
  content: {
    flex: 1,
    marginTop: 88,
    paddingHorizontal: 20,
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
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactGridItem: {
    width: '48%',
  },
  compactOption: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
  },
  compactSymbol: {
    fontSize: 20,
    marginBottom: 4,
  },
  compactCode: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  compactSelectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
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
});
