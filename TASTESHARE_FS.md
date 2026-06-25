# TasteShare — Funksional Spesifikasiya (FS) və Dizayn Sistemi

> **Versiya:** 1.0  
> **Status:** Qaralama / MVP  
> **Dil Dəstəyi:** Azərbaycan (az), İngilis (en)  
> **Platformalar:** Mobil (Android/iOS), Veb (PWA)

---

## 1. Platformanın Ümumi Konsepti və Məqsədi (Mission)

**TasteShare** — yemək, resept, mətbəx mədəniyyəti və qida fotoqrafiyası üzrə ixtisaslaşmış sosial media platforması.

**Missiya:** İnsanları yemək bişirməyə həvəsləndirmək, yerli və qlobal mətbəx mədəniyyətini qorumaq və paylaşmaq, "bişirməyi sosial hala gətirmək".

**Əsas dəyərlər:**
- Yemək bişirməyi əyləncəli və əlçatan etmək
- Mətbəx müxtəlifliyini təşviq etmək (region, mədəniyyət, pəhriz)
- İcma əsaslı böyümə (home cook → influencer)
- Reseptlərin düzgünlüyü və təhlükəsizliyi

**Hədəf auditoriya:**
- Ev aşpazları (18–45 yaş)
- Yemək bloggerləri və influencer-lər
- Pəhriz və sağlam qidalanma ilə maraqlananlar
- Yerli mətbəx reseptlərini qorumaq istəyənlər
- "Nə bişirəcəyimi bilmirəm" deyən gündəlik istifadəçilər

---

## 2. İstifadəçi Profilləri

### 2.1. Qeydiyyat və Authentication

**Metodlar:**
- Email + şifrə
- Google / Apple / Facebook ilə giriş (OAuth 2.0)
- Telefon nömrəsi ilə OTP (SMS)

**Qeydiyyat axını:**
1. Email/telefon daxil et → OTP təsdiqi
2. İstifadəçi adı (unikaldır, dəyişdirilə bilər)
3. Profil şəkli (skip edilə bilər, AI avatar generatoru təklif oluna bilər)
4. Mətbəx maraqları seçimi (onboarding zamanı tag seçimi)
5. Dil seçimi (az / en)

### 2.2. Profil Strukturu

| Sahə | Tip | Məcburi? | Qeyd |
|------|-----|----------|------|
| İstifadəçi adı | String (15 simvol) | Bəli | Unikal, `@` prefiksli |
| Bio | String (150 simvol) | Xeyr | |
| Profil şəkli | Image (1:1) | Xeyr | WebP, max 2MB |
| Header şəkli | Image (16:9) | Xeyr | |
| Məkan | String | Xeyr | Şəhər, ölkə |
| Nişanlar | Array[Badge] | Xeyr | Bölmə 2.3 |
| Resept kitabçası | Array[Recipe] | Auto | Bölmə 2.4 |
| Statistika | Integer | Auto | İzləyici, izlənilən, post, resept sayı |
| Veb sayt/link | URL | Xeyr | |
| Mətbəx növü | Tag[] | Xeyr | `Azərbaycan`, `İtalyan`, `Vejetaryen`, s. |

### 2.3. Nişanlar (Badges)

Gamification elementi. İstifadəçilər tamamladıqca badge qazanır:

| Nişan | Şərt |
|-------|------|
| 🥇 İlk Resept | İlk resept paylaşımı |
| 🔥 Trend Bişirən | 7 gün ardıcıl post |
| 🌍 Yerli Mətbəx | Region spesifik resept paylaşımı |
| 👨‍🍳 Master Aşpaz | 50+ resept |
| 📸 Foto Ustası | Yüksək keyfiyyətli şəkil (AI scoring) |
| 🤝 İcma Lideri | 100+ izləyici, 10+ şərh |
| ⭐ Verified (mavi nişan) | Admin tərəfindən təsdiqlənmiş hesab |

### 2.4. Resept Kitabçası (Recipe Book / Collections)

Hər istifadəçinin 3 default kolleksiyası:
- **Bəyəndiklərim** (Liked Recipes)
- **Saxladıqlarım** (Saved Recipes)
- **Öz Reseptlərim** (My Recipes)

