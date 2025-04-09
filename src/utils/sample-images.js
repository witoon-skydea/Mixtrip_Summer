/**
 * Script to generate sample images for the application
 * Run this script once to generate sample images
 */

const fs = require('fs');
const path = require('path');

// Function to create a simple SVG
const createSVG = (width, height, backgroundColor, text, textColor) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${backgroundColor}"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
  </svg>`;
};

// Create destination images
const createDestinationImages = () => {
  const destinationsDir = path.join(__dirname, '../../public/images/destinations');
  
  // Ensure directory exists
  if (!fs.existsSync(destinationsDir)) {
    fs.mkdirSync(destinationsDir, { recursive: true });
  }
  
  // Define destinations
  const destinations = [
    { name: 'bangkok', color: '#e91e63', text: 'Bangkok' },
    { name: 'chiang-mai', color: '#673ab7', text: 'Chiang Mai' },
    { name: 'phuket', color: '#2196f3', text: 'Phuket' },
    { name: 'krabi', color: '#009688', text: 'Krabi' }
  ];
  
  // Create images for each destination
  destinations.forEach(dest => {
    const filePath = path.join(destinationsDir, `${dest.name}.jpg`);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Destination image for ${dest.name} already exists. Skipping.`);
      return;
    }
    
    // Create SVG
    const svg = createSVG(800, 600, dest.color, dest.text, '#ffffff');
    
    // Write SVG to file
    fs.writeFileSync(filePath, svg);
    console.log(`Created destination image for ${dest.name} at: ${filePath}`);
  });
};

// Create trip images
const createTripImages = () => {
  const tripsDir = path.join(__dirname, '../../public/images/trips');
  
  // Ensure directory exists
  if (!fs.existsSync(tripsDir)) {
    fs.mkdirSync(tripsDir, { recursive: true });
  }
  
  // Define trips
  const trips = [
    { name: 'bangkok-weekend', color: '#ff5722', text: 'Bangkok Weekend' },
    { name: 'chiang-mai-adventure', color: '#9c27b0', text: 'Chiang Mai Adventure' },
    { name: 'phuket-beaches', color: '#03a9f4', text: 'Phuket Beaches' }
  ];
  
  // Create images for each trip
  trips.forEach(trip => {
    const filePath = path.join(tripsDir, `${trip.name}.jpg`);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Trip image for ${trip.name} already exists. Skipping.`);
      return;
    }
    
    // Create SVG
    const svg = createSVG(800, 400, trip.color, trip.text, '#ffffff');
    
    // Write SVG to file
    fs.writeFileSync(filePath, svg);
    console.log(`Created trip image for ${trip.name} at: ${filePath}`);
  });
};

// Create auth images
const createAuthImages = () => {
  const authDir = path.join(__dirname, '../../public/images/auth');
  
  // Ensure directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  // Define auth images
  const authImages = [
    { name: 'login', color: '#1976d2', text: 'Login' },
    { name: 'register', color: '#388e3c', text: 'Register' }
  ];
  
  // Create images for auth pages
  authImages.forEach(img => {
    const filePath = path.join(authDir, `${img.name}.jpg`);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Auth image for ${img.name} already exists. Skipping.`);
      return;
    }
    
    // Create SVG
    const svg = createSVG(600, 800, img.color, img.text, '#ffffff');
    
    // Write SVG to file
    fs.writeFileSync(filePath, svg);
    console.log(`Created auth image for ${img.name} at: ${filePath}`);
  });
};

// Create hero image
const createHeroImage = () => {
  const imagesDir = path.join(__dirname, '../../public/images');
  const filePath = path.join(imagesDir, 'hero-image.jpg');
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log('Hero image already exists. Skipping.');
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Create SVG
  const svg = createSVG(1200, 600, '#3f51b5', 'MixTrip Hero Image', '#ffffff');
  
  // Write SVG to file
  fs.writeFileSync(filePath, svg);
  console.log(`Created hero image at: ${filePath}`);
};

// Create logo image
const createLogoImage = () => {
  const imagesDir = path.join(__dirname, '../../public/images');
  const filePath = path.join(imagesDir, 'mixtrip-logo.png');
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log('Logo image already exists. Skipping.');
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Create SVG
  const svg = createSVG(200, 200, '#1e88e5', 'MT', '#ffffff');
  
  // Write SVG to file
  fs.writeFileSync(filePath, svg);
  console.log(`Created logo image at: ${filePath}`);
};

// Create favicon
const createFavicon = () => {
  const imagesDir = path.join(__dirname, '../../public/images');
  const filePath = path.join(imagesDir, 'favicon.ico');
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log('Favicon already exists. Skipping.');
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Create SVG
  const svg = createSVG(32, 32, '#1e88e5', 'M', '#ffffff');
  
  // Write SVG to file
  fs.writeFileSync(filePath, svg);
  console.log(`Created favicon at: ${filePath}`);
};

// Create all sample images
createDestinationImages();
createTripImages();
createAuthImages();
createHeroImage();
createLogoImage();
createFavicon();

console.log('Sample images generated successfully.');
