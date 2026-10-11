import React, { useState, useEffect } from 'react';
import { 
  Folder, Tag, Search, Plus, Trash2, Edit3, 
  Sun, Moon, Download, Upload, ExternalLink, 
  FileAudio, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AudioItem {
  id: string;
  title: string;
  embedCode: string; // Vocaroo link or <iframe> HTML
  category: string; // Thư mục
  hashtags: string[];
  notes: string; // Ghi chú
  createdAt: string;
}

const DEFAULT_AUDIO_ITEMS: AudioItem[] = [
  {
    id: '1',
    title: 'Đạo hàm & Quy tắc chuỗi (Calculus)',
    embedCode: '<div><iframe width="300" height="60" src="https://vocaroo.com/embed/1hSdwSEXBhfZ?autoplay=0" frameborder="0" allow="autoplay"></iframe><br><a href="https://voca.ro/1hSdwSEXBhfZ" title="Vocaroo Voice Recorder" target="_blank">View on Vocaroo &gt;&gt;</a></div>',
    category: 'Toán Cao cấp',
    hashtags: ['calculus', 'daoham', 'duymt'],
    notes: 'Bản chất tốc độ thay đổi tức thời, cỗ máy chụp ảnh nhanh và quy tắc bóc hành tây.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Không gian vectơ & Ánh xạ tuyến tính',
    embedCode: 'https://vocaroo.com/1vctSpaceAlgebra',
    category: 'Đại số Tuyến tính',
    hashtags: ['algebra', 'vector', 'matrix'],
    notes: 'Hiểu sâu về chiều không gian, cơ sở và ma trận biến đổi hệ tọa độ.',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [audioList, setAudioList] = useState<AudioItem[]>(() => {
    const saved = localStorage.getItem('duymt_audio_manager_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_AUDIO_ITEMS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('duymt_theme') as 'light' | 'dark') || 'light';
  });

  // Form states
  const [title, setTitle] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [category, setCategory] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('duymt_audio_manager_v2', JSON.stringify(audioList));
  }, [audioList]);

  useEffect(() => {
    localStorage.setItem('duymt_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !embedCode.trim()) {
      showNotification('Vui lòng nhập Tiêu đề và Link/Embed code âm thanh!', 'error');
      return;
    }

    const tags = hashtagsInput
      .split(/[,#\s]+/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const now = new Date().toISOString();

    if (editId) {
      setAudioList(prev => prev.map(item => item.id === editId ? {
        ...item,
        title: title.trim(),
        embedCode: embedCode.trim(),
        category: category.trim() || 'Chưa phân loại',
        hashtags: tags,
        notes: notes.trim()
      } : item));
      setEditId(null);
      showNotification('Đã cập nhật link âm thanh thành công!');
    } else {
      const newItem: AudioItem = {
        id: crypto.randomUUID(),
        title: title.trim(),
        embedCode: embedCode.trim(),
        category: category.trim() || 'Chưa phân loại',
        hashtags: tags,
        notes: notes.trim(),
        createdAt: now
      };
      setAudioList(prev => [newItem, ...prev]);
      showNotification('Đã thêm link âm thanh mới vào hệ thống!');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }

    // Reset form
    setTitle('');
    setEmbedCode('');
    setCategory('');
    setHashtagsInput('');
    setNotes('');
  };

  const handleEdit = (item: AudioItem) => {
    setEditId(item.id);
    setTitle(item.title);
    setEmbedCode(item.embedCode);
    setCategory(item.category);
    setHashtagsInput(item.hashtags.join(', '));
    setNotes(item.notes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification('Đang chỉnh sửa: ' + item.title);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá link âm thanh này không?')) {
      setAudioList(prev => prev.filter(item => item.id !== id));
      showNotification('Đã xoá link âm thanh!');
    }
  };

  const renderAudioEmbed = (inputStr: string) => {
    if (!inputStr) return <span className="text-gray-400 text-xs">Chưa có mã nhúng</span>;
    if (inputStr.includes('<iframe') || inputStr.includes('<div')) {
      return <div dangerouslySetInnerHTML={{ __html: inputStr }} className="my-2 overflow-x-auto" />;
    }
    const match = inputStr.match(/(?:vocaroo\.com\/|voca\.ro\/)([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      const embedId = match[1];
      return (
        <div className="my-2">
          <iframe 
            width="300" 
            height="60" 
            src={`https://vocaroo.com/embed/${embedId}?autoplay=0`} 
            frameBorder="0" 
            allow="autoplay"
          ></iframe>
          <div className="mt-1">
            <a href={`https://vocaroo.com/${embedId}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1">
              View on Vocaroo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      );
    }
    return (
      <a href={inputStr} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 underline break-all inline-flex items-center gap-1">
        {inputStr} <ExternalLink className="w-3 h-3" />
      </a>
    );
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(audioList, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `duymt_audio_manager_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showNotification('Đã xuất dữ liệu JSON thành công!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setAudioList(parsed);
            showNotification('Đã nhập dữ liệu thành công!');
          } else {
            showNotification('File JSON không hợp lệ!', 'error');
          }
        } catch (err) {
          showNotification('Lỗi phân tích file JSON!', 'error');
        }
      };
    }
  };

  // Categories & Tags lists
  const categories = Array.from(new Set(audioList.map(a => a.category)));
  const allTags = Array.from(new Set(audioList.flatMap(a => a.hashtags)));

  // Filtered list
  const filteredList = audioList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.hashtags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesTag = selectedTag ? item.hashtags.includes(selectedTag) : true;
    return matchesSearch && matchesCategory && matchesTag;
  });

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 p-6 rounded-2xl shadow-xl text-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <Folder className="w-3.5 h-3.5 text-yellow-300" /> Duymt Audio Vault & Manager
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
              🎧 Quản lý Link & Mã Nhúng Âm thanh
            </h1>
            <p className="text-sm text-indigo-100 mt-1">
              Hệ thống lưu trữ, phân loại thư mục, gắn thẻ (#tag) và phát trực tiếp audio (Vocaroo / Embed).
            </p>
          </div>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/20 cursor-pointer shadow-md"
            title="Đổi giao diện Sáng/Tối"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-100" />}
          </button>
        </div>

        {/* Input Form Card */}
        <div className={`p-6 rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-500">
            <Plus className="w-5 h-5" /> {editId ? 'Chỉnh sửa Link Âm thanh' : 'Thêm Link / Mã Nhúng Âm thanh Mới'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Tiêu đề bài giảng / Audio</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Toán Cao cấp - Đạo hàm..."
                  className={`w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Thư mục (Folder)</label>
                <input 
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="VD: Toán Cao cấp, Vật lý..."
                  list="category-suggestions"
                  className={`w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
                <datalist id="category-suggestions">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Thẻ (Hashtags)</label>
                <input 
                  type="text"
                  value={hashtagsInput}
                  onChange={e => setHashtagsInput(e.target.value)}
                  placeholder="VD: calculus, daoham, sem1"
                  className={`w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Link Vocaroo hoặc Mã nhúng HTML (Embed code)</label>
              <textarea 
                rows={2}
                value={embedCode}
                onChange={e => setEmbedCode(e.target.value)}
                placeholder='Dán link (https://vocaroo.com/...) hoặc mã nhúng (<div><iframe ...></iframe></div>)'
                className={`w-full p-2.5 rounded-xl border text-sm outline-none font-mono focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Ghi chú & Tóm tắt (Notes)</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ghi chú các điểm quan trọng, công thức..."
                className={`w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {editId && (
                <button 
                  type="button" 
                  onClick={() => { setEditId(null); setTitle(''); setEmbedCode(''); setCategory(''); setHashtagsInput(''); setNotes(''); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Huỷ
                </button>
              )}
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                💾 {editId ? 'Cập nhật Link' : 'Lưu Link Âm thanh'}
              </button>
            </div>
          </form>
        </div>

        {/* Toolbar & Filters */}
        <div className={`p-4 rounded-2xl shadow-md border flex flex-col md:flex-row gap-3 items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm kiếm tiêu đề, ghi chú, thẻ..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>

            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={`p-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="">📂 Tất cả thư mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className={`p-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="">🏷️ Tất cả thẻ (#)</option>
              {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button 
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" /> Xuất JSON
            </button>
            <label className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow">
              <Upload className="w-3.5 h-3.5" /> Nhập JSON
              <input type="file" onChange={handleImport} accept=".json" className="hidden" />
            </label>
          </div>
        </div>

        {/* Audio List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.length === 0 ? (
            <div className={`col-span-full p-12 text-center rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <FileAudio className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-semibold">Không tìm thấy link âm thanh nào phù hợp.</p>
              <p className="text-xs mt-1">Hãy thêm mới hoặc thay đổi từ khóa tìm kiếm.</p>
            </div>
          ) : (
            filteredList.map(item => (
              <div 
                key={item.id}
                className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between transition hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1 border border-indigo-500/20">
                        📁 {item.category}
                      </span>
                      <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Embedded Player */}
                  <div className={`p-3 rounded-xl my-3 border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Trình phát Audio trực tiếp / View on Vocaroo:</div>
                    {renderAudioEmbed(item.embedCode)}
                  </div>

                  {item.notes && (
                    <p className="text-xs leading-relaxed opacity-90 my-3 font-mono bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {item.hashtags.map((tag, idx) => (
                      <span 
                        key={idx}
                        onClick={() => setSelectedTag(tag)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 cursor-pointer hover:bg-indigo-900 transition"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] opacity-50">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Toast notification */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl border font-bold text-sm z-50 flex items-center gap-2 transition-all transform translate-y-0 ${toastType === 'error' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-slate-900 border-indigo-500 text-indigo-200'}`}>
          {toastType === 'error' ? '⚠️' : '✅'} {toastMessage}
        </div>
      )}

    </div>
  );
}
