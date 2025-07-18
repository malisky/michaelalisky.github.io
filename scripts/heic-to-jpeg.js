const fs = require('fs');
const path = require('path');

class ImageToJpegConverter {
    constructor(folderName) {
        this.folderName = folderName;
        this.inputDir = path.join(__dirname, '..', 'docs', 'images', folderName);
    }

    // Convert HEIC to JPEG using sips (macOS built-in)
    async convertHeicToJpeg(heicFile) {
        const heicPath = path.join(this.inputDir, heicFile);
        const jpegName = heicFile.replace('.HEIC', '.jpeg');
        const jpegPath = path.join(this.inputDir, jpegName);
        
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            const command = `sips -s format jpeg "${heicPath}" --out "${jpegPath}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error converting ${heicFile}:`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ Converted ${heicFile} to ${jpegName}`);
                    // Delete the original HEIC file
                    fs.unlinkSync(heicPath);
                    console.log(`🗑️  Deleted ${heicFile}`);
                    resolve(jpegPath);
                }
            });
        });
    }

    // Convert PNG to JPEG using sips
    async convertPngToJpeg(pngFile) {
        const pngPath = path.join(this.inputDir, pngFile);
        const jpegName = pngFile.replace('.png', '.jpeg');
        const jpegPath = path.join(this.inputDir, jpegName);
        
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            const command = `sips -s format jpeg "${pngPath}" --out "${jpegPath}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error converting ${pngFile}:`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ Converted ${pngFile} to ${jpegName}`);
                    // Delete the original PNG file
                    fs.unlinkSync(pngPath);
                    console.log(`🗑️  Deleted ${pngFile}`);
                    resolve(jpegPath);
                }
            });
        });
    }

    // Convert JPG to JPEG using sips (just rename)
    async convertJpgToJpeg(jpgFile) {
        const jpgPath = path.join(this.inputDir, jpgFile);
        const jpegName = jpgFile.replace('.jpg', '.jpeg');
        const jpegPath = path.join(this.inputDir, jpegName);
        
        try {
            fs.renameSync(jpgPath, jpegPath);
            console.log(`✅ Renamed ${jpgFile} to ${jpegName}`);
            return jpegPath;
        } catch (error) {
            console.error(`❌ Error renaming ${jpgFile}:`, error.message);
            throw error;
        }
    }

    // Main conversion process
    async convertAll() {
        console.log(`🚀 Starting image to JPEG conversion for ${this.folderName} folder...`);
        
        try {
            // Check if input directory exists
            if (!fs.existsSync(this.inputDir)) {
                console.error(`❌ Input directory not found: ${this.inputDir}`);
                return;
            }
            
            // Get all image files
            const files = fs.readdirSync(this.inputDir);
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.heic', '.jpg', '.png'].includes(ext);
            });
            
            if (imageFiles.length === 0) {
                console.log(`ℹ️  No image files found in ${this.folderName} folder`);
                return;
            }
            
            console.log(`📁 Found ${imageFiles.length} image files to convert to JPEG`);
            
            // Convert each file
            for (const imageFile of imageFiles) {
                try {
                    const ext = path.extname(imageFile).toLowerCase();
                    
                    if (ext === '.heic') {
                        await this.convertHeicToJpeg(imageFile);
                    } else if (ext === '.png') {
                        await this.convertPngToJpeg(imageFile);
                    } else if (ext === '.jpg') {
                        await this.convertJpgToJpeg(imageFile);
                    }
                    
                } catch (error) {
                    console.error(`❌ Failed to convert ${imageFile}:`, error.message);
                }
            }
            
            console.log('✅ Conversion complete! All images are now JPEG format.');
            console.log('💡 Next step: Run your image optimizer to convert JPEGs to WebP');
            
        } catch (error) {
            console.error('❌ Conversion failed:', error.message);
        }
    }
}

// Get folder name from command line argument, default to kz-pigeon
const folderName = process.argv[2] || 'kz-pigeon';

console.log(`📂 Converting folder: ${folderName}`);

// Run the conversion
const converter = new ImageToJpegConverter(folderName);
converter.convertAll(); 