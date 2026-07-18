export const DEFAULT_TAGS = [
  { id: 'an_ninh_tot', label: 'An ninh tốt', category: 'security' },
  { id: 'gio_tu_do', label: 'Giờ giấc tự do', category: 'convenience' },
  { id: 'khong_chung_chu', label: 'Không chung chủ', category: 'convenience' },
  { id: 'toilet_rieng', label: 'WC riêng', category: 'convenience' },
  { id: 'cho_de_xe_rong', label: 'Chỗ để xe rộng', category: 'convenience' },
  { id: 'cho_nuoi_thu', label: 'Cho nuôi thú cưng', category: 'rule' },
  { id: 'gac_lung', label: 'Có gác lửng', category: 'space' },
  { id: 'phong_moi', label: 'Phòng mới/sạch sẽ', category: 'aesthetic' },
  { id: 'gan_tram_bus', label: 'Gần trạm xe buýt', category: 'location' },
  { id: 'gan_sieu_thi', label: 'Gần chợ/siêu thị', category: 'location' },
  { id: 'khoa_van_tay', label: 'Khóa vân tay', category: 'security' },
  { id: 'co_camera', label: 'Camera an ninh', category: 'security' },
  { id: 'co_thang_may', label: 'Có thang máy', category: 'convenience' },
  { id: 'nha_bep_rieng', label: 'Có bếp riêng', category: 'convenience' }
];

export const getTags = () => {
  try {
    const raw = localStorage.getItem('tro-custom-tags');
    const customTags = raw ? JSON.parse(raw) : [];
    return [...DEFAULT_TAGS, ...customTags];
  } catch (e) {
    return DEFAULT_TAGS;
  }
};

export const addCustomTag = (label) => {
  if (!label || !label.trim()) return null;
  const cleanLabel = label.trim();
  const allTags = getTags();
  
  // Check duplicate
  const duplicate = allTags.find(t => t.label.toLowerCase() === cleanLabel.toLowerCase());
  if (duplicate) return duplicate;

  const newTag = {
    id: `custom_${Date.now()}`,
    label: cleanLabel,
    category: 'custom'
  };

  try {
    const raw = localStorage.getItem('tro-custom-tags');
    const customTags = raw ? JSON.parse(raw) : [];
    customTags.push(newTag);
    localStorage.setItem('tro-custom-tags', JSON.stringify(customTags));
    return newTag;
  } catch (e) {
    console.error('Error saving custom tag', e);
    return newTag;
  }
};
