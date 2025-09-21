# Review API Endpoints

This document describes the review-related API endpoints for the MapMark backend server.

## Environment Variables Required

Make sure you have the following environment variables set for Cloudflare R2 storage:

```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=mapmark-photos
```

## Endpoints

### 1. Create Review
**POST** `/api/review`

Creates a new review with optional photo uploads.

#### Request Body (multipart/form-data)
- `lng` (number, required): Longitude coordinate
- `lat` (number, required): Latitude coordinate  
- `review` (string, required): Review text content
- `rating` (number, required): Rating from 1 to 5
- `photos` (file[], optional): Up to 5 photo files

#### Example Request
```bash
curl -X POST http://localhost:3000/api/review \
  -F "lng=-74.0060" \
  -F "lat=40.7128" \
  -F "review=Great location with amazing views!" \
  -F "rating=5" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "lng": -74.0060,
    "lat": 40.7128,
    "review": "Great location with amazing views!",
    "rating": 5,
    "photoIds": [
      "reviews/uuid1-photo1.jpg",
      "reviews/uuid2-photo2.jpg"
    ],
    "createdAt": "2023-09-06T10:30:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [-74.0060, 40.7128]
    }
  }
}
```

### 2. Get All Reviews
**GET** `/api/reviews`

Retrieves all reviews, sorted by creation date (newest first).

#### Response
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "lng": -74.0060,
      "lat": 40.7128,
      "review": "Great location with amazing views!",
      "rating": 5,
      "photoIds": ["reviews/uuid1-photo1.jpg"],
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Nearby Reviews
**GET** `/api/reviews/nearby`

Retrieves reviews within a specified radius of a location.

#### Query Parameters
- `lat` (number, required): Center latitude
- `lng` (number, required): Center longitude
- `radius` (number, optional): Search radius in meters (default: 1000)
- `limit` (number, optional): Maximum number of results (default: 50)

#### Example Request
```bash
curl "http://localhost:3000/api/reviews/nearby?lat=40.7128&lng=-74.0060&radius=500&limit=10"
```

#### Response
```json
{
  "success": true,
  "count": 1,
  "searchCenter": { "lat": 40.7128, "lng": -74.0060 },
  "radius": 500,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "lng": -74.0060,
      "lat": 40.7128,
      "review": "Great location with amazing views!",
      "rating": 5,
      "photoIds": ["reviews/uuid1-photo1.jpg"],
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ]
}
```

### 4. Delete Review
**DELETE** `/api/review/:reviewId`

Deletes a review by its ID. This will also delete all associated photos from storage.

#### Path Parameters
- `reviewId` (string, required): The MongoDB ObjectId of the review to delete

#### Example Request
```bash
curl -X DELETE "http://localhost:3000/api/review/64f8a1b2c3d4e5f6a7b8c9d0"
```

#### Response
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "reviewId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "deletedAt": "2023-09-06T11:30:00.000Z"
  }
}
```

#### Error Responses
- `400`: Bad Request - Review ID is required
- `404`: Not Found - Review not found
- `500`: Internal Server Error - Server-side errors

## Photo Storage

Photos are automatically uploaded to Cloudflare R2 storage with the following naming convention:
- Path: `reviews/{uuid}-{original_filename}`
- Example: `reviews/550e8400-e29b-41d4-a716-446655440000-photo1.jpg`

The `photoIds` array in the review document contains the storage keys that can be used to construct full URLs for accessing the photos.

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common error codes:
- `400`: Bad Request (missing required fields, invalid data)
- `500`: Internal Server Error (server-side errors)

## Testing

Use the included test script to verify the endpoints:

```bash
cd backend/server
npm install
node test-review.js
```

Make sure the server is running on `http://localhost:3000` before running the tests.
