// expo-crypto is native-only; back it with Node's crypto so id generation works under jest.
jest.mock('expo-crypto', () => ({ randomUUID: () => require('crypto').randomUUID() }));

// Icon fonts are native assets; render icons as an empty element under jest.
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const Icon = () => require('react').createElement(View);
  return { Ionicons: Icon };
});
