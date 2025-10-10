import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { getMockUserData } from '../../data/mockData';
import GlassCard from '../../components/GlassCard';
import { CreditCard, Eye, EyeOff, Plus, Settings, Trash2 } from 'lucide-react-native';

export default function CardsScreen() {
  const { theme } = useTheme();
  const { translations, currentLanguage } = useLanguage();
  const { settings } = usePrank();
  const [selectedCard, setSelectedCard] = useState(0);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    contactless: true,
    online: false,
    atm: true,
  });
  const mockData = getMockUserData(currentLanguage, settings.receiverName);
  const [cards, setCards] = useState(mockData.cards);
  const scrollRef = useRef<ScrollView>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<any>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { width } = Dimensions.get('window');

  // Scroll to top when this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 0);
      return undefined;
    }, [])
  );

  const addNewCard = () => {
    const generateCardNumber = () => {
      const groups = [];
      for (let i = 0; i < 4; i++) {
        groups.push(Math.floor(Math.random() * 9000 + 1000).toString());
      }
      return groups.join(' ');
    };

    const newCard = {
      id: (cards.length + 1).toString(),
      typeKey: 'virtualCard',
      number: generateCardNumber(),
      holder: settings.receiverName,
      expiry: `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${(new Date().getFullYear() + 2).toString().slice(-2)}`,
      cvv: (Math.floor(Math.random() * 900) + 100).toString(),
      isActive: true,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const handleLongPressStart = (card: any) => {
    if (card.typeKey === 'virtualCard') {
      const timer = setTimeout(() => {
        setCardToDelete(card);
        setShowDeleteModal(true);
      }, 2000);
      setLongPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const createSwipeHandler = (cardIndex: number) => (event: any) => {
    const { translationX, state } = event.nativeEvent;
    if (state === State.END) {
      const currentCards = cards.filter(card => selectedCard === 0 ? card.typeKey === 'physicalCard' : card.typeKey === 'virtualCard');

      if (Math.abs(translationX) > width * 0.3) {
        if (translationX > 0 && cardIndex > 0) {
          // Swipe right - go to previous card
          setSelectedCard(cardIndex - 1);
        } else if (translationX < 0 && cardIndex < currentCards.length - 1) {
          // Swipe left - go to next card
          setSelectedCard(cardIndex + 1);
        }
      }
    }
  };

  const renderCard = (card: any, index: number) => (
    <Animated.View
      key={card.id}
      entering={FadeInRight.delay(index * 200).springify()}
    >
      <PanGestureHandler onGestureEvent={createSwipeHandler(index)} onHandlerStateChange={createSwipeHandler(index)}>
        <View style={styles.gestureContainer}>
          <TouchableOpacity
            onPress={() => setSelectedCard(index)}
            onLongPress={() => handleLongPressStart(card)}
            onPressOut={handleLongPressEnd}
            delayLongPress={2000}
            style={[
              styles.cardContainer,
              selectedCard === index && styles.selectedCard,
            ]}
          >
            <LinearGradient
              colors={[card.color, card.color + '80']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{translations[card.typeKey as keyof typeof translations]}</Text>
                <Text style={styles.visa}>VISA</Text>
              </View>

              <View style={styles.cardNumber}>
                <Text style={styles.numberText}>
                  {showCardNumber ? card.number : '**** **** **** ' + card.number.slice(-4)}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>{translations.cardHolder}</Text>
                  <Text style={styles.cardValue}>{card.holder}</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>{translations.expires}</Text>
                  <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>{translations.cvv}</Text>
                  <Text style={styles.cardValue}>
                    {showCardNumber ? card.cvv : '***'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );

  const renderSettingItem = (icon: React.ReactNode, title: string, key: string, index: number) => (
    <Animated.View
      key={key}
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            {icon}
          </View>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <Switch
          value={cardSettings[key as keyof typeof cardSettings]}
          onValueChange={(value) =>
            setCardSettings(prev => ({ ...prev, [key]: value }))
          }
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={cardSettings[key as keyof typeof cardSettings] ? theme.colors.secondary : theme.colors.surface}
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translations.yourCards}
        </Text>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Card Tabs */}
        <View style={styles.cardTabs}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                {
                  backgroundColor: selectedCard === 0 ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedCard(0)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedCard === 0 ? theme.colors.surface : theme.colors.text },
                ]}
              >
                {translations.physicalCard}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                {
                  backgroundColor: selectedCard === 1 ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedCard(1)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedCard === 1 ? theme.colors.surface : theme.colors.text },
                ]}
              >
                {translations.virtualCard}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Cards Display */}
        <View style={styles.cardsSection}>
          {cards.filter(card => selectedCard === 0 ? card.typeKey === 'physicalCard' : card.typeKey === 'virtualCard').map(renderCard)}

          <Animated.View entering={FadeInDown.delay(600)}>
            <TouchableOpacity style={[styles.addCard, { backgroundColor: theme.colors.surface }]} onPress={addNewCard}>
              <Plus size={24} color={theme.colors.primary} />
              <Text style={[styles.addCardText, { color: theme.colors.primary }]}>
                {translations.addNewCard}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Card Visibility Toggle */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.visibilitySection}>
          <TouchableOpacity
            style={[styles.visibilityButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowCardNumber(!showCardNumber)}
          >
            {showCardNumber ? (
              <EyeOff size={20} color={theme.colors.text} />
            ) : (
              <Eye size={20} color={theme.colors.text} />
            )}
            <Text style={[styles.visibilityText, { color: theme.colors.text }]}>
              {showCardNumber ? translations.hideCardDetails : translations.showCardDetails}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Card Settings */}
        <View style={styles.settingsSection}>
          <Animated.View entering={FadeInDown.delay(800)}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {translations.cardSettings}
            </Text>
          </Animated.View>
          
          {renderSettingItem(
            <CreditCard size={20} color={theme.colors.primary} />,
            translations.contactlessPayment || 'Contactless Payment',
            'contactless',
            0
          )}
          {renderSettingItem(
            <Settings size={20} color={theme.colors.primary} />,
            translations.onlinePayment || 'Online Payment',
            'online',
            1
          )}
          {renderSettingItem(
            <CreditCard size={20} color={theme.colors.primary} />,
            translations.atmWithdraws || 'ATM Withdraws',
            'atm',
            2
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModal, { backgroundColor: theme.colors.surface }]}>
            <Trash2 size={48} color={theme.colors.error || '#ef4444'} style={{ marginBottom: 16 }} />
            <Text style={[styles.deleteTitle, { color: theme.colors.text }]}>
              {translations.delete || 'Delete Card'}
            </Text>
            <Text style={[styles.deleteMessage, { color: theme.colors.textSecondary }]}>
              {translations.confirmDelete || 'Are you sure you want to delete this virtual card?'}
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.text }]}>
                  {translations.cancel || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, styles.confirmButton, { backgroundColor: theme.colors.error || '#ef4444' }]}
                onPress={() => cardToDelete && deleteCard(cardToDelete.id)}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.surface }]}>
                  {translations.delete || 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
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
  gestureContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 0,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardsSection: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  card: {
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  visa: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  cardNumber: {
    marginVertical: 20,
  },
  numberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addCard: {
    height: 80,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 8,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  visibilitySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
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
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmButton: {
    // backgroundColor is set inline
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});