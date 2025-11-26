const fs = require('fs');
const path = require('path');

// Simple PNG file data (1x1 purple pixel)
const createPNG = (width, height, color) => {
  // Using a simple base64 encoded 1x1 purple PNG
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Create icon.png (1x1 pixel for now)
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPNG());
console.log('Created icon.png');

// Create splash.png (1x1 pixel for now)
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPNG());
console.log('Created splash.png');

console.log('Asset files created successfully!');
