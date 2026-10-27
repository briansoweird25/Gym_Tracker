// expo-crypto is native-only; back it with Node's crypto so id generation works under jest.
jest.mock('expo-crypto', () => ({ randomUUID: () => require('crypto').randomUUID() }));
