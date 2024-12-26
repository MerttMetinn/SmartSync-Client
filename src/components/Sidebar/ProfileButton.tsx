import React from 'react';
import { useCustomer } from '../../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'

const ProfileButton = () => {
  const { profile, fetchProfile } = useCustomer();
  const navigate = useNavigate();

  const handleClick = () => {
    fetchProfile(); // Profil bilgilerini güncelle
    navigate('/customer/profile'); // Profile sayfasına yönlendir
  };

  return (
    <Button onClick={handleClick}>
      {profile?.name || 'Profil'}
    </Button>
  );
};

export default ProfileButton; 