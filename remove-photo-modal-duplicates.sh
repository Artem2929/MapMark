#!/bin/bash

# Script to remove duplicate photo-modal-sidebar styles

echo "Removing duplicate photo-modal-sidebar styles..."

# Files to process
files=(
  "src/pages/PhotosModalStyles.css"
  "src/pages/Photos.css"
)

# Remove photo-modal-sidebar blocks from each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Remove photo-modal-sidebar style blocks (including up to 12 lines after the selector)
    sed -i '' '/^\.photo-modal-sidebar/,+12d' "$file"
    
    echo "Removed duplicates from $file (backup saved as $file.backup)"
  else
    echo "File $file not found"
  fi
done

echo "Done! Import the unified styles from src/styles/photo-modal-sidebar-optimized.css"