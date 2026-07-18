import React, { useState, useEffect } from 'react';
import { User, Save, RotateCcw, Sparkles, DollarSign, MapPin, Briefcase, Users, HelpCircle, CheckCircle2, Landmark } from 'lucide-react';
import TagSelect from '../components/TagSelect';
import BudgetAdvice from '../components/BudgetAdvice';
import { getProfile, saveProfile, DEFAULT_PROFILE } from '../lib/storage';
import { calculateRecommendedBudget } from '../lib/budgetRules';
import AddressPicker from '../components/AddressPicker';


export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const handleTagsChange = (type, tags) => {
    setProfile(prev => ({
      ...prev,
      [type]: tags
    }));
  };

  const resetToDefault = () => {
    if (window.confirm('Khôi phục hồ sơ cá nhân về mặc định? Dữ liệu chưa lưu sẽ bị mất.')) {
      setProfile({ ...DEFAULT_PROFILE });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(profile.thuNhap) <= 0) {
      alert('Vui lòng nhập thu nhập hàng tháng hợp lệ lớn hơn 0 để tính toán ngân sách nhà ở!');
      return;
    }
    const success = saveProfile(profile);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (!profile) return <div className="text-center p-12 text-slate-400">Đang tải hồ sơ...</div>;

  const budgetResult = calculateRecommendedBudget(profile.thuNhap, profile.percentNganSach);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-100">Hồ Sơ Cá Nhân & Tài Chính</h2>
          <p className="text-slate-400 text-sm mt-0.5">Đặt ngưỡng tài chính, khoảng cách và các tiện nghi mong muốn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form nhập hồ sơ (Cột 1 & 2) */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 space-y-6">
          {/* Tài chính */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> 1. Khả năng chi trả
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Thu nhập ròng hàng tháng (VND) *</label>
                <input
                  type="number"
                  value={profile.thuNhap || ''}
                  onChange={(e) => handleTextChange('thuNhap', e.target.value)}
                  className="glass-input"
                  placeholder="VD: 15000000"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 flex justify-between">
                  <span>Hạn mức ngân sách đề xuất</span>
                  <span className="font-bold text-indigo-400">{profile.percentNganSach}% thu nhập</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="5"
                  value={profile.percentNganSach}
                  onChange={(e) => handleTextChange('percentNganSach', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2.5"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>15% (Tiết kiệm)</span>
                  <span>30% (Khuyên dùng)</span>
                  <span>40% (Tối đa)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vị trí & Tính chất công việc */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 2. Đi lại & Công việc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-400">Địa chỉ văn phòng / công ty</label>
                <input
                  type="text"
                  value={profile.diaChiCongTy}
                  onChange={(e) => handleChange('diaChiCongTy', e.target.value)}
                  className="glass-input"
                  placeholder="VD: Khu công nghệ cao, Quận 9, TP.HCM"
                />
              </div>

              <div className="md:col-span-2">
                <AddressPicker
                  label="Vị trí tọa độ công ty"
                  address={profile.diaChiCongTy}
                  value={profile.toaDoCongTy}
                  onChange={(coords) => handleChange('toaDoCongTy', coords)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Thời gian đi làm mong muốn (phút)</label>
                <input
                  type="number"
                  value={profile.thoiGianDenCongTy}
                  onChange={(e) => handleTextChange('thoiGianDenCongTy', e.target.value)}
                  className="glass-input"
                  placeholder="VD: 20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Tính chất công việc / Cách di chuyển</label>
                <select
                  value={profile.tinhChatCongViec}
                  onChange={(e) => handleChange('tinhChatCongViec', e.target.value)}
                  className="glass-input text-sm"
                >
                  <option value="van_phong">Làm tại văn phòng (Đi xe máy/xe bus)</option>
                  <option value="linh_hoat">Làm linh hoạt/Remote (Ít phải đi lại)</option>
                  <option value="di_bo">Có thể đi bộ đi làm (Gần sát công ty)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={profile.coSongGhep}
                    onChange={(e) => handleChange('coSongGhep', e.target.checked)}
                    className="glass-checkbox"
                  />
                  <Users className="w-4 h-4 text-slate-400" />
                  Tôi có dự định ở ghép để chia sẻ chi phí
                </label>
              </div>
            </div>
          </div>

          {/* Yêu cầu tiện ích */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> 3. Tiện ích & Luật phòng
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Yêu cầu bắt buộc là mỏ neo quyết định (thiếu sẽ bị trừ điểm nặng và cảnh báo đỏ). Yêu cầu tùy chọn là điểm cộng cộng thêm.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-rose-400">🚨 YÊU CẦU BẮT BUỘC (Mandatory - Thiếu sẽ báo động đỏ)</label>
                <TagSelect
                  selectedTags={profile.mandatoryTags}
                  onChange={(tags) => handleTagsChange('mandatoryTags', tags)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400">✨ Yêu cầu tùy chọn (Optional - Điểm cộng thêm)</label>
                <TagSelect
                  selectedTags={profile.optionalTags}
                  onChange={(tags) => handleTagsChange('optionalTags', tags)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-900">
            <button
              type="button"
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-xs font-semibold hover:bg-slate-900 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset mặc định
            </button>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lưu thành công!
                </span>
              )}
              <button
                type="submit"
                className="gradient-btn bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center gap-2 text-xs font-semibold py-2.5 shadow-indigo-600/10"
              >
                <Save className="w-4 h-4" />
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>

        {/* Khối lời khuyên tài chính (Cột 3) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4" /> Phân tích ngân sách
            </h3>
            
            {profile.thuNhap ? (
              <div className="space-y-4">
                <div className="space-y-1 text-center py-4 bg-slate-950/20 border border-slate-900 rounded-2xl">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Hạn mức thuê nhà đề xuất</span>
                  <div className="text-xl font-black text-emerald-400">{budgetResult.recommended.toLocaleString()}đ</div>
                  <span className="text-[10px] text-slate-500">({profile.percentNganSach}% thu nhập hàng tháng)</span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Mức tiết kiệm (15%):</span>
                    <span className="font-semibold text-slate-200">{(profile.thuNhap * 0.15).toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trần nới tài chính tối đa (40%):</span>
                    <span className="font-semibold text-slate-200">{(profile.thuNhap * 0.40).toLocaleString()}đ</span>
                  </div>
                </div>

                <BudgetAdvice
                  income={profile.thuNhap}
                  rent={budgetResult.recommended}
                  totalCost={budgetResult.recommended}
                  profile={profile}
                />
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs leading-relaxed">
                Vui lòng điền thu nhập ròng ở biểu mẫu để hệ thống phân tích mức chi trả thuê trọ an toàn theo quy tắc tài chính.
              </div>
            )}
          </div>

          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-900/60 text-xs text-slate-400 space-y-2 leading-relaxed">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              💡 Quy tắc phân bổ 50/30/20
            </h4>
            <p>
              Học thuyết tài chính khuyên bạn dành:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>50%</strong> cho các nhu cầu Thiết yếu (trong đó tiền nhà chỉ nên chiếm từ 15-30%).</li>
              <li><strong>30%</strong> cho các Mong muốn cá nhân.</li>
              <li><strong>20%</strong> cho các khoản Tích lũy/Trả nợ.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
