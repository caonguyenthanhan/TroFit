import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomForm from '../components/RoomForm';
import { getConfig, getProfile, getRooms, saveRoom } from '../lib/storage';
import { scoreRoom } from '../lib/scoring';

export default function RoomFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    const loadedConfig = getConfig();
    const loadedProfile = getProfile();
    setConfig(loadedConfig);
    setProfile(loadedProfile);

    if (id) {
      const rooms = getRooms();
      const found = rooms.find(r => r.id === id);
      if (found) {
        setEditingRoom(found);
      }
    } else {
      setEditingRoom(null);
    }
  }, [id]);

  const handleSaveRoom = (roomData) => {
    // Pass profile to scoreRoom before saving to keep scores updated
    const scored = scoreRoom(roomData, config, profile);
    const success = saveRoom(scored);
    if (success) {
      navigate('/so-sanh');
    }
  };

  const handleCancelEdit = () => {
    navigate('/so-sanh');
  };

  if (!config || !profile) return <div className="text-center p-12 text-slate-400">Đang tải biểu mẫu...</div>;

  return (
    <div className="animate-fade-in">
      <RoomForm
        config={config}
        profile={profile}
        onSaveRoom={handleSaveRoom}
        editingRoom={editingRoom}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
}