Əlavə olaraq istifadəçi xüsusi kolleksiyalar yarada bilər:
- "Ramazan yeməkləri", "Pəhriz menyum", "Tez bişənlər" və s.
- Kolleksiyalar public/private ola bilər
- Başqa istifadəçilərin kolleksiyalarına da abunə olmaq mümkündür

---

## 3. Postlar

### 3.1. Post Formatı

Hər post mütləq **RESEPT MƏLUMATI** əhatə etməlidir (yalnız şəkil/video kifayət deyil).

**Post yaratma axını:**
1. **Media:** Şəkil (1–10 ədəd, carousel) və ya video (15–60 san)
2. **Resept adı:** String (60 simvol)
3. **Hazırlanma vaxtı:** Seçim (5–15 dəq, 15–30 dəq, 30–60 dəq, 60+ dəq)
4. **Çətinlik:** 3 səviyyə (Asan / Orta / Çətin)
5. **Porsiya sayı:** Number (1–50)
6. **Tərkiblər:** Structured list (ad, miqdar, vahid, alternativ)
7. **Addımlar:** Sıralı siyahı (addım nömrəsi + təlimat)
8. **Kategoriya:** Tag seçimi (s. 6.2 Kateqoriyalar)
9. **Coğrafi etiket:** Məkan seçimi (və ya "Təyin edilməyib")
10. **Hashtaglər:** Max 10
11. **Qidalanma məlumatı (opsional):** Kalori, protein, karb, yağ

### 3.2. Resept Məlumat Modeli (JSON Schema)

```json
{
  "id": "UUID",
  "userId": "UUID",
  "title": { "az": "String", "en": "String" },
  "media": ["MediaObject"],
  "prepTime": 30,
  "cookTime": 45,
  "totalTime": 75,
  "difficulty": "easy|medium|hard",
  "servings": 4,
  "ingredients": [
    {
      "name": { "az": "un", "en": "flour" },
      "amount": 2.5,
      "unit": "stəkan|cup|g|kg|ml|l|ədəd|tbsp|tsp",
      "alternative": null
    }
  ],
  "steps": [
    {
      "order": 1,
      "instruction": { "az": "...", "en": "..." },
      "timer": null,
      "media": null
    }
  ],
  "category": "UUID",
  "tags": ["UUID"],
  "cuisine": "azeri|italian|mexican|...",
  "diet": "vegetarian|vegan|gluten-free|...",
  "location": { "lat": 40.4093, "lng": 49.8671, "name": "Baku" },
  "nutrition": { "calories": 450, "protein": 12, "carbs": 60, "fat": 18 },
  "hashtags": ["#azerbaycanmutfagi"],
  "createdAt": "ISO8601"
}
```

### 3.3. Media Spesifikasiyası

| Tip | Format | Max Ölçü | Aspect Ratio |
|-----|--------|----------|--------------|
| Şəkil | WebP | 20MB | 1:1, 4:5, 16:9 |
| Video | H.264 MP4 | 100MB, 60san | 9:16 (portrait), 16:9 |
| Thumbnail | WebP | 500KB | 1:1, auto-generated |

### 3.4. Coğrafi Etiket (Geo-tagging)

- İstifadəçi post yaradarkən lokasiya əlavə edə bilər
- Kəşf səhifəsində "Yaxınlıqdakı reseptlər" filtri
- Restoran/kafe məkanları tag edilə bilər (gələcəkdə biznes profillər üçün)

---

## 4. Story (Hekayələr) Sistemi

### 4.1. Ümumi Xüsusiyyətlər

| Xüsusiyyət | Dəyər |
|------------|-------|
| Müddət | 24 saat |
| Media | Şəkil + Video (max 15 san) |
| Aspect | 9:16 (full screen) |
| Saxlama | Archive (yalnız istifadəçinin özü görür) |
| Ardıcıllıq | Ən yenidən ən köhnəyə |

### 4.2. Story Elementləri

- **Mətn overlay** — font seçimi, rəng, fon
- **Stikerlər:**
  - "Bu resepti bişirdin?" (Yes/No poll)
  - "Nə düşünürsən?" (emoji slider)
  - Məkan stikeri
  - Vaxt stikeri ("30 dəq")
  - Çətinlik stikeri ("Asan 🔥")
  - Hashtag stikeri
