import axios from 'axios'

export const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_HASH;

export const getImageUrl = (imageId: string, variant: string): string => {
    if (!accountHash) {
        console.error('CLOUDFLARE_HASH not configured in .env file');
        return '';
    }

    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
};



/**
 * Extract image ID from Cloudflare image URL
 */
export const extractImageId = (imageUrl: string): string | null => {
    const match = imageUrl.match(/\/([a-f0-9-]+)\/(?:public|thumbnail|small|medium|large)$/);
    return match ? match[1] : null;
};

/**
 * Validate image file type
 */
export const isValidImageType = (mimetype: string): boolean => {
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];
    return validTypes.includes(mimetype);
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}-${timestamp}-${randomSuffix}.${ext}`;
};

/**
 * Generate short, appropriate filename for Cloudflare
 * Format: modelName-timestamp-random.ext
 */
export const generateShortFilename = (originalName: string, modelName: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E6);
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanModelName = modelName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 20);
    return `${cleanModelName}-${timestamp}-${randomSuffix}.${ext}`;
};

/**
 * Format file size to readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get image dimensions from file (if available)
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
    width: number,
    height: number,
    maxWidth: number = 5000,
    maxHeight: number = 5000
): boolean => {
    return width <= maxWidth && height <= maxHeight;
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (imageId: string): string => {
    if (!accountHash) return '';

    const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}`;
    return [
        `${baseUrl}/thumbnail 150w`,
        `${baseUrl}/small 320w`,
        `${baseUrl}/medium 640w`,
        `${baseUrl}/large 1024w`,
        `${baseUrl}/public 1920w`
    ].join(', ');
};

/**
 * Image upload result interface
 */
export interface ImageUploadResult {
    id: string;
    imageId: string;
    imageUrl: string;
    thumbnailUrl: string;
    originalName: string;
    modelName: string;
    fileSize?: number;
    dimensions?: { width: number; height: number };
    createdAt: Date;
}

/**
 * Transform database image record to client-friendly format
 */
export const transformImageRecord = (record: any): ImageUploadResult => {
    return {
        id: record.id,
        imageId: record.imageUrl,
        imageUrl: getImageUrl(record.imageUrl, 'public'),
        thumbnailUrl: getImageUrl(record.imageUrl, 'thumbnail'),
        originalName: record.nameFile,
        modelName: record.modelName,
        createdAt: record.createdAt
    };
}; 

/**
 * Delete image from Cloudflare Images
 */
export async function deleteImageFromCloudflare(imageId: string): Promise<void> {
  try {
    const response = await axios.delete(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to delete image from Cloudflare: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete image from Cloudflare: ${error}`);
  }
}

/**
 * Delete old images for a specific model before uploading new one
 * @param modelName - The model name to delete images for
 * @param userId - User ID for logging purposes
 * @returns Promise<{ deleteCount: number, errors: string[] }>
 */
export async function deleteOldImagesForModel(
  modelName: string, 
  keepCount: number = 1
): Promise<number> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // ค้นหารูปภาพทั้งหมดของ model นี้ เรียงตามวันที่สร้างจากใหม่ไปเก่า
    const images = await prisma.imageList.findMany({
      where: {
        modelName: modelName,
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // หากมีรูปภาพมากกว่าจำนวนที่ต้องการเก็บ
    if (images.length > keepCount) {
      const imagesToDelete = images.slice(keepCount);
      
      // ลบรูปภาพทีละรูป
      for (const image of imagesToDelete) {
        await deleteImageFromCloudflare(image.imageUrl);
        await prisma.imageList.delete({
          where: { id: image.id }
        });
      }
      
      return imagesToDelete.length;
    }
    
    return 0;
  } catch (error) {
    throw new Error(`Failed to delete old images: ${error}`);
  }
}

/**
 * Soft delete old images for a specific model
 * @param modelName - The model name to soft delete images for  
 * @param userId - User ID for logging purposes
 * @returns Promise<{ deleteCount: number, errors: string[] }>
 */
export async function softDeleteOldImagesForModel(
  modelName: string, 
  keepCount: number = 1
): Promise<number> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // ค้นหารูปภาพทั้งหมดของ model นี้ เรียงตามวันที่สร้างจากใหม่ไปเก่า
    const images = await prisma.imageList.findMany({
      where: {
        modelName: modelName,
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // หากมีรูปภาพมากกว่าจำนวนที่ต้องการเก็บ
    if (images.length > keepCount) {
      const imagesToDelete = images.slice(keepCount);
      
      // Soft delete รูปภาพทีละรูป
      for (const image of imagesToDelete) {
        await prisma.imageList.update({
          where: { id: image.id },
          data: { isDeleted: true, deleteBy: 'system', updatedBy: 'system' }
        });
      }
      
      return imagesToDelete.length;
    }
    
    return 0;
  } catch (error) {
    throw new Error(`Failed to soft delete old images: ${error}`);
  }
} 

 
