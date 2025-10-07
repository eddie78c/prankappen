import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, X, Clock, Wallet, History, CreditCard, User, Settings } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function FartsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [customSounds, setCustomSounds] = React.useState<string[]>(['', '', '', '']);
  const [queue, setQueue] = React.useState<any[]>([]);
  const [showPopup, setShowPopup] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [delayMinutes, setDelayMinutes] = React.useState(0);
  const [delaySeconds, setDelaySeconds] = React.useState(0);
  const [times, setTimes] = React.useState(1);
  const [intervalSeconds, setIntervalSeconds] = React.useState(5);
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  const timersRef = React.useRef<{ [key: string]: any }>({});

  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
      // Clean up all timers on unmount
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

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

  const playSoundUri = async (uri: any) => {
    try {
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
    let soundUri: any = require('@/assets/sounds/farts/fart-4.mp3');

    if (index >= 12) {
      const customIndex = index - 12;
      if (customSounds[customIndex]) {
        soundUri = { uri: customSounds[customIndex] };
      } else {
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
          });
          if (result.type === 'success' && result.uri) {
            setCustomSounds(prev => {
              const newSounds = [...prev];
              newSounds[customIndex] = result.uri!;
              return newSounds;
            });
            soundUri = { uri: result.uri };
          } else {
            return;
          }
        } catch (error) {
          console.log('Error picking document:', error);
          return;
        }
      }
    }

    await playSoundUri(soundUri);
  };

  const scheduleSound = () => {
    const delay = (delayMinutes * 60 + delaySeconds) * 1000;
    const numTimes = times;
    const interval = intervalSeconds * 1000;
    const soundUri = selectedIndex >= 12 ? { uri: customSounds[selectedIndex - 12] } : require('@/assets/sounds/farts/fart-4.mp3');
    const name = selectedIndex >= 12 ? `Custom ${selectedIndex - 11}` : `Fart ${selectedIndex + 1}`;
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

    // Reset values for next schedule
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
          // Update queue with remaining times and next play time FROM NOW
          setQueue(prev => prev.map(q => {
            if (q.id === id) {
              return {
                ...q,
                remainingTimes: remaining,
                nextPlayTime: Date.now() + interval,
                isWaitingForFirst: false
              };
            }
            return q;
          }));
        } else {
          // No more repeats, remove from queue
          if (timersRef.current[id]) {
            clearInterval(timersRef.current[id]);
            delete timersRef.current[id];
          }
          setQueue(prev => prev.filter(q => q.id !== id));
        }
      };
      
      // Play first sound immediately when delay is done
      playNext();
      
      // If more than 1 time, schedule the rest with interval
      if (numTimes > 1) {
        const timer = setInterval(playNext, interval);
        timersRef.current[id] = timer;
      }
    }, delay);
    
    timersRef.current[id + '_initial'] = initialTimeout;
  };

  const renderFartButton = (index: number) => {
    const isCustom = index >= 12;
    const label = isCustom ? `Custom ${index - 11}` : `Fart ${index + 1}`;
    const iconColor = isCustom ? '#FF6B35' : theme.colors.primary;
    const iconBg = isCustom ? '#FF6B3515' : theme.colors.primary + '15';
    const borderColor = isCustom ? '#FF6B3540' : theme.colors.primary + '40';
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.fartButton, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: borderColor,
            borderWidth: 1.5,
          }
        ]}
        onPress={() => playSound(index)}
        onLongPress={() => {
          setSelectedIndex(index);
          setShowPopup(true);
        }}
        delayLongPress={2000}
      >
        <View style={[styles.buttonIcon, { backgroundColor: iconBg }]}>
          <Text style={[styles.buttonEmoji, { color: iconColor }]}>💨</Text>
        </View>
        <Text style={[styles.buttonLabel, { color: theme.colors.text }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Farts
        </Text>
      </View>

      {/* Scheduled Queue */}
      {queue.length > 0 && (
        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <Clock size={16} color={theme.colors.primary} />
            <Text style={[styles.queueHeaderText, { color: theme.colors.text }]}>
              Scheduled Sounds
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.queueContainer}
            contentContainerStyle={styles.queueContent}
          >
            {queue.map(item => {
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
                    style={styles.queueClose}
                    onPress={() => {
                      // Clear timers
                      if (timersRef.current[item.id]) {
                        clearInterval(timersRef.current[item.id]);
                        delete timersRef.current[item.id];
                      }
                      if (timersRef.current[item.id + '_initial']) {
                        clearTimeout(timersRef.current[item.id + '_initial']);
                        delete timersRef.current[item.id + '_initial'];
                      }
                      setQueue(prev => prev.filter(q => q.id !== item.id));
                    }}
                  >
                    <X size={14} color={theme.colors.error} />
                  </TouchableOpacity>
                  
                  <View style={[styles.queueIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={styles.queueIcon}>💨</Text>
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
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Choose your fart sound!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text + '80' }]}>
            Tap to play • Hold 2s to schedule
          </Text>

          <View style={styles.buttonsGrid}>
            {Array.from({ length: 12 }, (_, i) => renderFartButton(i))}
          </View>

          <View style={styles.customSection}>
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.text + '60' }]}>
                Custom Sounds
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={styles.buttonsGrid}>
              {Array.from({ length: 4 }, (_, i) => renderFartButton(i + 12))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Popup Modal */}
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
                {selectedIndex >= 12 ? `Custom ${selectedIndex - 11}` : `Fart ${selectedIndex + 1}`}
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
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]} 
                onPress={() => setShowPopup(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.scheduleButton, { backgroundColor: theme.colors.primary }]} 
                onPress={scheduleSound}
              >
                <Clock size={16} color="#FFFFFF" />
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/') }>
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
    zIndex: 100,
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
    position: 'absolute',
    left: 56,
    right: 20,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fartButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    width: '23%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  buttonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonEmoji: {
    fontSize: 26,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  customSection: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  queueHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueContainer: {
    flexGrow: 0,
  },
  queueContent: {
    paddingRight: 20,
  },
  queueCard: {
    padding: 12,
    marginRight: 10,
    borderRadius: 14,
    minWidth: 130,
    borderWidth: 1.5,
    position: 'relative',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    padding: 0,
    borderRadius: 20,
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 1000,
  },
  popupHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  popupIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  popupContent: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  selectorRow: {
    marginBottom: 10,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectorValueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 40,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  modalButton: {
    padding: 11,
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
    borderColor: 'rgba(0,0,0,0.1)',
  },
  scheduleButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});