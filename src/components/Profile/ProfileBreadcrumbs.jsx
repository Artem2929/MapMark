import React, { useMemo } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import Breadcrumbs from '../ui/Breadcrumbs';

const ProfileBreadcrumbs = () => {
  const { user } = useProfile();

  const breadcrumbItems = useMemo(() => [
    { label: 'Головна', link: '/' },
    { label: 'Дослідити', link: '/discover-places' },
    { label: user?.name || 'Профіль' }
  ], [user?.name]);

  return <Breadcrumbs items={breadcrumbItems} />;
};

export default ProfileBreadcrumbs;