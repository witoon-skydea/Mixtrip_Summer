/**
 * Script to generate placeholder images for defaults
 * Run this script once to generate default images
 */

const fs = require('fs');
const path = require('path');

// Function to create a simple SVG
const createSVG = (width, height, backgroundColor, text, textColor) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${backgroundColor}"/>
    <text x="50%" y="50%" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
  </svg>`;
};

// Create default profile image
const createDefaultProfileImage = () => {
  const profilesDir = path.join(__dirname, '../../public/images/profiles');
  const profileImagePath = path.join(profilesDir, 'default-profile.png');
  
  // Check if file already exists
  if (fs.existsSync(profileImagePath)) {
    console.log('Default profile image already exists. Skipping creation.');
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  
  // Create a simple SVG as a placeholder
  const svg = createSVG(200, 200, '#1e88e5', 'User', '#ffffff');
  
  // Write SVG to file
  fs.writeFileSync(profileImagePath, svg);
  console.log('Default profile image created at:', profileImagePath);
};

// Create default trip cover image
const createDefaultTripCoverImage = () => {
  const tripsDir = path.join(__dirname, '../../public/images/trips');
  const tripCoverPath = path.join(tripsDir, 'default-trip-cover.jpg');
  
  // Check if file already exists
  if (fs.existsSync(tripCoverPath)) {
    console.log('Default trip cover image already exists. Skipping creation.');
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(tripsDir)) {
    fs.mkdirSync(tripsDir, { recursive: true });
  }
  
  // Create a simple SVG as a placeholder
  const svg = createSVG(800, 400, '#ff8a65', 'Trip', '#ffffff');
  
  // Write SVG to file
  fs.writeFileSync(tripCoverPath, svg);
  console.log('Default trip cover image created at:', tripCoverPath);
};

// Create default images
createDefaultProfileImage();
createDefaultTripCoverImage();

console.log('Default images generated successfully.');
