import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, body {
    font-family: 'Poppins', Arial, Helvetica, sans-serif;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    background: #212529;
    color: #fff;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  * { 
    -moz-box-sizing: border-box; 
    -webkit-box-sizing: border-box; 
     box-sizing: border-box; 
  }
`;

export default GlobalStyle; 