- **Keçidlər (Links):** Birbaşa reseptə keçid ("Reseptə bax" swipe up)
- **Reaksiyalar:** Emoji react (❤️, 😍, 🔥, 👨‍🍳, 👍)
- **Mentions:** `@username` ilə başqa istifadəçini qeyd etmək

### 4.3. Story Cavabı

İzləyici story-ə cavab göndərə bilər → DM olaraq düşür (bölmə 9).

---

## 5. Qarşılıqlı Əlaqə (Engagement)

### 5.1. Bəyənmə (Like)

- İkili təpik (double tap = like)
- Like sayı post üzərində göstərilir
- Like atanların siyahısı görünə bilər
- Maks 1 like/post/istifadəçi

### 5.2. Şərhlər (Comments)

| Xüsusiyyət | Spesifikasiya |
|------------|---------------|
| Mətn | 500 simvol |
| Media | Şəkil əlavə etmək olar (post-a şərh olaraq yemək şəkli) |
| Thread | Cavab vermə (nesting, max 3 səviyyə) |
| Redaktə | 5 dəqiqə ərzində redaktə |
| Silmə | İstifadəçi + post sahibi silə bilər |
| Report | Hər şərh üçün report düyməsi |

### 5.3. Paylaşma (Share)

- Daxili paylaşma (DM ilə — bölmə 9)
- Xarici paylaşma (WhatsApp, Telegram, Facebook, Twitter, link copy)
- Resept linki: `tasteshare.app/r/{recipeId}`

### 5.4. Saxlama / Yerləşdirmə (Bookmark / Save)

- Bookmark ikonu (⭐ s.2.4)
- Koleksiyaya əlavə et (seçim dropdown)
- Yalnız istifadəçinin özü görür
- Post sahibi bookmark sayını görə bilər (engagement metriki)

---

## 6. Kəşf və Alqoritm (Discovery & Feed)

### 6.1. Fərdi Lent (Personalized Feed)

**Alqoritm amilləri (çəki sırası ilə):**
1. İzlənilən istifadəçilər (ən yüksək prioritet)
2. Qarşılıqlı əlaqə tarixçəsi (like, save, comment, share, vaxt)
3. Mətbəx maraqları (onboarding zamanı seçilən taglər)
4. Coğrafi yaxınlıq (region filter aktivdirsə)
5. Trend predmetləri (hazırda trend olan reseptlər)
6. Təzə məzmun (recency bias)
7. Random kəşf (exploration — 10% lent)

**Feed tipləri:**
- **Ana səhifə:** Fərdi lent (default)
- **Kəşf:** Trend + tövsiyələr
- **Region:** İstifadəçinin seçdiyi regiona aid reseptlər
- **Yeni:** Ən son yüklənən reseptlər

### 6.2. Kateqoriyalar

| Kateqoriya | Alt kateqoriyalar |
|------------|-------------------|
| Mətbəx növü | Azərbaycan, Türk, İtalyan, Yapon, Meksika, Hind, Çin, Fransız, Amerika, Digər |
| Yemək növü | Səhər yeməyi, Nahar, Şam yeməyi, Qəlyanaltı, Desert, İçki, Salat, Şorba |
| Pəhriz | Vejetaryen, Vegan, Qlutensiz, Aşağı kalorili, Yüksək protein, Keto, Aralıq dənizi |
| Hazırlanma vaxtı | 15 dəq, 30 dəq, 60 dəq, 60+ |
| Çətinlik | Asan, Orta, Çətin |
| Mövsüm | Yaz, Yay, Payız, Qış, Ramazan, Bayram |

### 6.3. Trend Mexanizmi

Trend reseptlər aşağıdakı amillərə əsasən müəyyən edilir:
- Son 24 saatda ən çox bəyənilən/saxlanılan postlar
- Sürətli artım (velocity-based — 1 saatda 100 like)
- Yeni istifadəçilər tərəfindən çox baxılan
- Mövsümi trendlər ("payız qabağı", "ramazan")

### 6.4. Tövsiyə Sistemi

