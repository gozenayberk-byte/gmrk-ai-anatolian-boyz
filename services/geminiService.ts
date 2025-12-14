
import { GoogleGenAI } from "@google/genai";
import { CustomsAnalysis } from "../types";

// Gemini Client'ı global kapsamda başlatmıyoruz, fonksiyon içinde çağıracağız.
// Bu sayede process.env tanımlı değilse uygulama başlangıcında çökmez.

/**
 * Encodes a File object to Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the product image using Gemini 3.0 Pro.
 */
export const analyzeProductImage = async (file: File): Promise<CustomsAnalysis> => {
  // API Key Kontrolü ve Başlatma
  // process.env.API_KEY is replaced by Vite at build time via define in vite.config.ts
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // Fallback veya Hata: Gerçek ortamda Netlify environment variable'dan gelir.
    throw new Error("API Anahtarı bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const base64Data = await fileToGenerativePart(file);
    const currentYear = new Date().getFullYear();

    const prompt = `
      Sen Türkiye gümrük mevzuatına hakim, uzman bir Gümrük Müşavirisini ve Dış Ticaret Uzmanısın. Görevin, yüklenen ürün görselini analiz ederek ${currentYear} Yılı Türk Gümrük Tarife Cetveli'ne göre en doğru GTIP (HS Code) kodunu, güncel vergileri tespit etmek ve fiyat araştırması yapmaktır.
      
      Lütfen Google Arama aracını kullanarak şu adımları titizlikle uygula ve güncel verileri bul:
      1. Görseldeki ürünü teknik olarak tanımla (Malzeme, kullanım alanı, fonksiyon).
      2. Ürün için **Türkiye Gümrük Tarife Cetveli**'ne uygun tam 12 haneli GTIP kodunu bul. (Örn: 8517.13.00.00.00).
      3. **ÖNEMLİ:** Bulduğun bu GTIP kodunun resmi tarife cetvelindeki tanımını/açıklamasını da yaz. (Örn: "Akıllı telefonlar" veya "Diğerleri - Pamuktan Olanlar").

      4. Bu GTIP kodu için Türkiye'deki **GÜNCEL** ithalat vergilerini araştır. 
         
         **ÖNEMLİ VERGİ UYARISI (GÜNCEL KDV VE ORANLAR):**
         - Türkiye'de KDV oranları güncel mevzuata göre uygulanmalıdır.
         - **Genel KDV Oranı: %20'dir**.
         - **İndirimli Oran (Tekstil, medikal, vb. - II Sayılı Liste): %10'dur**.
         - **Temel Gıda (I Sayılı Liste): %1'dir**.
         - Analiz sonucunda ASLA "%8" veya "%18" oranlarını kullanma.

         Araştırılacak diğer kalemler:
         - Gümrük Vergisi (GV) oranları (AB, Serbest Ticaret Anlaşması olan ülkeler ve Diğer Ülkeler farkını gözet).
         - İlave Gümrük Vergisi (İGV) var mı? Varsa güncel oranı nedir?
         - Özel Tüketim Vergisi (ÖTV) var mı? (Özellikle lüks ürünler, elektronik vb. için).
         - Gözetim veya Damping (Anti-Dumping) uygulaması var mı?
         - Kültür Fonu, TRT Bandrolü vb. ek yükümlülükler var mı?

      5. Vergileri listelerken MÜMKÜNSE ORANLARIYLA BİRLİKTE YAZ (Örn: "KDV (%20)", "Gümrük Vergisi (%0 - AB / %10 - Diğer)", "İGV (%20)").
      6. İthalat aşamasında gümrük idaresinin isteyebileceği zorunlu belgeleri (TAREKS, CE, ATR, EUR.1, TSE, Garanti Belgesi, MSDS vb.) belirle.
      
      7. **FİYAT VE PAZAR ARAŞTIRMASI:**
         - **Çin İthalat Fiyatı:** Alibaba, Made-in-China gibi kaynaklardan bu ürünün Çin'deki ortalama FOB (Free on Board) tedarik fiyat aralığını araştır (USD cinsinden). Örn: "$5.00 - $7.50 / adet".
         - **Türkiye Pazar Fiyatı:** Trendyol, Hepsiburada, N11 gibi pazar yerlerinden bu ürünün Türkiye'deki son kullanıcı (perakende) satış fiyat aralığını araştır (TL cinsinden). Örn: "450 TL - 600 TL".

      8. Tedarikçiden fiyat teklifi (RFQ) ve bu spesifik belgeleri talep eden profesyonel, resmi bir İngilizce e-posta taslağı oluştur.

      Çıktıyı SADECE aşağıdaki geçerli JSON formatında ver. Başka bir açıklama yazma. Markdown code block kullanma.
      
      {
        "productName": "Ürünün Ticari Adı",
        "description": "Ürünün gümrük tekniğine uygun tanımı",
        "hsCode": "Tespit edilen GTIP kodu",
        "hsCodeDescription": "GTIP Kodunun resmi tarife cetvelindeki kısa açıklaması",
        "taxes": ["Vergi Adı ve Oranı 1", "Vergi Adı ve Oranı 2"],
        "documents": ["Belge 1", "Belge 2"],
        "importPrice": "$X - $Y (Tahmini FOB)",
        "retailPrice": "X TL - Y TL (Tahmini Perakende)",
        "emailDraft": "Subject: ... Body: ...",
        "confidenceScore": 85
      }
    `;

    // Using gemini-3-pro-preview for maximum reasoning capability and accuracy
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      }
    });

    const text = response.text || "{}";
    
    // Robust cleanup for JSON parsing
    // 1. Remove markdown code blocks
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Find the first '{' and last '}' to ensure we only get the JSON object
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    try {
      const data = JSON.parse(cleanText) as CustomsAnalysis;
      
      // Basic validation of critical fields
      if (!data.hsCode || !data.taxes) {
        throw new Error("Eksik veri döndü.");
      }

      return data;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, text);
      throw new Error("Yapay zeka yanıtı işlenemedi. Sunucu yoğun olabilir, lütfen tekrar deneyin.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Görsel analiz edilirken bir hata oluştu.");
  }
};
