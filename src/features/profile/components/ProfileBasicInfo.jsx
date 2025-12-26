import React, { memo, useState, useEffect, useCallback } from 'react'
import { updateProfile } from '../services/profileService'
import { getInitialFormData, showNotification } from '../utils/profileUtils'
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
  const [formData, setFormData] = useState(() => getInitialFormData(user))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData(getInitialFormData(user))
    }
  }, [user])

  const handleSave = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const profileData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        city: formData.birthCity,
        country: 'Україна',
        bio: formData.about,
        gender: formData.gender,
        birthDate: formData.birthDate
      }
      
      await updateProfile(user.id, profileData)
      onUpdate?.(formData)
      setIsEditing(false)
      showNotification('Профіль успішно оновлено', 'success')
    } catch (error) {
      showNotification(error.message || 'Не вдалося зберегти профіль')
    } finally {
      setIsLoading(false)
    }
  }, [formData, onUpdate, user?.id])

  const handleCancel = useCallback(() => {
    setFormData(getInitialFormData(user))
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
            disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Прізвище:</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="input"
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          ) : (
            <span className="profile-field__value">{formData.about || 'не вказано'}</span>
          )}
        </div>

        {!isEditing && (
          <>
            <ProfileStats
              userId={user?.id}
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
            disabled={isLoading}
          >
            {isLoading ? 'Збереження...' : 'зберегти'}
          </button>
          <button
            onClick={handleCancel}
            className="profile-basic-info__edit-btn"
            disabled={isLoading}
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