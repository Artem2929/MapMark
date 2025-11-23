#!/bin/bash

# Script to remove duplicate comment-text styles

echo "Removing duplicate comment-text styles..."

# Files to process
files=(
  "src/components/ui/ReviewsList.css"
  "src/pages/Services.css" 
  "src/pages/PhotosModalStyles.css"
  "src/pages/DiscoverPlaces.css"
  "src/pages/Photos.css"
)

# Remove comment-text blocks from each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Remove comment-text style blocks (including up to 6 lines after the selector)
    sed -i '' '/^\.comment-text\|^\.reviews-list \.comment-text/,+6d' "$file"
    
    echo "Removed duplicates from $file (backup saved as $file.backup)"
  else
    echo "File $file not found"
  fi
done

echo "Done! Import the unified styles from src/styles/comment-text-unified.css"