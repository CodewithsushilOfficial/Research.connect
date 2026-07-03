/**
 * Client-side image compression and validation utility.
 * Resizes the image to fit a maximum bounding box and outputs a compressed WebP file.
 * 
 * @param {File} file - The original uploaded file.
 * @param {object} options - Bounding dimensions and target quality.
 * @returns {Promise<File>} Compressed file ready for upload.
 */
export const compressImage = (file, options = { maxWidth: 800, maxHeight: 800, quality: 0.8 }) => {
  return new Promise((resolve, reject) => {
    // 1. Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Invalid image type. Only JPG, PNG, and WEBP are supported.'));
    }

    // 2. Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return reject(new Error('File is too large. Maximum allowed size is 5MB.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to fit within maxWidth/maxHeight
        if (width > height) {
          if (width > options.maxWidth) {
            height = Math.round((height * options.maxWidth) / width);
            width = options.maxWidth;
          }
        } else {
          if (height > options.maxHeight) {
            width = Math.round((width * options.maxHeight) / height);
            height = options.maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Always convert PNG/JPG to WEBP for better compression ratio and performance
        const outputType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed.'));
            }
            
            // Get original file name prefix
            const originalName = file.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            const namePrefix = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
            
            // Convert Blob to a File object
            const compressedFile = new File([blob], `${namePrefix}_compressed.webp`, {
              type: outputType,
              lastModified: Date.now(),
            });
            
            console.log(`Image compressed: original size = ${(file.size / 1024).toFixed(2)} KB, new size = ${(compressedFile.size / 1024).toFixed(2)} KB`);
            resolve(compressedFile);
          },
          outputType,
          options.quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for compression.'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
  });
};
