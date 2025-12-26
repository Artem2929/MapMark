import React, { memo, useState, useEffect, useCallback } from 'react'
import { updateProfile } from '../services/profileService'
import CustomSelect from '../../../components/ui/CustomSelect'
import DatePicker from '../../../components/ui/DatePicker'
import ProfileStats from './ProfileStats'
import PhotosSection from './PhotosSection'
import './ProfileBasicInfo.css'

const ProfileBasicInfo = memo(({  
  user, 
  isOwnProfile = false, 
  onUpdate, 
  onStatsRefresh, 
  photos = [], 
  following = [], 
  followers = [], 
  posts = [] 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    gender: user?.gender || 'чоловіча',
    birthDate: user?.birthDate || '',
    birthCity: user?.city || '',
    about: user?.bio || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        gender: user.gender || 'чоловіча',
        birthDate: user.birthDate || '',
        birthCity: user.city || '',
        about: user.bio || ''
      })
    }
  }, [user])

  const handleSave = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId')
      const profileData = {
        name: `${formData.firstName} ${formData.lastName}`,
        city: formData.birthCity,
        country: 'Україна',
        bio: formData.about,
        gender: formData.gender,
        birthDate: formData.birthDate
      }
      await updateProfile(userId, profileData)
      onUpdate?.(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }, [formData, onUpdate])

  const handleCancel = useCallback(() => {
    setFormData({
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      gender: user?.gender || 'чоловіча',
      birthDate: user?.birthDate || '',
      birthCity: user?.city || '',
      about: user?.bio || ''
    })
    setIsEditing(false)
  }, [user])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'не вказано'
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }, [])

  const handleEdit = useCallback(() => setIsEditing(true), [])

  return (
    <div className="profile-basic-info">
      <div className="profile-basic-info__header">
        <h2 className="profile-basic-info__title">Основна інформація</h2>
        {isOwnProfile && !isEditing && (
          <button 
            className="profile-basic-info__edit-btn"
            onClick={handleEdit}
          >
            редагувати
          </button>
        )}
      </div>

      <div className="profile-basic-info__content">
        {isEditing ? (
          <>
            <div className="profile-field">
              <span className="profile-field__label">Ім'я:</span>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="input"
              />
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Прізвище:</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="input"
              />
            </div>
          </>
        ) : (
          <div className="profile-field">
            <span className="profile-field__label">Повне ім'я:</span>
            <span className="profile-field__value">
              {formData.firstName} {formData.lastName} 
            </span>
          </div>
        )}

        <div className="profile-field">
          <span className="profile-field__label">Стать:</span>
          {isEditing ? (
            <CustomSelect
              value={formData.gender}
              onChange={(value) => setFormData({...formData, gender: value})}
              options={[
                { value: 'чоловіча', label: 'чоловіча' },
                { value: 'жіноча', label: 'жіноча' }
              ]}
              placeholder="Оберіть стать"
            />
          ) : (
            <span className="profile-field__value">{formData.gender}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="profile-field__label">День народження:</span>
          {isEditing ? (
            <DatePicker
              value={formData.birthDate}
              onChange={(value) => setFormData({...formData, birthDate: value})}
              placeholder="Оберіть дату народження"
            />
          ) : (
            <span className="profile-field__value">{formatDate(formData.birthDate)}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="profile-field__label">Рідне місто:</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.birthCity}
              onChange={(e) => setFormData({...formData, birthCity: e.target.value})}
              className="input"
            />
          ) : (
            <span className="profile-field__value">{formData.birthCity || 'не вказано'}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="profile-field__label">Про себе:</span>
          {isEditing ? (
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="input"
              rows={3}
              maxLength={200}
              placeholder="Розкажіть про себе"
              style={{ resize: 'none' }}
            />
          ) : (
            <span className="profile-field__value">{formData.about || 'не вказано'}</span>
          )}
        </div>

        {!isEditing && (
          <>
            <ProfileStats 
              userId={user?._id || user?.id} 
              isOwnProfile={isOwnProfile}
              onStatsReady={onStatsRefresh}
              photos={photos}
              following={following}
              followers={followers}
              posts={posts}
            />
            <PhotosSection />
          </>
        )}
      </div>

      {isEditing && (
        <div className="profile-basic-info__actions">
          <button 
            onClick={handleSave}
            className="profile-basic-info__edit-btn"
          >
            зберегти
          </button>
          <button 
            onClick={handleCancel}
            className="profile-basic-info__edit-btn"
          >
            скасувати
          </button>
        </div>
      )}
    </div>
  )
})

ProfileBasicInfo.displayName = 'ProfileBasicInfo'

export default ProfileBasicInfo