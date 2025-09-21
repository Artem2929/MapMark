const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const bucketName = process.env.R2_BUCKET_NAME || 'mapmark';

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload buffer instead of file path
async function uploadPhotoBuffer(buffer, keyName, mimeType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyName,
    Body: buffer,
    ContentType: mimeType,
  });

  await r2.send(command);
  return keyName;
}

// Download photo from R2 and convert to base64
async function downloadPhotoAsBase64(keyName) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: keyName,
    });

    const response = await r2.send(command);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Convert to base64
    const base64 = buffer.toString('base64');
    const mimeType = response.ContentType || 'image/jpeg';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error downloading photo:', error);
    return null;
  }
}

// Download multiple photos as base64
async function downloadPhotosAsBase64(photoIds) {
  if (!photoIds || photoIds.length === 0) {
    return [];
  }

  try {
    const base64Photos = await Promise.all(
      photoIds.map(async (photoId) => {
        const base64 = await downloadPhotoAsBase64(photoId);
        return base64 ? { id: photoId, base64 } : null;
      })
    );
    
    // Filter out null values (failed downloads)
    return base64Photos.filter(photo => photo !== null);
  } catch (error) {
    console.error('Error downloading photos:', error);
    return [];
  }
}

// Delete a single photo from R2
async function deletePhoto(photoId) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: photoId,
    });

    await r2.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}

// Delete multiple photos from R2
async function deletePhotos(photoIds) {
  if (!photoIds || photoIds.length === 0) {
    return [];
  }

  try {
    const deleteResults = await Promise.all(
      photoIds.map(async (photoId) => {
        const success = await deletePhoto(photoId);
        return { photoId, success };
      })
    );
    
    return deleteResults;
  } catch (error) {
    console.error('Error deleting photos:', error);
    return [];
  }
}

module.exports = { uploadPhotoBuffer, downloadPhotoAsBase64, downloadPhotosAsBase64, deletePhoto, deletePhotos };