**Content-based filtering:**
- İstifadəçinin saxladığı/bəyəndiyi reseptlərə oxşar reseptlər (tag, ingredient, cuisine similarity)
- Eyni mətbəxə aid digər reseptlər

**Collaborative filtering (gələcək):**
- Oxşar zövqə malik istifadəçilərin bəyəndikləri
- "Bunu bəyənənlər bunu da bəyənir"

---

## 7. Axtarış Sistemi (Search)

### 7.1. Axtarış Növləri

| Axtarış növü | Nəticə | Nümunə |
|-------------|--------|--------|
| **Resept adı** | Tam və qismən match | "dolma", "paxlava" |
| **Tərkib hissəsi** | Tərkib siyahısında olan reseptlər | "toyuq, kartof, soğan" |
| **İstifadəçi** | Profil axtarışı | "@chef_elnur" |
| **Hashtag** | Hashtag səhifəsi | "#ramazanyemekleri" |
| **Kateqoriya** | Kateqoriya səhifəsi | "desert", "vegan" |

### 7.2. "Evdə nə var?" Funksiyası (Tərkib Əsasında Axtarış)

Tətbiqin flagşip xüsusiyyəti.

**Axın:**
1. İstifadəçi mətbəxində olan tərkibləri daxil edir (pulsuz text input və ya pre-defined siyahıdan seçim)
2. İstifadəçi "Məndə bunlar var" deyir
3. Sistem həmin tərkiblərlə hazırlana biləcək reseptləri tapır
4. "Tam uyğun" (bütün tərkiblər var) + "Qismən uyğun" (əskik tərkiblər var, əskiklər göstərilir)

**Texniki tələb:** Elasticsearch / Meilisearch ilə ingredient-based inverted index.

### 7.3. Axtarış Filtrləri

- **Pəhriz:** Vejetaryen, Vegan, Keto...
- **Vaxt:** Max hazırlanma vaxtı
- **Çətinlik:** Asan / Orta / Çətin
- **Mətbəx:** Region filter
- **Kalori:** Min-max slider
- **Dil:** Azərbaycan / İngilis / Hər ikisi

### 7.4. Autocomplete və Spell Check

- Yazılan hərfə görə real-time təkliflər
- Səhv yazılmış tərkiblər üçün düzəliş təklifi ("şekər" → "şəkər")
- Çoxdilli dəstək (az + eyni vaxtda en)

---

## 8. Bildirişlər (Notifications)

### 8.1. Push Notification Tipləri

| Bildiriş | Trigger | Platforma |
|----------|---------|-----------|
| ❤️ Xoşunuza gəldi | Kimsə postunuzu bəyəndi | Push + in-app |
| 💬 Şərh | Kimsə postunuza şərh yazdı | Push + in-app |
| 🔄 Cavab | Şərhinizə cavab gəldi | Push + in-app |
| 👤 İzləmə | Yeni izləyici | Push + in-app |
| 📖 Resept saxlandı | Reseptiniz saxlandı | In-app only |
| 📸 Story reaksiyası | Story-nizə reaksiya gəldi | Push |
| 🏆 Nişan | Yeni badge qazandınız | In-app |
| 🔥 Trend | Reseptiniz trend oldu | Push + in-app |
| 🎂 Doğum günü | İstifadəçinin doğum günü | In-app |
| 🍳 Xatırlatma | "Bu gün nə bişirirsən?" (gündəlik) | Push (parametr) |

### 8.2. Bildiriş Mərkəzi (In-app Notification Center)

- Bütün bildirişlər vahid feed-də göstərilir
- Oxunmuş / oxunmamış statusu
- Qruplaşdırma: "Elnur və 5 nəfər daha postunuzu bəyəndi"
- Hər bildiriş tipi üçün ayri-ayrı on/off toggle

---

## 9. Birbaşa Mesajlaşma (DM)

### 9.1. DM Xüsusiyyətləri

