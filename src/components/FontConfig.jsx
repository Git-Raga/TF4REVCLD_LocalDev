import React, {useEffect} from 'react';

const FontConfig = ({ children }) => {
  // Main font configuration - change this to update the font throughout the app
  const fontFamily = 'Titillium Web';

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';  // Preload instead of direct stylesheet
    link.as = 'style';
    link.href = 'https://fonts.googleapis.com/css2?family=Titillium+Web:wght@200;300;400;600;700;900&display=swap';
    
    link.onload = () => {
      link.rel = 'stylesheet'; // Convert to stylesheet after preload
    };
    
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <style>
        {`
          /* Import the font from Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap');

          /* Apply the font to all elements by default */
          * {
            font-family: '${fontFamily}', sans-serif;
          }

          /* Specific heading styles - using the configured font */
          h1, h2, h3, h4, h5, h6 {
            font-family: '${fontFamily}', sans-serif;
            font-weight: 600;
          }

          /* Body text style */
          body {
            font-family: '${fontFamily}', sans-serif;
            font-weight: 400;
          }

          /* Light weight text class */
          .font-light {
            font-family: '${fontFamily}', sans-serif;
            font-weight: 300;
          }

          /* Bold text class */
          .font-bold {
            font-family: '${fontFamily}', sans-serif;
            font-weight: 700;
          }
        `}
      </style>
      {children}
    </>
  );
};

export default FontConfig;