import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CONFIG } from '../lib/storage';

export default function ConfigSettings({ config, onSaveConfig }) {
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleTextChange = (field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const handleDienTichChange = (index, value) => {
    setLocalConfig(prev => {
      const newRange = [...(prev.dienTichRange || [15, 35])];
      newRange[index] = Number(value) || 0;
      return {
        ...prev,
        dienTichRange: newRange
      };
    });
  };

  const handleWeightChange = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: Number(value) / 100
      }
    }));
  };

  const resetToDefault = () => {
    setLocalConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  };

  // Calculate total weight percentage
  const totalWeightPercent = Math.round(
    Object.values(localConfig.weights || {}).reduce((sum, w) => sum + w, 0) * 100
  );

  const isWeightValid = totalWeightPercent === 100;

  const handleSave = (e) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert('Tổng các trọng số phải bằng 100%!');
      return;
    }
    onSaveConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const weightLabels = {
    viTri: 'Vị trí (Khoảng cách)',
    chiPhi: 'Chi phí thuê & phụ phí',
    tienIch: 'Tiện ích & Môi trường',
    dienTich: 'Diện tích sử dụng',
    camQuan: 'Cảm quan thực tế',
    doThoang: 'Độ thoáng & Thiết bị'
  };

  return (
    <div className="glass-panel p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-sans">Cấu Hình Trọng Số & Ngưỡng Điểm</h2>
          <p className="text-slate-400 text-sm mt-0.5">Tùy biến tiêu chí để phù hợp với ưu tiên tìm phòng của riêng bạn</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hạn mức & Ngưỡng cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Ngân sách giá thuê mong muốn (VND)</label>
            <input
              type="number"
              value={localConfig.nganSachGiaThue || ''}
              onChange={(e) => handleTextChange('nganSachGiaThue', e.target.value)}
              className="glass-input"
              placeholder="VD: 4000000"
              required
            />
            <p className="text-xs text-slate-500">Mức tiền trọ lý tưởng để đối chiếu điểm Chi phí</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Thời gian đi làm lý tưởng (phút)</label>
            <input
              type="number"
              value={localConfig.thoiGianLyTuong || ''}
              onChange={(e) => handleTextChange('thoiGianLyTuong', e.target.value)}
              className="glass-input"
              placeholder="VD: 20"
              required
            />
            <p className="text-xs text-slate-500">Thời gian di chuyển tối đa tới văn phòng/công ty</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Khoảng diện tích kỳ vọng (m²)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={localConfig.dienTichRange?.[0] ?? 15}
                onChange={(e) => handleDienTichChange(0, e.target.value)}
                className="glass-input w-full text-center"
                placeholder="Min"
                required
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                value={localConfig.dienTichRange?.[1] ?? 35}
                onChange={(e) => handleDienTichChange(1, e.target.value)}
                className="glass-input w-full text-center"
                placeholder="Max"
                required
              />
            </div>
            <p className="text-xs text-slate-500">Dải diện tích từ Nhỏ đến Rộng rãi</p>
          </div>
        </div>

        {/* Thiết lập Trọng số */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-400">Trọng số các trục (%)</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isWeightValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {!isWeightValid && <AlertTriangle className="w-3.5 h-3.5" />}
              {isWeightValid && <CheckCircle2 className="w-3.5 h-3.5" />}
              Tổng trọng số: {totalWeightPercent}%
            </span>
          </div>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Kéo slider để phân phối mức độ quan trọng cho các tiêu chí. Khi đi xem phòng, điểm tổng của mỗi phòng sẽ được tính dựa trên phân phối trọng số này. <strong>Tổng các tiêu chí phải bằng 100%</strong>.
          </p>

          <div className="space-y-5 bg-slate-950/30 p-5 rounded-2xl border border-slate-900">
            {Object.entries(localConfig.weights || {}).map(([key, val]) => {
              const percent = Math.round(val * 100);
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">{weightLabels[key]}</span>
                    <span className="font-bold text-indigo-400">{percent}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={percent}
                      onChange={(e) => handleWeightChange(key, e.target.value)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hành động */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-900">
          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400 hover:text-slate-300 text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục mặc định
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {saveSuccess && (
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Lưu thành công!
              </span>
            )}
            
            <button
              type="submit"
              disabled={!isWeightValid}
              className={`gradient-btn w-full sm:w-auto flex justify-center items-center gap-2 ${
                isWeightValid 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 shadow-none'
              }`}
            >
              <Save className="w-4 h-4" />
              Lưu cấu hình
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