| Xüsusiyyət | Spesifikasiya |
|------------|---------------|
| Mesaj tipi | Mətn, şəkil, video, voice note |
| Resept göndərmə | Birbaşa resept kartı göndərmək (preview ilə) |
| Söhbət növü | 1:1, Qrup (max 32 nəfər) |
| Oxundu bildirişi | ✓ (göndərən üçün) |
| Yazır indicator | "yazır..." |
| Silmə | Hər iki tərəf üçün sil (unsend) |
| Reaksiya | Emoji react (👍❤️😂😍🔥) |
| Status | Online/offline göstəricisi |

### 9.2. Resept Göndərmə

- DM daxilində "Resept göndər" düyməsi
- Öz reseptlərindən və ya saxladıqlarından seçim
- Paylaşılan resept kart kimi göstərilir (ad, şəkil, vaxt, çətinlik, like düyməsi)
- Alıcı resepti birbaşa öz kitabçasına əlavə edə bilər

### 9.3. Qrup Söhbətləri

- "Yemək klubu" — dost qrupu ilə resept paylaşma
- Qrup planlaması: "Bu həftə nə bişiririk?"
- Poll: "Nahar üçün nə edək?" (seçimlər: reseptlər)

---

## 10. Fərqləndirici Xüsusiyyətlər (Unique Selling Points)

### 10.1. "Bişirmə Rejimi" (Cooking Mode)

Tətbiqin ən güclü xüsusiyyəti.

**Aktivləşdirmə:** Resept səhifəsində "Bişirməyə başla" düyməsi

**Xüsusiyyətlər:**
- **Ekran qaralmır:** Wakelock API (mobil) / No sleep (veb)
- **Böyük şrift:** Accessibility-focused, 24px+ font
- **Step-by-step:** Hər addım ayrı səhifə, irəli/geri swipe
- **Timer:** Hər addım üçün timer əlavə etmək imkanı (timer bitdikdə səsli bildiriş)
- **"Addımı bitdi":** Hər addımdan sonra "✓ Bitdi" düyməsi
- **Səs ilə idarə (gələcək):** "Next step" — voice command
- **Əllə toxunma rejimi:** Əllər çirkli olanda böyük düymələr, səsli əmrlər
- **Material sayğacı:** Neçə addım qaldığını göstərən progress bar
- **İngredient miqdarı:** Porsiya sayına görə avtomatik miqdar hesablama (2 nəfərlik → 4 nəfərlik)

**UI:**
- Dark mode (default Cooking Mode üçün)
- Minimal UI — yalnız addım mətni + şəkil + timer + növbəti/əvvəlki
- Swipe left/next, swipe right/previous

### 10.2. "Evdə nə var?" — Tərkib Əsasında Axtarış

(Bölmə 7.2-də ətraflı təsvir edilib)

Əlavə olaraq:
- **AI təklifləri:** Sistem istifadəçinin ən çox istifadə etdiyi tərkibləri öyrənir
- **Alış-veriş siyahısı:** Əskik tərkiblər üçün avtomatik alış-veriş siyahısı yaradılır
- **Yaxınlıqdakı market:** Tərkibləri olan ən yaxın marketi göstər (Google Maps API)

### 10.3. Lokal Mətbəx və Region Filtri

- Hər post mətbəx növünə (cuisine) görə etiketlənir
- İstifadəçi öz profilində hansı mətbəxlərə maraq göstərdiyini seçir
- Region filtri — yalnız seçilmiş regiona aid reseptləri göstər
- **"Mətbəx Xəritəsi":** Dünya xəritəsi, hər regionda populyar reseptlər
- Azərbaycan mətbəxi üçün xüsusi taglər: `#azerbaycanmutfagi`, `#bakureseptleri`, `#sirniyyat`

### 10.4. Digər Fərqləndirici Xüsusiyyətlər

- **Çoxdilli Resept Dəstəyi:** Hər resept az və en dillərində yazıla bilər (ikidilli post)
- **Qidalanma Kalkulyatoru:** Tərkiblərə əsasən avtomatik kalori hesablama
- **Porsiya tənzimləyicisi:** 4 nəfərlik resepti 2 nəfərlikə çevir (ingredient miqdarları avtomatik yenilənir)
- **Səsli resept (gələcək):** AI ilə mətn → səs, "resepti mənə oxu"
- **Mövsüm Kalendarı:** Hansı məhsul hansı ayda təzədir
- **Qida Təhlükəsizliyi Xəbərdarlığı:** Allergen qeydləri, son istifadə tarixi xəbərdarlığı

