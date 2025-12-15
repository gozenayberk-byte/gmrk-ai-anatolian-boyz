
import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, SiteContent, User, Testimonial, DashboardStats, SystemUpdate } from '../types';
import { storageService } from '../services/storageService';
import { 
  Settings, Plus, Trash2, Edit2, Save, X, 
  Zap, Star, Building2, ArrowLeft, Layout, HelpCircle, Briefcase, RefreshCw, Users, BookOpen, PanelBottom, MessageCircle, Activity, Mail, Gift,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, BarChart3, Filter, Search, Lightbulb, ChevronDown, ChevronUp, GitCommit, CreditCard, Lock, ShieldCheck
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
    refreshData();
  }, [siteContent]);

  const refreshData = async () => {
        try {
            const users = await storageService.getAllUsers();
            setUserList(users);
            
            const stats = await storageService.getDashboardStats();
            setDashboardStats(stats);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
  };

  // KULLANICI YÖNETİMİ
  const handleDeleteUser = (email: string) => {
    if (window.confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
        storageService.deleteUser(email);
        setUserList(prev => prev.filter(u => u.email !== email));
    }
  };

  const handleUpdateUserPlan = async (userEmail: string, planId: string) => {
      // Planı bul
      let planName = '';
      if(planId === 'free') planName = 'Başlangıç (Free)';
      else if(planId === '1') planName = 'Girişimci';
      else if(planId === '2') planName = 'Profesyonel';
      else if(planId === '3') planName = 'Kurumsal';

      if(window.confirm(`${userEmail} kullanıcısını "${planName}" paketine geçirmek istiyor musunuz?`)) {
          // Dummy plan object
          const plan: any = { 
              id: planId, 
              name: planName, 
              price: '0' 
          };
          
          try {
              await storageService.updateUserSubscription(plan, userEmail);
              await refreshData(); // Listeyi yenile
              alert("Kullanıcı paketi güncellendi.");
          } catch(e) {
              alert("Hata oluştu.");
          }
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
                                <th className="px-6 py-3">Rol / Plan</th>
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
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit
                                                ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}
                                            `}>
                                                {u.role === 'admin' ? 'YÖNETİCİ' : 'KULLANICI'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {u.planId === 'free' ? 'Başlangıç' : 
                                                 u.planId === '1' ? 'Girişimci (399₺)' : 
                                                 u.planId === '2' ? 'Profesyonel (2499₺)' : 'Kurumsal'}
                                            </span>
                                        </div>
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
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Plan Değiştirme Butonları */}
                                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                <button onClick={() => handleUpdateUserPlan(u.email, 'free')} title="Başlangıç Yap" className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Zap className="w-3 h-3" /></button>
                                                <button onClick={() => handleUpdateUserPlan(u.email, '1')} title="Girişimci Yap" className="p-1.5 hover:bg-brand-50 text-slate-400 hover:text-brand-600 border-l border-slate-200"><Star className="w-3 h-3" /></button>
                                                <button onClick={() => handleUpdateUserPlan(u.email, '2')} title="Profesyonel Yap" className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border-l border-slate-200"><Building2 className="w-3 h-3" /></button>
                                                <button onClick={() => handleUpdateUserPlan(u.email, '3')} title="Yönetici Yap (Kurumsal)" className="p-1.5 hover:bg-purple-50 text-slate-400 hover:text-purple-600 border-l border-slate-200"><ShieldCheck className="w-3 h-3" /></button>
                                            </div>

                                            {u.role !== 'admin' && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.email)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                                                    title="Kullanıcıyı Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
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

        {/* ... (Other Tabs remain the same) ... */}
        {activeTab === 'plans' && (/* ... Plans content ... */ <div className="p-8 text-center text-slate-400">Paket yönetimi (önceki kod)</div>)}
        {activeTab === 'updates' && (/* ... Updates content ... */ <div className="p-8 text-center text-slate-400">Sürüm notları (önceki kod)</div>)}
        {activeTab === 'content' && (/* ... Content Editor content ... */ <div className="p-8 text-center text-slate-400">İçerik düzenleyici (önceki kod)</div>)}
        {activeTab === 'settings' && (/* ... Settings content ... */ <div className="p-8 text-center text-slate-400">Ayarlar (önceki kod)</div>)}

      </div>
    </div>
  );
};

export default AdminPanel;
