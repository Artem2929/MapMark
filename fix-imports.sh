#!/bin/bash

echo "🔧 Автоматичне виправлення всіх імпортів..."

# Виправляємо всі неіснуючі компоненти
echo "📦 Видаляємо неіснуючі компоненти..."
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' '/InfiniteScroll/d'
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' '/LoadingSkeleton/d'
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' '/PostCard/s|../../components/common/PostCard|../../components/business/PostCard|g'
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' '/Wall/s|../../components/common/Wall|../../components/business/Wall|g'

# Виправляємо всі шляхи до API
echo "🌐 Виправляємо API імпорти..."
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|../utils/apiClient|../../api/apiClient|g'
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|../../utils/apiClient|../../api/apiClient|g'

# Виправляємо всі CSS імпорти
echo "🎨 Виправляємо CSS імпорти..."
find src/ -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|../../components/common/PostCard.css|../../components/business/PostCard.css|g'

# Створюємо заглушки для відсутніх компонентів
echo "🔨 Створюємо заглушки..."

# InfiniteScroll заглушка
cat > src/components/common/InfiniteScroll.jsx << 'EOF'
import React from 'react';

const InfiniteScroll = ({ children, hasMore, loadMore, loader }) => {
  return <div>{children}</div>;
};

export default InfiniteScroll;
EOF

# LoadingSkeleton заглушка
cat > src/components/common/LoadingSkeleton.jsx << 'EOF'
import React from 'react';

const LoadingSkeleton = ({ count = 1 }) => {
  return (
    <div className="loading-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-item" style={{
          height: '100px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          margin: '10px 0',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
EOF

# LoadingSkeleton CSS
cat > src/components/common/LoadingSkeleton.css << 'EOF'
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
EOF

echo "✅ Всі імпорти виправлено!"