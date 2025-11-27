import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Cropper from 'react-easy-crop'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Image upload and cropping state
  const [selectedImage, setSelectedImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result)
        setShowCropper(true)
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleUploadImage = async () => {
    if (!croppedAreaPixels) return

    setUploadingImage(true)
    setError('')

    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)

      const formData = new FormData()
      formData.append('file', croppedBlob, 'profile.jpg')

      const response = await fetch(`/api/users/${user.id}/profile-image`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload image')
      }

      const data = await response.json()

      // Update user in local storage
      const userToStore = {
        ...user,
        profileImage: data.profile_image_url
      }
      localStorage.setItem('user', JSON.stringify(userToStore))

      setSuccess('Profile image updated successfully!')
      setShowCropper(false)
      setSelectedImage(null)

      // Reload page to update header
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate password fields if changing password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match')
        }
        if (formData.newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters')
        }
        if (!formData.currentPassword) {
          throw new Error('Current password is required to set a new password')
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email
      }

      // Only include password if changing it
      if (formData.newPassword) {
        payload.password = formData.newPassword
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update profile')
      }

      const updatedUser = await response.json()

      // Update user in local storage
      const userToStore = {
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profile_image_url
      }
      localStorage.setItem('user', JSON.stringify(userToStore))

      setSuccess('Profile updated successfully!')

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      // Reload page to update header
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <div className="card">
        <h2>My Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Update your personal information and profile picture
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            background: 'var(--success-light)',
            color: 'var(--success-hover)',
            borderRadius: 'var(--radius)',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        {/* Profile Image Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Profile Image</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            {/* Current Profile Image */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--border-color)',
              background: user.profileImage ? 'transparent' : 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-color)',
              fontWeight: '600',
              fontSize: '2rem'
            }}>
              {user.profileImage ? (
                <img
                  src={`/api${user.profileImage}`}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  }}
                />
              ) : (
                user.name.split(' ').map(n => n[0]).join('').toUpperCase()
              )}
            </div>

            {/* Upload Button */}
            <div>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="imageUpload">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => document.getElementById('imageUpload').click()}
                  style={{ cursor: 'pointer' }}
                >
                  Choose New Image
                </button>
              </label>
              <p style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                JPG, PNG or WebP. Max size 10MB.
              </p>
            </div>
          </div>

          {/* Image Cropper Modal */}
          {showCropper && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius)',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Crop Your Profile Image</h3>

                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  background: '#333',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1.5rem'
                }}>
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                {/* Zoom Control */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>
                    Zoom
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="button-group">
                  <button
                    className="button"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button
                    className="button-secondary"
                    onClick={() => {
                      setShowCropper(false)
                      setSelectedImage(null)
                    }}
                    disabled={uploadingImage}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div style={{
            marginTop: '2rem',
            marginBottom: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '2px solid var(--border-color)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Change Password</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Leave these fields blank if you don't want to change your password
            </p>

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={loading}
              />
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                Minimum 8 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
          </div>

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '500' }}>Role:</span>
            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '500' }}>Authentication:</span>
            <span style={{ textTransform: 'capitalize' }}>{user.authProvider}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
