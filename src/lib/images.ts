// App-wide hero image. To swap the hero across the app, change this one import.
export const mtkHero = require('../../assets/brand/mtkHero.png');
const finalHero = require('../../assets/brand/finalHero.png');
const clearLogo = require('../../assets/brand/clearLogo.png');
const mtkIcon = require('../../assets/brand/mtkIcon.png');
const onboardingBg = require('../../assets/brand/background.png');
const signInBg = require('../../assets/brand/signIn.png');

export const images = {
  mtkHero,
  clearLogo,
  // 1. The Welcome Screen background
  welcomeHero: mtkHero,
  finalHero,
  homeHero: finalHero,

  // 2. The Team Matooke Logo (used in headers and wordmarks)
  logo: mtkIcon,

  // 3. The Marathon Poster (used in EventDetail and HeroEventCard)
  marathonPoster: mtkHero,

  // 4. The Event Detail poster for Training Runs
  trainingPoster: mtkHero,

  // 5. The image shown on the Run Summary and Run Detail screens (the map area)
  runMapFallback: mtkHero,

  // 6. The image for the App Icon / Splash
  splash: mtkHero,
  
  // 7. The image for Home Feed posts that have an image attached
  postFallback: mtkHero,

  onboardingBg,
  signInBg,
};