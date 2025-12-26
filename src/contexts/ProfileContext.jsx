import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuthStore } from '../app/store'

const ProfileContext = createContext()

export const ProfileProvider = ({ children, userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuthStore()
  
  const isOwnProfile = currentUser?.id === userId
  
  useEffect(() => {
    setLoading(true)
    
    // Симуляція завантаження даних профілю
    setTimeout(() => {
      const mockUser = {
        id: userId || 'ua-artem-6',
        name: 'Артем Поліщук',
        email: 'artem@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
        bio: 'Розробник з Києва. Люблю подорожувати та фотографувати.',
        location: 'Київ, Україна',
        website: 'https://artempolishchuk.dev',
        joinDate: '2020-03-15',
        followersCount: 1247,
        followingCount: 892,
        postsCount: 156,
        photos: [
          { id: 1, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', title: 'Захід сонця' },
          { id: 2, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', title: 'Природа' },
          { id: 3, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: 'Ліс' },
          { id: 4, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', title: 'Гори' },
          { id: 5, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', title: 'Озеро' },
          { id: 6, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: 'Поле' }
        ],
        friends: [
          { id: 1, name: 'Олена Коваленко', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
          { id: 2, name: 'Максим Петренко', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
          { id: 3, name: 'Анна Сидоренко', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
          { id: 4, name: 'Дмитро Іваненко', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
          { id: 5, name: 'Софія Мельник', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face' },
          { id: 6, name: 'Андрій Бондаренко', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' }
        ],
        posts: [
          {
            id: 1,
            content: 'Чудовий день для прогулянки парком! 🌳 Природа вже почала змінювати кольори.',
            createdAt: '2024-01-15T10:30:00Z',
            author: {
              name: 'Артем Поліщук',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            likes: 23,
            comments: 5,
            shares: 2
          },
          {
            id: 2,
            content: 'Завершив новий проект! Дуже задоволений результатом 💻',
            createdAt: '2024-01-14T15:45:00Z',
            author: {
              name: 'Артем Поліщук',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            likes: 45,
            comments: 12,
            shares: 8
          },
          {
            id: 3,
            content: 'Відвідав нову кав\'ярню в центрі міста. Рекомендую! ☕',
            createdAt: '2024-01-13T09:20:00Z',
            author: {
              name: 'Артем Поліщук',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            likes: 18,
            comments: 3,
            shares: 1
          }
        ]
      }
      
      setUser(mockUser)
      setLoading(false)
    }, 800)
  }, [userId, currentUser])

  return (
    <ProfileContext.Provider value={{
      user,
      loading,
      isOwnProfile,
      targetUserId: userId
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}