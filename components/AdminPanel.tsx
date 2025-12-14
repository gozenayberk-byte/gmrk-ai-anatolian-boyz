
import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, SiteContent, User, Testimonial, DashboardStats, SystemUpdate } from '../types';
import { storageService } from '../services/storageService';
import { 
  Settings, Plus, Trash2, Edit2, Save, X, 
  Zap, Star, Building2, ArrowLeft, Layout, HelpCircle, Briefcase, RefreshCw, Users, BookOpen, PanelBottom, MessageCircle, Activity, Mail, Gift,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, BarChart3, Filter, Search, Lightbulb, ChevronDown, ChevronUp, GitCommit, CreditCard, Lock
} from 'lucide-react';

interface AdminPanelProps {
  plans: SubscriptionPlan[];
  siteContent: SiteContent;
  onUpdatePlan: (plan: SubscriptionPlan) => void;
  onAddPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (id: string) => void;
  onUpdateContent: (content: SiteContent) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  plans, 
  siteContent,
  onUpdatePlan, 
  onAddPlan, 
  onDeletePlan,
  onUpdateContent,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'updates' | 'users' | 'plans' | 'settings'>('dashboard');
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editedContent, setEditedContent] = useState<SiteContent>(siteContent);
  const [userList, setUserList] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('week');
  
  // Update Logic State
  const [editingUpdate, setEditingUpdate] = useState<SystemUpdate | null>(null);
  const [isNewUpdate, setIsNewUpdate] = useState(false);

  // İçerik Yönetimi Alt Sekmeleri
  const [contentTab, setContentTab] = useState<'hero' | 'promo' | 'roi' | 'pro' | 'corp' | 'faq' | 'guide' | 'footer' | 'legal'>('hero');

  // Verileri yükle
  useEffect(() => {
    setEditedContent(siteContent);
    
    const loadData = async () => {
        try {
            const users = await storageService.getAllUsers();
            setUserList(users);
            
            const stats = await storageService.getDashboardStats();
            setDashboardStats(stats);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };
    
    loadData();
  }, [siteContent]);

  // KULLANICI YÖNETİMİ
  const handleDeleteUser = (email: string) => {
    if (window.confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
        storageService.deleteUser(email);
        setUserList(prev => prev.filter(u => u.email !== email));
    }
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // PLAN YÖNETİMİ
  const handleCreateNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: Date.now().toString(),
      name: "Yeni Paket",
      price: "0 ₺",
      period: "/ ay",
      description: "Paket açıklaması buraya...",
      iconKey: 'zap',
      features: ["Özellik 1"],
      cta: "Satın Al",
      popular: false,
      color: 'slate'
    };
    onAddPlan(newPlan);
    setEditingPlan(newPlan);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      onUpdatePlan(editingPlan);
      setEditingPlan(null);
    }
  };

  const updatePlanField = (field: keyof SubscriptionPlan, value: any) => {
    setEditingPlan(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const updatePlanFeature = (index: number, value: string) => {
    setEditingPlan(prev => {
      if (!prev) return null;
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const addPlanFeature = () => {
    setEditingPlan(prev => prev ? ({ ...prev, features: [...prev.features, "Yeni Özellik"] }) : null);
  };

  const removePlanFeature = (index: number) => {
    setEditingPlan(prev => {
      if (!prev) return null;
      const newFeatures = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: newFeatures };
    });
  };

  // İÇERİK YÖNETİMİ
  const handleSaveContent = () => {
    onUpdateContent(editedContent);
    alert("Tüm değişiklikler başarıyla kaydedildi!");
  };

  const updateSection = (section: keyof SiteContent, field: string, value: any) => {
    setEditedContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // UPDATE YÖNETİMİ
  const handleEditUpdate = (update: SystemUpdate) => {
    setEditingUpdate({...update});
    setIsNewUpdate(false);
  };

  const handleCreateUpdate = () => {
    setEditingUpdate({
      id: Date.now().toString(),
      version: "vX.X",
      date: "Bugün",
      title: "Yeni Güncelleme",
      type: "improvement",
      description: "Güncelleme açıklaması...",
      changes: ["Değişiklik 1"]
    });
    setIsNewUpdate(true);
  };

  const handleSaveUpdate = () => {
    if (!editingUpdate) return;
    
    let newUpdates = [...editedContent.updates];
    if (isNewUpdate) {
      newUpdates = [editingUpdate, ...newUpdates];
    } else {
      newUpdates = newUpdates.map(u => u.id === editingUpdate.id ? editingUpdate : u);
    }
    
    setEditedContent(prev => ({ ...prev, updates: newUpdates }));
    setEditingUpdate(null);
  };

  const handleDeleteUpdate = (id: string) => {
    if (window.confirm("Bu güncellemeyi silmek istediğinize emin misiniz?")) {
      const newUpdates = editedContent.updates.filter(u => u.id !== id);
      setEditedContent(prev => ({ ...prev, updates: newUpdates }));
    }
  };

  const updateChangeItem = (index: number, val: string) => {
    if (!editingUpdate) return;
    const newChanges = [...editingUpdate.changes];
    newChanges[index] = val;
    setEditingUpdate({...editingUpdate, changes: newChanges});
  };

  const addChangeItem = () => {
    if (!editingUpdate) return;
    setEditingUpdate({...editingUpdate, changes: [...editingUpdate.changes, "Yeni özellik"]});
  };

  const removeChangeItem = (index: number) => {
    if (!editingUpdate) return;
    const newChanges = editingUpdate.changes.filter((_, i) => i !== index);
    setEditingUpdate({...editingUpdate, changes: newChanges});
  };

  // --- RENDER HELPERS ---
  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>%{Math.abs(change)}</span>
                <span className="text-slate-400 font-normal ml-1">düne göre</span>
            </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yönetim Paneli</h1>
              <p className="text-slate-500 text-xs">Sistem durumu ve içerik yönetimi</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1 overflow-x-auto">
            {[
                { id: 'dashboard', label: 'Genel Bakış', icon: BarChart3 },
                { id: 'content', label: 'İçerik', icon: Layout },
                { id: 'updates', label: 'Sürüm Notları', icon: GitCommit },
                { id: 'users', label: 'Kullanıcılar', icon: Users },
                { id: 'plans', label: 'Paketler', icon: Zap },
                { id: 'settings', label: 'Ayarlar', icon: Settings },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                        activeTab === tab.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
          </div>
        </div>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-8 animate-in fade-in">
                {/* Filters */}
                <div className="flex justify-end gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={filterPeriod} 
                            onChange={(e) => setFilterPeriod(e.target.value as any)}
                            className="bg-transparent border-none outline-none text-slate-700 font-medium"
                        >
                            <option value="today">Bugün</option>
                            <option value="week">Bu Hafta</option>
                            <option value="month">Bu Ay</option>
                        </select>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Toplam Ciro" 
                        value={`${dashboardStats.totalRevenue.toLocaleString()} ₺`} 
                        change={dashboardStats.revenueChange} 
                        icon={DollarSign} 
                        color="bg-green-500" 
                    />
                    <StatCard 
                        title="Toplam Satış" 
                        value={dashboardStats.totalSales} 
                        change={dashboardStats.salesChange} 
                        icon={ShoppingBag} 
                        color="bg-blue-500" 
                    />
                    <StatCard 
                        title="Yeni Üyeler" 
                        value={dashboardStats.newUsers} 
                        change={dashboardStats.usersChange} 
                        icon={Users} 
                        color="bg-indigo-500" 
                    />
                    <StatCard 
                        title="Yapılan Analiz" 
                        value={dashboardStats.totalAnalyses} 
                        change={dashboardStats.analysesChange} 
                        icon={Activity} 
                        color="bg-amber-500" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sales Chart (Bar) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-6">Satış Performansı (Son 7 Gün)</h3>
                        <div className="flex items-end justify-between h-64 gap-4 mt-auto">
                            {dashboardStats.salesChart.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div 
                                        className="w-full bg-brand-100 rounded-t-lg group-hover:bg-brand-600 transition-all relative"
                                        style={{ height: `${(d.value / 40) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.value} Satış
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Distribution (User Breakdown) - NEW */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Kullanıcı Dağılımı</h3>
                        <div className="flex flex-col gap-6">
                            {dashboardStats.planDistribution.map((plan, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-slate-700">{plan.name}</span>
                                        <span className="font-bold text-slate-900">{plan.count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${(plan.count / dashboardStats.newUsers) * 100}%`,
                                                backgroundColor: plan.color 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                            Toplam {dashboardStats.newUsers} kayıtlı kullanıcı verisine göre.
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-2 mb-6">
                        <Lightbulb className="w-5 h-5 text-yellow-300" />
                        <h3 className="font-bold text-lg">Satış Artırma Önerileri</h3>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {dashboardStats.recommendations.map((rec, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-indigo-100">{rec.title}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${rec.impact === 'high' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {rec.impact === 'high' ? 'Yüksek Etki' : 'Orta Etki'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-800">Kayıtlı Kullanıcılar</h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="İsim veya E-posta ara..." 
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                <th className="px-6 py-3">Ad Soyad</th>
                                <th className="px-6 py-3">E-Posta</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Kredi</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.planId === '2' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {u.planId === '1' ? 'Girişimci' : u.planId === '2' ? 'Profesyonel' : 'Kurumsal'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{u.credits === -1 ? '∞' : u.credits}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {u.isEmailVerified && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit">E-Posta Onaylı</span>}
                                            {u.isPhoneVerified && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit">Tel Onaylı</span>}
                                            {!u.isEmailVerified && !u.isPhoneVerified && <span className="text-[10px] text-red-500">Onaysız</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.email)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                                                title="Kullanıcıyı Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Kullanıcı bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- PLANS TAB --- */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            {/* Same Plans UI as before */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-700">Mevcut Paketler</h3>
                 <button onClick={handleCreateNewPlan} className="text-xs flex items-center gap-1 bg-brand-600 text-white px-2 py-1 rounded hover:bg-brand-700">
                    <Plus className="w-3 h-3" /> Ekle
                 </button>
              </div>
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setEditingPlan(plan)}
                  className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                    ${editingPlan?.id === plan.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${plan.color === 'brand' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                        {plan.iconKey === 'zap' && <Zap className="w-4 h-4" />}
                        {plan.iconKey === 'star' && <Star className="w-4 h-4" />}
                        {plan.iconKey === 'building' && <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500">{plan.price} {plan.period}</p>
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">
                        Popüler
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8">
              {editingPlan ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Paket Düzenle: {editingPlan.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onDeletePlan(editingPlan.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Paketi Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Paket Adı</label>
                        <input 
                          type="text" 
                          value={editingPlan.name}
                          onChange={(e) => updatePlanField('name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Fiyat</label>
                        <input 
                          type="text"
                          value={editingPlan.price}
                          onChange={(e) => updatePlanField('price', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Periyot</label>
                        <input 
                          type="text" 
                          value={editingPlan.period}
                          onChange={(e) => updatePlanField('period', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">İkon</label>
                        <select 
                          value={editingPlan.iconKey}
                          onChange={(e) => updatePlanField('iconKey', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                        >
                          <option value="zap">Şimşek</option>
                          <option value="star">Yıldız</option>
                          <option value="building">Bina</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama</label>
                      <textarea 
                        value={editingPlan.description}
                        onChange={(e) => updatePlanField('description', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none h-20 resize-none text-slate-900"
                      />
                    </div>

                    <div className="flex gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editingPlan.popular}
                          onChange={(e) => updatePlanField('popular', e.target.checked)}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">"En Çok Tercih Edilen" olarak işaretle</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Paket Özellikleri</label>
                        <button onClick={addPlanFeature} className="text-xs flex items-center gap-1 text-brand-600 font-medium hover:underline">
                          <Plus className="w-3 h-3" /> Özellik Ekle
                        </button>
                      </div>
                      {editingPlan.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            value={feature}
                            onChange={(e) => updatePlanFeature(idx, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm text-slate-900"
                          />
                          <button onClick={() => removePlanFeature(idx)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                        İptal
                      </button>
                      <button onClick={handleSavePlan} className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-sm flex items-center gap-2 transition-colors">
                        <Save className="w-4 h-4" />
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Edit2 className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">Düzenlemek için soldan bir paket seçin</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- UPDATES TAB (NEW) --- */}
        {activeTab === 'updates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-slate-700">Sürüm Geçmişi</h3>
                   <button onClick={handleCreateUpdate} className="text-xs flex items-center gap-1 bg-brand-600 text-white px-2 py-1 rounded hover:bg-brand-700">
                      <Plus className="w-3 h-3" /> Yeni Sürüm
                   </button>
                </div>
                {editedContent.updates.map((update) => (
                   <div 
                      key={update.id}
                      onClick={() => handleEditUpdate(update)}
                      className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                        ${editingUpdate?.id === update.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}
                      `}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">{update.version}</span>
                         <span className="text-xs text-slate-500">{update.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">{update.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{update.description}</p>
                   </div>
                ))}
             </div>

             <div className="lg:col-span-2">
                {editingUpdate ? (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                         <h3 className="font-bold text-slate-800">
                            {isNewUpdate ? "Yeni Sürüm Oluştur" : `Düzenle: ${editingUpdate.version}`}
                         </h3>
                         {!isNewUpdate && (
                            <button onClick={() => handleDeleteUpdate(editingUpdate.id)} className="text-red-500 hover:text-red-700">
                               <Trash2 className="w-5 h-5" />
                            </button>
                         )}
                      </div>
                      <div className="p-6 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Versiyon</label>
                               <input type="text" value={editingUpdate.version} onChange={(e) => setEditingUpdate({...editingUpdate, version: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Tarih</label>
                               <input type="text" value={editingUpdate.date} onChange={(e) => setEditingUpdate({...editingUpdate, date: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                            </div>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Başlık</label>
                            <input type="text" value={editingUpdate.title} onChange={(e) => setEditingUpdate({...editingUpdate, title: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg font-bold" />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Açıklama</label>
                            <textarea value={editingUpdate.description} onChange={(e) => setEditingUpdate({...editingUpdate, description: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg h-20" />
                         </div>
                         
                         <div>
                            <div className="flex justify-between items-center mb-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Değişiklik Maddeleri</label>
                               <button onClick={addChangeItem} className="text-xs text-brand-600 hover:underline">+ Madde Ekle</button>
                            </div>
                            <div className="space-y-2">
                               {editingUpdate.changes.map((change, idx) => (
                                  <div key={idx} className="flex gap-2">
                                     <input type="text" value={change} onChange={(e) => updateChangeItem(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                                     <button onClick={() => removeChangeItem(idx)} className="text-slate-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                     </button>
                                  </div>
                               ))}
                            </div>
                         </div>

                         <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => { setEditingUpdate(null); setIsNewUpdate(false); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">İptal</button>
                            <button onClick={() => { handleSaveUpdate(); handleSaveContent(); }} className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-sm flex items-center gap-2">
                               <Save className="w-4 h-4" /> Kaydet
                            </button>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <GitCommit className="w-12 h-12 mb-4 opacity-20" />
                      <p>Düzenlemek için bir güncelleme seçin</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* --- CONTENT TAB (COMPREHENSIVE) --- */}
        {activeTab === 'content' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in flex flex-col md:flex-row min-h-[600px]">
              
              {/* Content Sub-Sidebar */}
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex-shrink-0">
                  <div className="p-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Site Bölümleri</div>
                  <div className="flex flex-col">
                      {[
                          { id: 'hero', label: '1. Hero & Giriş' },
                          { id: 'promo', label: '2. Kampanyalar' },
                          { id: 'roi', label: '3. ROI & Fayda' },
                          { id: 'pro', label: '4. Pro Paket' },
                          { id: 'corp', label: '5. Kurumsal' },
                          { id: 'faq', label: '6. S.S.S.' },
                          { id: 'guide', label: '7. Kılavuz' },
                          { id: 'footer', label: '8. Footer & Yasal' },
                      ].map(item => (
                          <button
                              key={item.id}
                              onClick={() => setContentTab(item.id as any)}
                              className={`px-6 py-3 text-sm font-medium text-left transition-colors border-l-4 ${
                                  contentTab === item.id 
                                  ? 'bg-white text-brand-600 border-brand-600' 
                                  : 'text-slate-600 border-transparent hover:bg-slate-100'
                              }`}
                          >
                              {item.label}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Content Editor Area */}
              <div className="flex-1 p-6 md:p-10 relative">
                 <div className="absolute top-4 right-4">
                    <button 
                      onClick={handleSaveContent}
                      className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <Save className="w-4 h-4" />
                      Değişiklikleri Yayına Al
                    </button>
                 </div>

                 <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-slate-400" />
                        İçerik Düzenle
                    </h2>

                    {/* HERO EDITOR */}
                    {contentTab === 'hero' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Üst Rozet (Badge)</label>
                                <input type="text" value={editedContent.hero.badge} onChange={(e) => updateSection('hero', 'badge', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Başlık (Satır 1)</label>
                                <input type="text" value={editedContent.hero.titleLine1} onChange={(e) => updateSection('hero', 'titleLine1', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Başlık (Satır 2 - Renkli)</label>
                                <input type="text" value={editedContent.hero.titleLine2} onChange={(e) => updateSection('hero', 'titleLine2', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold text-brand-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama</label>
                                <textarea value={editedContent.hero.description} onChange={(e) => updateSection('hero', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg h-24" />
                            </div>
                        </div>
                    )}

                    {/* PROMO EDITOR */}
                    {contentTab === 'promo' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center gap-2 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <input 
                                    type="checkbox" 
                                    checked={editedContent.freeCreditsPromo?.isActive} 
                                    onChange={(e) => updateSection('freeCreditsPromo', 'isActive', e.target.checked)}
                                    className="w-5 h-5 accent-brand-600"
                                />
                                <span className="font-bold text-slate-700">Ücretsiz Kredi Kampanyasını Göster</span>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Kampanya Başlığı</label>
                                <input type="text" value={editedContent.freeCreditsPromo?.title} onChange={(e) => updateSection('freeCreditsPromo', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Kampanya Açıklaması</label>
                                <input type="text" value={editedContent.freeCreditsPromo?.description} onChange={(e) => updateSection('freeCreditsPromo', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                    )}

                    {/* ROI EDITOR */}
                    {contentTab === 'roi' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Rozet</label>
                                <input type="text" value={editedContent.roi.badge} onChange={(e) => updateSection('roi', 'badge', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Başlık</label>
                                <input type="text" value={editedContent.roi.title} onChange={(e) => updateSection('roi', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama</label>
                                <textarea value={editedContent.roi.description} onChange={(e) => updateSection('roi', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg h-24" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 rounded-lg">
                                <label className="text-xs font-bold text-slate-400">Karşılaştırma Listesi</label>
                                <input type="text" value={editedContent.roi.comparison1} onChange={(e) => updateSection('roi', 'comparison1', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-red-600" />
                                <input type="text" value={editedContent.roi.comparison2} onChange={(e) => updateSection('roi', 'comparison2', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-red-600" />
                                <input type="text" value={editedContent.roi.comparison3} onChange={(e) => updateSection('roi', 'comparison3', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-green-600 font-bold" />
                            </div>
                        </div>
                    )}

                    {/* FAQ EDITOR - SIMPLIFIED */}
                    {contentTab === 'faq' && (
                        <div className="space-y-6 animate-in fade-in">
                             <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">S.S.S. Başlığı</label>
                                <input type="text" value={editedContent.faq.title} onChange={(e) => updateSection('faq', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Alt Başlık</label>
                                <input type="text" value={editedContent.faq.subtitle} onChange={(e) => updateSection('faq', 'subtitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="space-y-4 mt-4">
                                {editedContent.faq.items.map((item, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="mb-2 font-bold text-xs text-slate-400">SORU {i+1}</div>
                                        <input 
                                            className="w-full mb-2 px-3 py-2 border rounded" 
                                            value={item.question}
                                            onChange={(e) => {
                                                const newItems = [...editedContent.faq.items];
                                                newItems[i].question = e.target.value;
                                                updateSection('faq', 'items', newItems);
                                            }}
                                        />
                                        <textarea 
                                            className="w-full px-3 py-2 border rounded h-20"
                                            value={item.answer}
                                            onChange={(e) => {
                                                const newItems = [...editedContent.faq.items];
                                                newItems[i].answer = e.target.value;
                                                updateSection('faq', 'items', newItems);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTHER SECTIONS (Pro, Corp, Guide, Footer) - GENERIC IMPLEMENTATION */}
                    {['pro', 'corp', 'guide', 'footer', 'legal'].includes(contentTab) && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                            <Layout className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-center max-w-md">
                                Bu bölüm ({contentTab.toUpperCase()}) için detaylı düzenleme alanları yukarıdaki mantıkla eklenebilir. 
                                <br/><br/>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded">Şu an için "Genel Bakış" ve "Hero" sekmeleri tam fonksiyoneldir.</span>
                            </p>
                        </div>
                    )}

                 </div>
              </div>
           </div>
        )}

        {/* --- SETTINGS TAB (Email & Integrations & PAYMENT) --- */}
        {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in">
                <div className="max-w-2xl space-y-12">
                    
                    {/* Payment Settings */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                            Ödeme Altyapısı (Iyzico)
                        </h3>
                        <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div>
                                <label className="text-sm font-medium text-slate-700">API Key</label>
                                <div className="relative mt-1">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="password" 
                                        value={editedContent.paymentSettings.apiKey}
                                        onChange={(e) => updateSection('paymentSettings', 'apiKey', e.target.value)}
                                        className="w-full pl-9 px-3 py-2 border rounded-lg"
                                        placeholder="sandbox-..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Secret Key</label>
                                <div className="relative mt-1">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="password" 
                                        value={editedContent.paymentSettings.secretKey}
                                        onChange={(e) => updateSection('paymentSettings', 'secretKey', e.target.value)}
                                        className="w-full pl-9 px-3 py-2 border rounded-lg"
                                        placeholder="sandbox-..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Base URL</label>
                                <input 
                                    type="text" 
                                    value={editedContent.paymentSettings.baseUrl}
                                    onChange={(e) => updateSection('paymentSettings', 'baseUrl', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    placeholder="https://sandbox-api.iyzipay.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Settings */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Mail className="w-5 h-5 text-slate-400" />
                            E-Posta Ayarları
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Gönderici Adı</label>
                                <input 
                                    type="text" 
                                    value={editedContent.emailSettings.senderName}
                                    onChange={(e) => updateSection('emailSettings', 'senderName', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Konu Başlığı</label>
                                <input 
                                    type="text" 
                                    value={editedContent.emailSettings.subject}
                                    onChange={(e) => updateSection('emailSettings', 'subject', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">E-Posta İçeriği (Template)</label>
                                <textarea 
                                    value={editedContent.emailSettings.body}
                                    onChange={(e) => updateSection('emailSettings', 'body', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg h-32 font-mono text-sm"
                                />
                                <p className="text-xs text-slate-400 mt-1">Değişkenler: {'{ad_soyad}, {paket_adi}, {fiyat}'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Settings */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Activity className="w-5 h-5 text-slate-400" />
                            Takip Kodları (Pixel)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Meta (Facebook) Pixel ID</label>
                                <input 
                                    type="text" 
                                    value={editedContent.tracking.metaPixelId}
                                    onChange={(e) => updateSection('tracking', 'metaPixelId', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    placeholder="XXXXXXXXXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">TikTok Pixel ID</label>
                                <input 
                                    type="text" 
                                    value={editedContent.tracking.tiktokPixelId}
                                    onChange={(e) => updateSection('tracking', 'tiktokPixelId', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    placeholder="XXXXXXXXXXXXXXX"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={handleSaveContent}
                            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
                        >
                            Ayarları Kaydet
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
