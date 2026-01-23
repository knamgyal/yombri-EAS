import { GlassToken } from './theme-contract';

const rawGlassTokens = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    blurAmount: 10,
  },
  dark: {
    backgroundColor: 'rgba(17, 24, 39, 0.7)', // Slate 900 equivalent
    borderColor: 'rgba(255, 255, 255, 0.1)',
    blurAmount: 20,
  },
};

export const glassTokens = {
  light: rawGlassTokens.light satisfies GlassToken,
  dark: rawGlassTokens.dark satisfies GlassToken,
};