---

## 11. Dizayn və UX Tövsiyələri

### 11.1. Dizayn Sistemi

**Rəng Palitrası:**

| Rəng | Hex | İstifadə sahəsi |
|------|-----|-----------------|
| Primary | `#FF6B35` | Narıncı — əsas aksiya, CTA |
| Secondary | `#2D3436` | Tünd boz — mətn, başlıqlar |
| Accent | `#00B894` | Yaşıl — "təzə", "sağlam", "vegan" |
| Background | `#FAFAFA` | Açıq boz — səhifə fonu |
| Card | `#FFFFFF` | Ağ — kart fonu |
| Error | `#E17055` | Qırmızı — xəta mesajı |
| Cooking Mode | `#1A1A2E` | Tünd göy — Cooking Mode fonu |

**Fontlar:**
- **Primary:** Inter (rəqəmsal, mobil üçün) və ya system-ui
- **Display:** Playfair Display (başlıqlar, resept adları, premium hiss)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Cooking Mode:** 24px+, 700 weight, high contrast

**Ölçülər:**
- Base unit: 8px
- Container max-width: 480px (mobil-first)
- Desktop: max 1200px, grid layout

### 11.2. UX Prinsipləri

- **Mobil-first:** Bütün dizayn əvvəl mobil üçün, sonra desktop
- **Swipe navigation:** Feed-də swipe, Cooking Mode-da swipe
- **Haptic feedback:** Like, save, timer done
- **Skeleton loading:** Hər səhifə üçün loading skeleton
- **Optimistic UI:** Like atanda dərhal say artır, background-da sync
- **Bottom navigation:** Home, Search, Create (+), Activity, Profile
- **Accessibility:** WCAG 2.1 AA, minimum 4.5:1 contrast, screen reader support
- **Offline mode:** Baxılan reseptlər cache-də saxlanılır, offline baxmaq olar

### 11.3. İkonoqrafiya

Minimal, outline-style ikonlar (Lucide icons və ya custom set):
- Ana səhifə: 🏠
- Kəşf: 🔍
- Yarat: ➕ (CTA button, mərkəzdə, böyük)
- Aktivlik: 🔔
- Profil: 👤
- Resept: 📖
- Bişirmə: 👨‍🍳
- Timer: ⏱
- Tərkiblər: 🥕
- Bookmark: 🔖

---

## 12. Texniki Arxitektura (İlkin Tövsiyələr)

### 12.1. Frontend

| Platforma | Texnologiya | Səbəb |
|-----------|-------------|-------|
| Mobil (Android) | Kotlin + Jetpack Compose | Native performans, CameraX, Wakelock |
| Mobil (iOS) | SwiftUI + UIKit | Native feel, ARKit (gələcək) |
| Veb | React / Next.js + TypeScript | SSR, SEO, PWA |
| Ortaq | GraphQL (Apollo) | Effektiv data fetching |

**Qeyd:** MVP üçün React Native (Expo) ilə cross-platform da mümkündür, lakin Cooking Mode üçün native wakelock və timer daha stabil olar.

### 12.2. Backend

| Servis | Texnologiya | Qeyd |
|--------|-------------|------|
| API Gateway | Node.js + Express və ya Fastify | GraphQL REST hibrid |
| Auth Service | Node.js + JWT + OAuth | Refresh token, OTP |
| Feed Service | Go (high throughput) | Personalization engine |
| Search Service | Node.js + Elasticsearch/Meilisearch | Full-text + ingredient search |
| Media Service | Python + FFmpeg | Image/video processing |
| Notification Service | Node.js + Firebase/APNs | Push notifications |
| Chat Service | WebSocket (Socket.io) | Real-time messaging |
| AI Service | Python + TensorFlow/PyTorch | Recommendation, image tagging |

### 12.3. Verilənlər Bazası

