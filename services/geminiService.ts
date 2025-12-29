
import { GoogleGenAI } from "@google/genai";
import { CustomsAnalysis } from "../types";

/**
 * Dosyayı Base64 formatına çevirir.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Ürün görselini Gemini 3.0 Pro kullanarak analiz eder.
 */
export const analyzeProductImage = async (file: File): Promise<CustomsAnalysis> => {
  // API Key Kontrolü
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API anahtarı bulunamadı. Lütfen .env dosyanızı veya sunucu ayarlarınızı (API_KEY) kontrol edin.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Data = await fileToGenerativePart(file);
    const currentYear = new Date().getFullYear();

    const prompt = `
      Sen Türkiye gümrük mevzuatına hakim, uzman bir Gümrük Müşavirisini ve Dış Ticaret Uzmanısın. Görevin, yüklenen ürün görselini analiz ederek ${currentYear} Yılı Türk Gümrük Tarife Cetveli'ne göre en doğru GTIP (HS Code) kodunu, güncel vergileri tespit etmek ve fiyat araştırması yapmaktır.
      
      Lütfen Google Arama aracını kullanarak şu adımları titizlikle uygula ve güncel verileri bul:
      1. Görseldeki ürünü teknik olarak tanımla (Malzeme, kullanım alanı, fonksiyon).
      2. Ürün için **Türkiye Gümrük Tarife Cetveli**'ne uygun tam 12 haneli GTIP kodunu bul.
      3. GTIP kodunun resmi tarife cetvelindeki tanımını yaz.
      4. Bu GTIP kodu için Türkiye'deki GÜNCEL ithalat vergilerini araştır (%20 KDV, Gümrük Vergisi, İGV, ÖTV vb.).
      5. İthalat aşamasında gümrük idaresinin isteyebileceği zorunlu belgeleri (TAREKS, CE, TSE vb.) belirle.
      6. FİYAT ARAŞTIRMASI: Çin FOB tedarik fiyatı ve Türkiye perakende satış fiyatını araştır.
      7. Tedarikçiye yönelik profesyonel bir İngilizce RFQ e-posta taslağı oluştur.

      Çıktıyı SADECE aşağıdaki geçerli JSON formatında ver. Başka bir açıklama yazma.
      
      {
        "productName": "Ürünün Ticari Adı",
        "description": "Ürünün gümrük tekniğine uygun tanımı",
        "hsCode": "Tespit edilen GTIP kodu",
        "hsCodeDescription": "Resmi açıklama",
        "taxes": ["Vergi 1", "Vergi 2"],
        "documents": ["Belge 1", "Belge 2"],
        "importPrice": "$X - $Y (FOB)",
        "retailPrice": "X TL - Y TL (Perakende)",
        "emailDraft": "Subject: ... Body: ...",
        "confidenceScore": 95
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Yapay zeka yanıt vermedi.");

    // Google Search Grounding kaynaklarını ayıkla
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources: { title: string; uri: string }[] = [];
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          groundingSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const analysis = JSON.parse(cleanText) as CustomsAnalysis;
    analysis.groundingSources = groundingSources;

    return analysis;

  } catch (error: any) {
    console.error("Gemini API Hatası:", error);
    // Hata mesajını kullanıcıya anlamlı ilet
    const msg = error.message?.includes("API key") 
      ? "API anahtarı hatası. Lütfen sistem yöneticisi ile iletişime geçin." 
      : (error.message || "Görsel analiz edilirken bir hata oluştu.");
    throw new Error(msg);
  }
};
