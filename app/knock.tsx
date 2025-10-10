import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrank } from '@/contexts/PrankContext';
import { ArrowLeft, X, Clock, Wallet, History, CreditCard, User, Settings } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const BUTTON_COUNT_PER_ROW = SCREEN_WIDTH < 380 ? 3 : 4;
const BUTTON_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - (GRID_GAP * (BUTTON_COUNT_PER_ROW - 1))) / BUTTON_COUNT_PER_ROW;

export default function KnockScreen() {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { settings, addCustomSound, removeCustomSound } = usePrank();
  const router = useRouter();
  
  const [queue, setQueue] = React.useState<any[]>([]);
  const [showPopup, setShowPopup] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [delayMinutes, setDelayMinutes] = React.useState(0);
  const [delaySeconds, setDelaySeconds] = React.useState(0);
  const [times, setTimes] = React.useState(1);
  const [intervalSeconds, setIntervalSeconds] = React.useState(5);
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  
  const timersRef = React.useRef<{ [key: string]: any }>({});

  const pickCustomSoundForIndex = async (customIndex: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.type === 'success' && result.uri) {
        await addCustomSound(result.uri, customIndex);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  const playSoundUri = async (uri: any) => {
    try {
      // Avoid blob URIs on web which can cause ERR_FILE_NOT_FOUND
      if (Platform.OS === 'web' && uri && typeof uri === 'object' && uri.uri && uri.uri.startsWith('blob:')) {
        Alert.alert('Web audio', 'Custom local audio is not supported on web preview. Using default sound instead.');
        uri = require('../assets/sounds/a-pay.mp3');
      }
      const { sound } = await Audio.Sound.createAsync(uri);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const playSound = async (index: number) => {
    let soundUri: any = require('../assets/sounds/a-pay.mp3');

    if (index >= 12) {
      const customIndex = index - 12;
      if (settings.customSounds[customIndex]) {
        soundUri = { uri: settings.customSounds[customIndex] };
      } else {
        // No sound uploaded, do nothing
        return;
      }
    }

    await playSoundUri(soundUri);
  };

  const scheduleSound = () => {
    const delay = (delayMinutes * 60 + delaySeconds) * 1000;
    const numTimes = times;
    const interval = intervalSeconds * 1000;
    const soundUri = selectedIndex >= 12 
      ? { uri: settings.customSounds[selectedIndex - 12] } 
      : require('../assets/sounds/a-pay.mp3');
    const name = selectedIndex >= 12 ? `Custom Knock ${selectedIndex - 11}` : `Knock ${selectedIndex + 1}`;
    const id = Date.now() + Math.random();

    const item = { 
      id, 
      soundUri, 
      delay, 
      numTimes, 
      interval, 
      name,
      remainingTimes: numTimes,
      nextPlayTime: Date.now() + delay,
      isWaitingForFirst: true
    };
    
    setQueue(prev => [...prev, item]);
    setShowPopup(false);
    setDelayMinutes(0);
    setDelaySeconds(0);
    setTimes(1);
    setIntervalSeconds(5);

    const initialTimeout = setTimeout(() => {
      let count = 0;
      
      const playNext = () => {
        playSoundUri(soundUri);
        count++;
        const remaining = numTimes - count;
        
        if (remaining > 0) {
          setQueue(prev => prev.map(q => 
            q.id === id 
              ? { ...q, remainingTimes: remaining, nextPlayTime: Date.now() + interval, isWaitingForFirst: false }
              : q
          ));
        } else {
          if (timersRef.current[id]) {
            clearInterval(timersRef.current[id]);
            delete timersRef.current[id];
          }
          setQueue(prev => prev.filter(q => q.id !== id));
        }
      };
      
      playNext();
      
      if (numTimes > 1) {
        const timer = setInterval(playNext, interval);
        timersRef.current[id] = timer;
      }
    }, delay);
    
    timersRef.current[id + '_initial'] = initialTimeout;
  };

  const cancelScheduledSound = (itemId: any) => {
    if (timersRef.current[itemId]) {
      clearInterval(timersRef.current[itemId]);
      delete timersRef.current[itemId];
    }
    if (timersRef.current[itemId + '_initial']) {
      clearTimeout(timersRef.current[itemId + '_initial']);
      delete timersRef.current[itemId + '_initial'];
    }
    setQueue(prev => prev.filter(q => q.id !== itemId));
  };

  const renderSelector = (label: string, value: number, setValue: (v: number) => void, min: number, max: number, step: number = 1) => (
    <View style={styles.selectorRow}>
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.selector}>
        <TouchableOpacity 
          onPress={() => setValue(Math.max(min, value - step))} 
          style={[styles.selectorButton, { backgroundColor: theme.colors.primary + '15' }]}
        >
          <Text style={[styles.selectorText, { color: theme.colors.primary }]}>−</Text>
        </TouchableOpacity>
        <View style={[styles.selectorValueContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.selectorValue, { color: theme.colors.text }]}>{value}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setValue(Math.min(max, value + step))} 
          style={[styles.selectorButton, { backgroundColor: theme.colors.primary + '15' }]}
        >
          <Text style={[styles.selectorText, { color: theme.colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderKnockButton = (index: number) => {
    const isCustom = index >= 12;
    const customIndex = index - 12;
    const hasCustomSound = isCustom && settings.customSounds[customIndex];
    const label = isCustom ? `Custom ${index - 11}` : `Knock ${index + 1}`;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.knockButton,
          {
            width: BUTTON_WIDTH,
            backgroundColor: theme.colors.surface,
            borderColor: isCustom ? '#FF6B3540' : theme.colors.primary + '40',
          }
        ]}
        onPress={() => playSound(index)}
        onLongPress={() => {
          if (isCustom) {
            if (hasCustomSound) {
              pickCustomSoundForIndex(customIndex);
            } else {
              setSelectedIndex(index);
              setShowPopup(true);
            }
          } else {
            setSelectedIndex(index);
            setShowPopup(true);
          }
        }}
        delayLongPress={2000}
      >
        <View style={[
          styles.buttonIcon, 
          { backgroundColor: isCustom ? '#FF6B3515' : theme.colors.primary + '15' }
        ]}>
          <Text style={[styles.buttonEmoji, { color: isCustom ? '#FF6B35' : theme.colors.primary }]}>
            🚪
          </Text>
        </View>
        <Text style={[styles.buttonLabel, { color: theme.colors.text }]}>{label}</Text>
        {isCustom && hasCustomSound && (
          <>
            <View style={[styles.deleteIndicator, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.deleteText}>{translations.replaceSound || 'REP'}</Text>
            </View>
            <View style={styles.playIndicator}>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => playSound(index)}
              >
                <Text style={styles.playIcon}>▶️</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderQueueCard = (item: any) => {
    const timeLeft = Math.max(0, Math.ceil((item.nextPlayTime - currentTime) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return (
      <View 
        key={item.id} 
        style={[
          styles.queueCard, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary + '30',
          }
        ]}
      >
        <TouchableOpacity 
          style={[styles.queueClose, { backgroundColor: theme.colors.error + '20' }]}
          onPress={() => cancelScheduledSound(item.id)}
        >
          <X size={14} color={theme.colors.error} />
        </TouchableOpacity>
        
        <View style={[styles.queueIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={styles.queueIcon}>🚪</Text>
        </View>
        
        <Text style={[styles.queueName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={[styles.queueTimeBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <Clock size={10} color={theme.colors.primary} />
          <Text style={[styles.queueTimeText, { color: theme.colors.primary }]}>
            {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
          </Text>
        </View>
        
        <Text style={[styles.queueRepeat, { color: theme.colors.text + '80' }]}>
          {item.remainingTimes}x left
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Knock Door
        </Text>
      </View>

      {/* Scheduled Queue */}
      {queue.length > 0 && (
        <View style={[styles.queueSection, { backgroundColor: theme.colors.background }]}>
          <View style={styles.queueHeader}>
            <Clock size={16} color={theme.colors.primary} />
            <Text style={[styles.queueHeaderText, { color: theme.colors.text }]}>
              Scheduled Sounds
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.queueContent}
          >
            {queue.map(renderQueueCard)}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Choose your knock sound!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text + '80' }]}>
            Tap to play • Hold 2s to schedule
          </Text>

          <View style={styles.buttonsGrid}>
            {Array.from({ length: 12 }, (_, i) => renderKnockButton(i))}
          </View>

          <View style={styles.customSection}>
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.text + '60' }]}>
                Custom Knocks
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={styles.buttonsGrid}>
              {Array.from({ length: 4 }, (_, i) => renderKnockButton(i + 12))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Schedule Modal */}
      {showPopup && (
        <>
          <TouchableOpacity 
            style={styles.popupOverlay} 
            onPress={() => setShowPopup(false)}
            activeOpacity={1}
          />
          <View style={[styles.popup, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.popupHeader}>
              <View style={[styles.popupIconBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Clock size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Schedule Sound
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.text + '60' }]}>
                {selectedIndex >= 12 ? `Custom Knock ${selectedIndex - 11}` : `Knock ${selectedIndex + 1}`}
              </Text>
            </View>

            <View style={styles.popupContent}>
              {renderSelector('Delay (minutes)', delayMinutes, setDelayMinutes, 0, 10)}
              {renderSelector('Delay (seconds)', delaySeconds, setDelaySeconds, 0, 60, 5)}
              {renderSelector('Repeat times', times, setTimes, 1, 10)}
              {renderSelector('Interval (seconds)', intervalSeconds, setIntervalSeconds, 5, 60, 5)}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.scheduleButton, { backgroundColor: theme.colors.primary }]}
                onPress={scheduleSound}
              >
                <Clock size={16} color="#FFFFFF" />
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Wallet size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/history')}>
          <History size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/cards')}>
          <CreditCard size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <User size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/settings')}>
          <Settings size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: GRID_PADDING,
    paddingBottom: 80,
  },
  title: {
    fontSize: SCREEN_WIDTH < 380 ? 22 : 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH < 380 ? 13 : 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  knockButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 0,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  buttonIcon: {
    width: BUTTON_WIDTH * 0.6,
    height: BUTTON_WIDTH * 0.6,
    borderRadius: BUTTON_WIDTH * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonEmoji: {
    fontSize: BUTTON_WIDTH * 0.35,
  },
  buttonLabel: {
    fontSize: SCREEN_WIDTH < 380 ? 10 : 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  customSection: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueSection: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  queueHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueContent: {
    paddingRight: 16,
    gap: 10,
  },
  queueCard: {
    padding: 12,
    borderRadius: 14,
    minWidth: 120,
    maxWidth: 140,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  queueClose: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  queueIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueIcon: {
    fontSize: 18,
  },
  queueName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  queueTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  queueTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  queueRepeat: {
    fontSize: 10,
    fontWeight: '500',
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  popup: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    transform: [{ translateY: -125 }],
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 1000,
  },
  popupHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  popupIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  popupContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  selectorRow: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 20,
    fontWeight: '600',
  },
  selectorValueContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 12,
    minWidth: 50,
  },
  selectorValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    padding: 14,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  scheduleButton: {},
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 76 : 56,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIndicator: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  playButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  deleteIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});