| Data | DB | Səbəb |
|------|-----|-------|
| User, Profile, Relations | PostgreSQL | ACID, relational |
| Post, Recipe, Ingredient | PostgreSQL + JSONB | Structured + flexible |
| Feed, Timeline | Redis + PostgreSQL | Caching, real-time |
| Search | Meilisearch / Elasticsearch | Full-text, typo tolerance |
| Media metadata | S3 + CloudFront + PostgreSQL | CDN, thumbnails |
| Session/Cache | Redis | High speed |
| Analytics | ClickHouse (ve ya PostgreSQL) | Time-series data |

### 12.4. Bulud Xidmətləri

| Provider | Xidmət | Məqsəd |
|----------|--------|--------|
| AWS / GCP / Azure | EC2 / Cloud Run | Compute |
| AWS S3 + CloudFront | Object storage + CDN | Media files |
| Firebase / AWS SNS | Push notifications | Bildirişlər |
| Cloudflare | DNS, DDoS protection | Təhlükəsizlik |
| SendGrid / SES | Email | OTP, newsletter |
| Google Maps API | Location | Coğrafi etiket |

### 12.5. API Dizaynı

**GraphQL schema nümunəsi:**

```graphql
type Recipe {
  id: ID!
  title: LocalizedString!
  media: [Media!]!
  prepTime: Int!
  difficulty: Difficulty!
  ingredients: [Ingredient!]!
  steps: [Step!]!
  author: User!
  stats: RecipeStats!
  createdAt: DateTime!
}

type Query {
  feed(first: Int, after: String): FeedConnection!
  recipe(id: ID!): Recipe
  searchRecipes(query: String!, filters: SearchFilters): [Recipe!]!
  searchByIngredients(ingredients: [String!]!): [Recipe!]!
}

type Mutation {
  createRecipe(input: CreateRecipeInput!): Recipe!
  likeRecipe(id: ID!): Boolean!
  saveRecipe(id: ID!, collectionId: ID): Boolean!
  startCookingMode(recipeId: ID!): CookingSession!
}
```

---

## 13. Monetizasiya Variantları (Opsional)

### 13.1. Qısamüddətli (İl 1)

- **Premium Profil:** `@username` seçimi, analytics, priority support — $3.99/ay
- **Recipe Boost:** Reseptinizi trend feed-də yuxarı çıxarın — $1/post
- **Tərkib Linkləri:** Reseptdə tərkibləri birbaşa market linki kimi qeyd etmək (affiliate)

### 13.2. Orta müddətli (İl 2–3)

- **TasteShare Pro:** Cooking Mode AI assist, offline download, advanced analytics — $7.99/ay
- **Biznes profillər:** Restoranlar, kafelər, brendlər üçün — $19.99/ay
- **Sponsored Recipes:** Brendlər öz məhsulları ilə resept sponsor edə bilər
- **Digital Cookbook:** İstifadəçilər öz resept kolleksiyalarını digital kitab kimi sata bilər (platforma 15% komissiya)

### 13.3. Uzunmüddətli (İl 3+)

- **TasteShare Market:** Birbaşa qida məhsulları satışı
- **Online Cooking Classes:** Canlı bişirmə dərsləri (Zoom/WebRTC inteqrasiyası)
- **API licensing:** Resept API-sini 3-cü tərəflərə lisenziyalaşdırma

---

## 14. Moderasiya və Təhlükəsizlik

### 14.1. Avtomatik Moderasiya

| Sistem | Məqsəd | Texnologiya |
|--------|--------|-------------|
| Şəkil/video təhlili | Zərərli, yetkin, şiddət içərən məzmun | Google Cloud Vision / AWS Rekognition |
| Mətn təhlili | Spam, nifrət dolu şərhlər | NLP, OpenAI Moderasyon, regex filter |
| Spam detection | Təkrar məzmun, bot davranışı | ML-based (xüsusi model) |
| Resept düzgünlüyü | Zərərli resept təlimatları (çiy ət, allergen) | Rule-based + manual review |

### 14.2. İnsan Moderasiyası

- **Report sistemi:** İstifadəçi hər post, şərh, profili report edə bilər
- **Nüvə moderatorlar:** İlk mərhələdə 2–3 nəfər, sonra icma moderatorları
- **Appeal sistemi:** Silinən məzmun üçün etiraz (appeal) prosesi

### 14.3. Resept Düzgünlüyü Qaydaları

