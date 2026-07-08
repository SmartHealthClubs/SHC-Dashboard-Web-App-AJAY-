import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Bridges PrimeNG's design tokens to the SHC brand tokens in
 * src/styles/tokens.css (--color-brand-blue etc.) so PrimeNG components
 * (p-selectButton, p-select, p-tag, p-dialog, p-chart, ...) render in the
 * same brand as the hand-styled layout/cards, instead of Aura's stock blue.
 *
 * Brand tokens: blue #3D8FED (primary), orange #FF914D (CTA only — NOT
 * mapped to primary, used explicitly per-component e.g. Front Desk board's
 * "Jump to Calendar" button), navy #1E2F51 (text), cyan #43C1E8 (accent).
 *
 * The primary/blue 50-950 ramp below is a hand-built approximation around
 * the brand blue (500 = the exact brand hex) — refine with real design
 * tokens if SHC produces an official tint/shade scale later.
 */
export const ShcPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef6fe',
      100: '#dcedfd',
      200: '#b9dbfb',
      300: '#8ec6f8',
      400: '#64aef4',
      500: '#3d8fed',
      600: '#2f74c9',
      700: '#245ba0',
      800: '#1a4478',
      900: '#123058',
      950: '#0b1d38',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#3d8fed',
          contrastColor: '#ffffff',
          hoverColor: '#2f74c9',
          activeColor: '#245ba0',
        },
        text: {
          color: '#1e2f51',
          hoverColor: '#1e2f51',
          mutedColor: '#555a5b',
        },
        surface: {
          0: '#ffffff',
          50: '#f0f4f6',
          100: '#e1e8ec',
        },
        content: {
          background: '#ffffff',
          borderColor: '#e1e8ec',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '0.625rem',
          },
        },
      },
    },
    selectbutton: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '9999px',
          },
        },
      },
    },
    // Select's own trigger chrome is stripped back to nothing by
    // .pill-select-host in styles.css (location-switcher / period-control
    // own the actual pill border/bg so an icon can sit inside the same
    // box) — but the dropdown OVERLAY is a separate floating panel that
    // scoped CSS can't reach, so its shape/colors and the option
    // hover/selected states have to be themed here instead.
    select: {
      colorScheme: {
        light: {
          overlay: {
            background: '#ffffff',
            borderColor: '#e1e8ec',
            borderRadius: '0.875rem',
          },
          option: {
            focusBackground: '#f0f4f6',
            focusColor: '#1e2f51',
            selectedBackground: '#dafbff',
            selectedColor: '#1e2f51',
            selectedFocusBackground: '#dafbff',
            selectedFocusColor: '#1e2f51',
          },
        },
      },
    },
    // Role switcher's "Demo control" panel — shadcn's DropdownMenuContent
    // equivalent (rounded-lg card, subtle border, matching item hover).
    popover: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            borderColor: '#e1e8ec',
            borderRadius: '0.875rem',
          },
        },
      },
    },
  },
});
