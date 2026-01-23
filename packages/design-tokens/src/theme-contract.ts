export interface ThemeColors {
  primary: string;
  onPrimary?: string;

  surface: string;
  background: string;

  text: {
    primary: string;
    secondary: string;
  };

  gradient?: {
    day: readonly [string, string];
    dusk: readonly [string, string];
  };
}
