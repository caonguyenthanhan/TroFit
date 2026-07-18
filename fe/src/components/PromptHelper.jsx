import React, { useState, useEffect } from 'react';
import { Copy, Check, MessageSquare, Terminal } from 'lucide-react';
import { exportData, getProfile } from '../lib/storage';
import { getTags } from '../lib/tags';

export default function PromptHelper({ selectedRooms, config }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const getExportJson = () => {
    const data = exportData();
    if (selectedRooms && selectedRooms.length > 0) {
      return JSON.stringify({
        exportedAt: data.exportedAt,
        config: data.config,
        profile: data.profile,
        danhSachPhong: selectedRooms
      }, null, 2);
    }
    return JSON.stringify(data, null, 2);
  };

  const getSystemPrompt = () => {
    const prof = profile || { thuNhap: 0, mandatoryTags: [], optionalTags: [] };
    const allAvailableTags = getTags();
    const getTagName = (id) => allAvailableTags.find(t => t.id === id)?.label || id;

    const weightsText = Object.entries(config.weights || {})
      .map(([key, val]) => {
        const labels = {
          viTri: 'Vị trí/Khoảng cách',
          chiPhi: 'Chi phí',
          tienIch: 'Tiện ích xung quanh',
          dienTich: 'Diện tích',
          camQuan: 'Cảm quan thực tế',
          doThoang: 'Độ thoáng & Thiết bị',
          phuHopCaNhan: 'Phù hợp cá nhân (Đáp ứng tag)'
        };
        return `- ${labels[key] || key}: ${Math.round(val * 100)}%`;
      })
      .join('\n');

    const mandatoryText = prof.mandatoryTags.length > 0 
      ? prof.mandatoryTags.map(getTagName).join(', ') 
      : 'Không có';
    const optionalText = prof.optionalTags.length > 0 
      ? prof.optionalTags.map(getTagName).join(', ') 
      : 'Không có';

    return `Đây là dữ liệu các phòng trọ tôi đã đi khảo sát thực tế (dữ liệu JSON đính kèm ở dưới).
Hãy phân tích ưu/nhược điểm chi tiết của từng phòng dựa trên các thông số thực tế và cảm quan mà tôi đã ghi chép.

Mục tiêu của tôi là tìm phòng phù hợp nhất dựa trên hồ sơ cá nhân sau:
- Thu nhập hàng tháng: ${(prof.thuNhap || 0).toLocaleString()}đ/tháng
- Ngân sách trọ tối ưu: ${(prof.thuNhap * (prof.percentNganSach || 30) / 100).toLocaleString()}đ/tháng (chiếm ${prof.percentNganSach || 30}% thu nhập)
- Thời gian đi làm lý tưởng: ${prof.thoiGianDenCongTy || 20} phút
- Trọng số độ ưu tiên cá nhân:
${weightsText}
- Yêu cầu BẮT BUỘC: ${mandatoryText}
- Yêu cầu TÙY CHỌN: ${optionalText}

Nhiệm vụ của bạn (AI):
1. Đánh giá chi tiết ưu điểm, nhược điểm nổi bật của từng phòng (đặc biệt lưu ý về chi phí trọn gói, khoảng cách đi làm, và các yêu cầu bắt buộc có bị thiếu hay không).
2. Xếp hạng thứ tự ưu tiên các phòng từ tốt nhất đến kém nhất.
3. Đưa ra lời khuyên đàm phán hoặc đặt câu hỏi thêm cho chủ nhà đối với phòng tốt nhất để tối ưu chi phí hoặc thỏa thuận cọc.

Dữ liệu khảo sát phòng trọ dạng JSON:
\`\`\`json
${getExportJson()}
\`\`\`
`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getSystemPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(getExportJson());
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Gợi Ý Phân Tích Với Trợ Lý AI</h3>
          <p className="text-slate-400 text-xs mt-0.5">Sao chép dữ liệu JSON và prompt mẫu để đưa cho ChatGPT/Claude/Gemini phân tích thêm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hướng dẫn & Copy Prompt */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">1. Prompt Phân Tích Kèm Hồ Sơ Tài Chính</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prompt mẫu này đã chứa sẵn thông tin thu nhập, các yêu cầu bắt buộc/tùy chọn của bạn và danh sách phòng trọ bạn đã khảo sát.
              Dán trực tiếp vào ô chat của AI để nhận tư vấn chuyên sâu.
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 transition-all"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Đã sao chép Prompt!
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Sao chép Prompt + Dữ liệu
              </>
            )}
          </button>
        </div>

        {/* JSON Data Raw */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">2. Xuất Dữ Liệu Dạng JSON Thô</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nếu bạn chỉ muốn lấy dữ liệu thô JSON để tải lên trực tiếp làm tệp đính kèm trong các mô hình AI hoặc sử dụng cho mục đích khác.
            </p>
          </div>

          <button
            onClick={handleCopyData}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 hover:text-slate-200 transition-all"
          >
            {copiedData ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Đã sao chép JSON!
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4 text-indigo-400" />
                Sao chép dữ liệu JSON thô
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview prompt thu gọn */}
      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 overflow-hidden relative">
        <span className="absolute top-2 right-3 text-[10px] text-slate-600 uppercase tracking-widest font-mono">Bản xem trước Prompt</span>
        <div className="text-[11px] text-slate-500 font-mono whitespace-pre-wrap max-h-[120px] overflow-y-auto leading-relaxed">
          {getSystemPrompt().slice(0, 450)}...
          {"\n[Nội dung dữ liệu JSON phòng trọ...]"}
        </div>
      </div>
    </div>
  );
}
