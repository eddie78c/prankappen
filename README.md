# PrankBank - Ultimate Prank Banking App

A hilarious banking app with built-in prank features that combines financial management with sound-based pranks. Perfect for fooling friends and having fun!

## 🎭 Features

### Core Banking Features
- **Dashboard**: View your balance, monthly income, and recent transactions
- **Transaction History**: Track all your money movements
- **Cards Management**: Manage your virtual cards
- **Profile**: Personal account settings
- **Settings**: App configuration and preferences

### Prank Features
- **Farts Page**: 12+ fart sound buttons with scheduling capabilities
- **Knock Door Page**: Door knock sounds for surprise pranks
- **Sound Scheduling**: Schedule sounds to play at specific times with repeat options
- **Custom Sounds**: Upload your own audio files for personalized pranks
- **Real-time Queue**: Monitor scheduled sound plays with countdown timers

### Advanced Features
- **Multi-language Support**: Available in 20+ languages
- **Dark/Light Theme**: Automatic theme switching
- **Sound Management**: Background audio playback with proper cleanup
- **Responsive Design**: Works on mobile and web platforms

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd prankappen
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
- **Web**: Press `w` in the terminal
- **iOS**: Press `i` (requires Xcode)
- **Android**: Press `a` (requires Android Studio)

## 📱 Usage

### Basic Navigation
- Use the bottom tab bar to navigate between main sections
- Access prank features through the menu button (☰) in the top-left corner

### Prank Features
1. **Access Prank Pages**:
   - Tap the menu button on the main dashboard
   - Select "Farts" or "Knock Door" from the dropdown

2. **Play Sounds**:
   - Tap any sound button to play immediately
   - Hold for 2 seconds to schedule playback

3. **Schedule Sounds**:
   - Set delay time (minutes/seconds)
   - Configure repeat count and interval
   - Monitor scheduled sounds in the queue

4. **Custom Sounds**:
   - Use the last 4 buttons on each prank page
   - First tap opens file picker
   - Subsequent taps play your uploaded sound

### Sound Scheduling
- **Delay**: Time before first play
- **Repeat**: Number of times to play the sound
- **Interval**: Time between repeats
- **Queue**: View and cancel scheduled sounds

## 🛠️ Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and SDK
- **Expo Router**: File-based routing
- **React Native Reanimated**: Smooth animations
- **Expo AV**: Audio playback
- **Expo Document Picker**: File selection
- **Lucide React Native**: Beautiful icons
- **i18n**: Internationalization support

## 📁 Project Structure

```
prankappen/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   ├── index.tsx      # Main dashboard
│   │   ├── history.tsx    # Transaction history
│   │   ├── cards.tsx      # Cards management
│   │   ├── profile.tsx    # User profile
│   │   └── settings.tsx   # App settings
│   ├── farts.tsx          # Farts prank page
│   ├── knock.tsx          # Knock door prank page
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── GlassCard.tsx      # Glass morphism card
│   ├── SwipeableTransaction.tsx
│   ├── TransactionIcon.tsx
│   └── ...
├── contexts/              # React contexts
│   ├── ThemeContext.tsx   # Theme management
│   ├── LanguageContext.tsx # Language switching
│   └── PrankContext.tsx   # App state management
├── assets/                # Static assets
│   ├── sounds/            # Audio files
│   └── images/            # Images
├── i18n/                  # Internationalization
├── utils/                 # Utility functions
└── types/                 # TypeScript definitions
```

## 🎨 Customization

### Adding New Sounds
1. Place audio files in `assets/sounds/`
2. Update the sound references in the prank pages
3. Ensure files are in supported formats (MP3, WAV, etc.)

### Theming
- Modify colors in `contexts/ThemeContext.tsx`
- Add new themes by extending the theme object
- Use theme colors throughout components

### Languages
- Add new language files in `i18n/`
- Update `localization/languages.ts`
- Follow the existing translation key structure

## 🔧 Configuration

### Environment Variables
Create a `.env` file for sensitive configurations:
```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_APP_NAME=PrankBank
```

### Build Configuration
Modify `app.json` for build settings:
```json
{
  "expo": {
    "name": "PrankBank",
    "slug": "prankbank",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Audio not playing**:
- Check device volume
- Ensure audio permissions are granted
- Verify audio file formats

**Scheduling not working**:
- Check device time settings
- Ensure app has background permissions
- Verify timer cleanup on app close

**Theme not switching**:
- Clear app cache
- Restart the app
- Check theme context implementation

### Performance Tips
- Limit concurrent audio playback
- Clean up timers on component unmount
- Use proper key props for list rendering
- Optimize image assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Test on multiple platforms
- Maintain code documentation
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This app is intended for entertainment purposes only. Use prank features responsibly and with consent from others. The developers are not responsible for any misuse or consequences arising from the use of prank features.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern banking apps
- Sound effects from various free sources
- React Native and Expo communities

---

Made with ❤️ and lots of 😂 for prank enthusiasts everywhere!