- Çiy ət, zəhərli göbələk kimi təhlükəli təlimatlar qadağandır
- Allergen qeydləri məcburi deyil, amma təşviq olunur (badge ilə: "Allergen məlumatı var")
- Saxta qidalanma iddiaları ("şəkər xəstəliyini müalicə edir") qadağandır

### 14.4. Data Privacy

- GDPR uyğunluq (Avropa istifadəçiləri üçün)
- Data export: İstifadəçi öz məlumatlarını JSON formatında export edə bilər
- Account silmə: Birdəfəlik silmə imkanı
- Şəkillər üçün EXIF data avtomatik təmizlənir (lokasiya metadata)

---

## 15. İlkin İnkişaf Mərhələləri (MVP Roadmap)

### Mərhələ 0: Araşdırma (4 həftə)
- Bazar araşdırması (rəqib analizi: Instagram, Pinterest, Yemek.com, Allrecipes)
- İstifadəçi müsahibələri (20–30 nəfər)
- Texnologiya stack seçimi
- UI/UX wireframes (Figma)

### Mərhələ 1: MVP (12–16 həftə)

**Backend:**
- User auth (JWT, OAuth)
- CRUD reseptlər
- Feed (time-based, sonra fərdi)
- Search (basic keyword)
- Like, save, comment

**Frontend (Mobil + Veb):**
- Onboarding / qeydiyyat
- Profil səhifəsi
- Resept yaratma (şəkil + tərkiblər + addımlar)
- Feed (time-line)
- Search (basic)
- Like / save / comment UI

**MVP-yə DAXİL DEYİL:**
- Fərdi alqoritm (sadəcə time-based feed)
- DM
- Story
- Cooking Mode (MVP-dən sonra)
- "Evdə nə var?" axtarışı (MVP-dən sonra)

**Texniki MVP stack:**
- Frontend: React Native (Expo) + TypeScript
- Backend: Node.js + Express + PostgreSQL
- Search: PostgreSQL full-text (→ sonra Meilisearch)
- Media: Cloudinary (→ sonra S3)
- Hosting: Vercel (frontend) + Railway/Render (backend)

### Mərhələ 2: Core Features (8–12 həftə)
- DM sistemi
- Story (24h)
- Cooking Mode (native wakelock)
- Push notifications
- "Evdə nə var?" axtarışı

### Mərhələ 3: Growth (8–12 həftə)
- Personalization alqoritm
- Trend səhifəsi
- Nişan sistemi
- Qruplar / kolleksiyalar
- Coğrafi etiket

### Mərhələ 4: Monetizasiya (6–8 həftə)
- Premium profil
- Recipe Boost
- Biznes profillər

### Mərhələ 5: AI Features (8–12 həftə)
- AI ingredient recognition (şəkildən tərkib tanıma)
- AI resept tövsiyələri
- Səsli idarə (Cooking Mode)
- Kalori kalkulyatoru

---

## Əlavə: MVP Minimum Viable Product üçün Prioritizasiya

| # | Xüsusiyyət | Prioritet | Səbəb |
|---|-----------|-----------|--------|
| 1 | Qeydiyyat + Profil | P0 | Giriş nöqtəsi |
| 2 | Post + Resept yaratma | P0 | Əsas content |
| 3 | Feed | P0 | İstehlak |
| 4 | Like + Save | P0 | Engagement |
| 5 | Şərh | P0 | Qarşılıqlı əlaqə |
| 6 | Axtarış (basic) | P1 | Kəşf |
| 7 | İzləmə sistemi | P1 | Sosial qraf |
| 8 | Bildirişlər | P1 | Retensiya |
| 9 | Cooking Mode | P1 | USP |
| 10 | "Evdə nə var?" | P1 | USP |
| 11 | DM | P2 | Engagement |
| 12 | Story | P2 | Instagram- bənzər |
| 13 | Nişanlar | P2 | Gamification |
| 14 | Fərdi alqoritm | P2 | Retensiya |
| 15 | Monetizasiya | P3 | Gəlir |

---

**Hazırladı:** TasteShare Product Team  
**Son yenilənmə:** 25 İyun 2026  
**Sənəd növü:** Funksional Spesifikasiya (FS) + Dizayn Sistemi
