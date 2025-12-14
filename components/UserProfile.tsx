
import React, { useState, useEffect } from 'react';
import { User, HistoryItem, BillingHistory, SubscriptionPlan } from '../types';
import { storageService } from '../services/storageService';
import { 
  User as UserIcon, Settings, CreditCard, History, LogOut, 
  ChevronRight, Calendar, Package, Download, Shield, Clock, 
  ArrowUpRight, AlertTriangle, CheckCircle2, Zap, Gift, Smartphone, Mail, HelpCircle
} from 'lucide-react';
import GuideContent from './GuideContent';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onSelectHistory: (item: HistoryItem) => void;
  onCancelSubscription: () => void;
  plans: SubscriptionPlan[];
  onUpgradeClick: () => void;
  onOpenVerification: () => void; 
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onLogout, 
  onSelectHistory, 
  onCancelSubscription,
  plans,
  onUpgradeClick,
  onOpenVerification
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'billing' | 'guide'>('profile');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [billing, setBilling] = useState<BillingHistory[]>([]);
  
  // İçeriği buradan alıyoruz
  const siteContent = storageService.getSiteContent();

  useEffect(() => {
    const fetchData = async () => {
        const hData = await storageService.getUserHistory(user.email);
        setHistory(hData);
        const bData = await storageService.getUserBilling(user.email);
        setBilling(bData);
    };
    fetchData();
  }, [user]);

  // Plan bulunamazsa (örneğin ID='free') fallback uygula
  const currentPlan = plans.find(p => p.id === user.planId);
  const planName = currentPlan ? currentPlan.name : (user.planId === 'free' ? "Ücretsiz Başlangıç" : "Bilinmeyen Paket");

  // Helper component for Tabs
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all font-medium text-left mb-2
        ${activeTab === id 
          ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100' 
          : 'text-slate-600 hover:bg-slate-50'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-brand-600' : 'text-slate-400'}`} />
      {label}
      <ChevronRight className={`w-4 h-4 ml-auto ${activeTab === id ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-2xl font-bold text-brand-700">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-slate-900 truncate">{user.name}</h2>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                    {user.title}
                   </span>
                   {user.isEmailVerified && user.isPhoneVerified && (
                     <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-bold flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Onaylı
                     </span>
                   )}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <TabButton id="profile" label="Üyelik & Abonelik" icon={UserIcon} />
              <TabButton id="history" label="Sorgu Geçmişi" icon={History} />
              <TabButton id="billing" label="Ödeme Geçmişi" icon={CreditCard} />
              <TabButton id="guide" label={siteContent.guide.sectionTitle} icon={HelpCircle} />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* Verification Banner in Sidebar */}
          {(!user.isEmailVerified || !user.isPhoneVerified) && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 font-bold text-lg mb-2">
                    <Gift className="w-5 h-5 text-yellow-300 animate-pulse" />
                    Kredi Kazan!
                </div>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                   Hesabını doğrulayarak ücretsiz analiz hakkı kazanabilirsin.
                </p>
                <button 
                  onClick={onOpenVerification}
                  className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors"
                >
                   Hemen Doğrula
                </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          
          {/* PROFILE & SUBSCRIPTION TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Verification Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" />
                    Hesap Doğrulama
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${user.isEmailVerified ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${user.isEmailVerified ? 'bg-white text-green-600' : 'bg-white text-slate-400'}`}>
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className={`font-bold ${user.isEmailVerified ? 'text-green-800' : 'text-slate-700'}`}>E-Posta</div>
                                <div className="text-xs text-slate-500">{user.isEmailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</div>
                            </div>
                        </div>
                        {user.isEmailVerified ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <button onClick={onOpenVerification} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-700">
                                Doğrula (+1 Hak)
                            </button>
                        )}
                    </div>

                    <div className={`p-4 rounded-xl border ${user.isPhoneVerified ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${user.isPhoneVerified ? 'bg-white text-green-600' : 'bg-white text-slate-400'}`}>
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className={`font-bold ${user.isPhoneVerified ? 'text-green-800' : 'text-slate-700'}`}>Telefon</div>
                                <div className="text-xs text-slate-500">{user.isPhoneVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</div>
                            </div>
                        </div>
                         {user.isPhoneVerified ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <button onClick={onOpenVerification} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-700">
                                Doğrula (+1 Hak)
                            </button>
                        )}
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-slate-400" />
                  Mevcut Abonelik
                </h3>
                
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${user.planId === '2' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                        {user.planId === '2' ? <Zap className="w-8 h-8" /> : <Package className="w-8 h-8" />}
                     </div>
                     <div>
                       <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Aktif Paket</div>
                       <div className="text-2xl font-bold text-slate-900">{planName}</div>
                       <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {user.subscriptionStatus === 'active' ? 'Kullanım aktif' : 'İptal edildi'}
                       </div>
                     </div>
                  </div>
                  
                  {user.subscriptionStatus === 'active' && user.planId !== '3' && (
                    <button 
                      onClick={onUpgradeClick}
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
                    >
                      {user.planId === 'free' ? 'Profesyonel Pakete Geç' : 'Paketi Yükselt'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <div className="border border-slate-200 rounded-xl p-5">
                      <div className="text-sm text-slate-500 font-medium mb-1">Kalan Sorgu Hakkı</div>
                      <div className={`text-3xl font-bold ${user.credits === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                         {user.credits === -1 ? '∞ Sınırsız' : user.credits}
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                         <div 
                           className="bg-brand-500 h-full" 
                           style={{ width: user.credits === -1 ? '100%' : `${Math.min((user.credits / 50) * 100, 100)}%` }}
                         ></div>
                      </div>
                      {user.credits === 0 && (!user.isEmailVerified || !user.isPhoneVerified) && (
                          <div className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Kredi kazanmak için doğrulama yapın.
                          </div>
                      )}
                   </div>
                   
                   <div className="border border-slate-200 rounded-xl p-5">
                      <div className="text-sm text-slate-500 font-medium mb-1">Yenileme Tarihi</div>
                      <div className="text-3xl font-bold text-slate-900">
                         {user.planId === 'free' ? '-' : new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {user.planId === 'free' ? 'Paket satın alındığında belirlenir.' : 'Bir sonraki fatura dönemine kadar geçerlidir.'}
                      </div>
                   </div>
                </div>

                {user.subscriptionStatus === 'active' && user.planId !== 'free' && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={onCancelSubscription}
                      className="text-sm text-red-500 hover:text-red-700 hover:underline font-medium"
                    >
                      Aboneliği İptal Et
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-slate-400" />
                    Sorgu Geçmişi
                  </h3>
                  <div className="text-sm text-slate-500">
                    Toplam {history.length} analiz
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Henüz bir analiz yapmadınız.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => onSelectHistory(item)}
                        className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate group-hover:text-brand-700 transition-colors">{item.productName}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.hsCode}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  Ödeme Geçmişi
                </h3>

                {billing.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Henüz bir ödeme kaydınız bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Tarih</th>
                          <th className="py-3 px-4">Paket</th>
                          <th className="py-3 px-4">Tutar</th>
                          <th className="py-3 px-4">Durum</th>
                          <th className="py-3 px-4 text-right">Fatura</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {billing.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-slate-700">{item.date}</td>
                            <td className="py-4 px-4 text-slate-900 font-bold">{item.planName}</td>
                            <td className="py-4 px-4 text-slate-700">{item.amount}</td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3" /> Ödendi
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button className="text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 justify-end ml-auto">
                                <Download className="w-4 h-4" />
                                PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GUIDE TAB (NEW) */}
          {activeTab === 'guide' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                   <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <HelpCircle className="w-6 h-6 text-slate-400" />
                     {siteContent.guide.sectionTitle}
                   </h3>
                   <GuideContent user={user} content={siteContent.guide} />
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
