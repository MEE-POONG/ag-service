/**
 * Icon Generator Script
 * Generates placeholder PWA icons
 * For production, use proper design tools or online generators
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template - simple gradient icon with "AG" text
const generateSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A78BFA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34D399;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" 
        font-size="${size * 0.4}px" fill="white">AG</text>
</svg>
`;

// Create public directory if not exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons
console.log('🎨 Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svg.trim());
  console.log(`✅ Created ${filename}`);
});

// Also create favicon sizes
const faviconSizes = [16, 32];
faviconSizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.png`; // Will be SVG but with PNG name for compatibility
  const filepath = path.join(publicDir, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(filepath, svg.trim());
  console.log(`✅ Created favicon ${size}x${size}`);
});

console.log('\n✨ Icon generation complete!\n');
console.log('📝 Note: These are SVG placeholders.');
console.log('🎨 For production, create proper PNG icons using:');
console.log('   - Figma / Adobe XD / Sketch');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('   - https://realfavicongenerator.net/');
console.log('\n🔄 To convert SVG to PNG, use:');
console.log('   - ImageMagick: convert icon.svg -resize 512x512 icon-512x512.png');
console.log('   - Online tools: https://cloudconvert.com/svg-to-png');

