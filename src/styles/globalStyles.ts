import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', Arial, Helvetica, sans-serif;
    background-color: #000;
    color: #fff;
    overflow-x: hidden;
    
    /* Prevent vertical overscroll bouncing throughout the app */
    overscroll-behavior-y: none;
    overscroll-behavior: contain;
    
    /* Remove mobile tap highlights globally */
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Allow text selection for input fields and content areas */
  input, textarea, [contenteditable] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  /* Remove focus outlines and replace with custom styles */
  *:focus {
    outline: none;
  }

  /* Remove blue highlight on buttons and clickable elements */
  button, a, [role="button"], [tabindex] {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
`;

export default GlobalStyle; 