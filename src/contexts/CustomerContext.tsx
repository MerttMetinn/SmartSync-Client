import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import axiosInstance from './axiosInstance'
import { toast } from 'react-toastify'

interface CustomerProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  budget: number;
  totalSpent: number;
  isPremium: boolean;
  createdAt: string;
}

interface CustomerContextType {
  profile: CustomerProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/api/Customer/Profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      toast.error('Profil bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    if (!user || !profile) return;

    try {
      // API çağrısı yapılacak
      const response = await fetch(`/api/customers/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Profil güncellenemedi');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return;

    try {
      // API çağrısı yapılacak
      const response = await fetch(`/api/customers/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) throw new Error('Şifre değiştirilemedi');

      toast.success('Şifre başarıyla güncellendi');
    } catch (error) {
      console.error('Şifre değiştirilirken hata:', error);
      toast.error('Şifre değiştirilirken bir hata oluştu');
      throw error;
    }
  };

  return (
    <CustomerContext.Provider value={{ 
      profile, 
      isLoading, 
      updateProfile, 
      changePassword,
      fetchProfile
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}; 