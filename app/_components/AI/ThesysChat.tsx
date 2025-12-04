"use client";

import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

interface ThesysChatProps {
  userName?: string | null;
}

// TaskFlow color scheme matching globals.css
// Uses the correct Theme interface from @crayonai/react-ui
const taskflowTheme = {
  // Backgrounds
  backgroundFills: "#0b0f20", // --color-background-700
  containerFills: "#121a33", // --color-background-600
  sunkFills: "#192444", // --color-background-500
  elevatedFills: "#0e1327", // --color-background-650
  overlayFills: "rgba(11, 15, 32, 0.9)",
  invertedFills: "#ffffff",

  // Text colors
  primaryText: "#c5d1e1", // --color-text-low
  secondaryText: "#6b7280", // --color-text-gray
  disabledText: "#3a455b", // --color-text-medium
  linkText: "#3399ff", // --color-primary-500

  // Accent/Brand colors
  accentPrimaryText: "#3399ff", // --color-primary-500
  accentSecondaryText: "#56b3ff", // --color-primary-400
  brandText: "#3399ff", // --color-primary-500
  brandSecondaryText: "#56b3ff", // --color-primary-400

  // Status colors
  successPrimaryText: "#00c853", // --color-success
  dangerPrimaryText: "#cf6679", // --color-error
  infoPrimaryText: "#2d89e6", // --color-info
  alertPrimaryText: "#ffd600", // --color-warning

  // Interactive elements
  interactiveDefault: "#192444", // --color-background-500
  interactiveHover: "#121a33", // --color-background-600
  interactivePressed: "#0e1327",
  interactiveAccent: "#3399ff", // --color-primary-500
  interactiveAccentHover: "#2d89e6", // --color-primary-600
  interactiveAccentPressed: "#2779cc", // --color-primary-700

  // Strokes/borders
  strokeDefault: "#16426b", // --color-divider
  strokeInteractiveEl: "#192444",
  strokeEmphasis: "#3399ff",
  strokeAccent: "#3399ff",
  strokeSuccess: "#00c853",
  strokeDanger: "#cf6679",
  strokeInfo: "#2d89e6",

  // Chat specific
  chatContainerBg: "#0b0f20",
  chatAssistantResponseBg: "#121a33",
  chatAssistantResponseText: "#c5d1e1",
  chatUserResponseBg: "rgba(51, 153, 255, 0.1)",
  chatUserResponseText: "#c5d1e1",

  // Fills for various states
  successFills: "rgba(0, 200, 83, 0.15)",
  dangerFills: "rgba(207, 102, 121, 0.15)",
  infoFills: "rgba(45, 137, 230, 0.15)",
  alertFills: "rgba(255, 214, 0, 0.15)",

  // Highlight
  highlightSubtle: "rgba(51, 153, 255, 0.1)",
  highlightStrong: "rgba(51, 153, 255, 0.25)",

  // Chart colors
  defaultChartPalette: [
    "#3399ff", // primary
    "#ff944d", // accent
    "#00c853", // success
    "#a0d8ff", // primary-200
    "#ffd600", // warning
    "#cf6679", // error
  ],

  // Rounded corners
  roundedS: "0.5rem",
  roundedM: "0.75rem",
  roundedL: "1rem",
  roundedXl: "1.5rem",
};

export default function ThesysChat({ userName }: ThesysChatProps) {
  return (
    <ThemeProvider mode="dark" theme={taskflowTheme}>
      <div className="flex flex-col h-full w-full thesys-chat-wrapper">
        <C1Chat
          apiUrl="/api/ai/thesys"
          formFactor="full-page"
          agentName="TaskFlow AI"
          logoUrl="/logo.png"
          scrollVariant="always"
          onAction={(event) => {
            console.log("C1Chat action:", event);
          }}
        />
        {userName && <div className="sr-only">Logged in as {userName}</div>}
      </div>
    </ThemeProvider>
  );
}
