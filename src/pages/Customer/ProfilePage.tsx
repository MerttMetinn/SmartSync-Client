import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, User, Calendar, Wallet, TrendingUp } from 'lucide-react'
import { useCustomer } from '@/contexts/CustomerContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const ProfilePage = () => {
  const { profile, fetchProfile, updateProfile, changePassword, isLoading } = useCustomer()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username,
        email: profile.email
      }))
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Yeni şifreler eşleşmiyor')
          return
        }
        await changePassword(formData.currentPassword, formData.newPassword)
      }

      const updateData = {
        username: formData.username,
        email: formData.email
      }

      await updateProfile(updateData)
      setIsEditing(false)
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Form gönderilirken hata:', error)
    }
  }

  if (isLoading || !profile) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Form içeriği mevcut */}
        </form>
      </Card>

      {/* Diğer kartlar mevcut */}
    </div>
  )
}

export default ProfilePage 