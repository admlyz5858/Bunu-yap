# Focus Universe
## Mimari Dokümantasyonu
**React 19 · TypeScript · Zustand · Web Audio API · IndexedDB**

---

## 1. Genel Bakış

Focus Universe, Pomodoro tekniğini gamification, prosedürel ses ve sürükleyici görsel ortamlarla birleştiren bir odaklanma uygulamasıdır. Uygulama beş katmanlı bir mimariye sahiptir: UI bileşenleri, React hook'ları, Zustand state yönetimi, servis katmanı ve core engine.

| Katman | İçerik |
|--------|--------|
| UI / Components | 6 feature modülü + effects + primitives |
| React Hooks | use-timer, use-audio, use-background, use-persistence |
| Zustand Stores | timer, settings, session, game, task (5 store) |
| Services | storage.ts (IndexedDB), ai-tasks.ts (OpenAI + fallback) |
| Core Engine | timer-engine.ts, audio-engine.ts, types.ts, constants.ts |

---

## 2. Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Çerçeve | React 19 + TypeScript |
| Build | Vite 8 |
| Stil | Tailwind CSS v4 |
| State | Zustand 5 |
| Depolama | localForage (IndexedDB) |
| Animasyon | framer-motion + CSS |
| Ses | Web Audio API |
| Partiküller | Canvas 2D |
| Test | Vitest + Testing Library |
| CI | GitHub Actions |
| Mobil | Capacitor (Android) |

---

## 3. Core Engine (`core/`)

Core katmanı, framework'ten tamamen bağımsız saf TypeScript modüllerinden oluşur. Tarayıcı API'larıyla doğrudan iletişim kurar ve hiçbir React bağımlılığı taşımaz.

### 3.1 `timer-engine.ts` — Drift-Free Zamanlayıcı

Standart `setTimeout`/`setInterval` yaklaşımı zamanla sürüklenir (drift). `timer-engine.ts` bu sorunu iki tekniği birleştirerek çözer:

- **`requestAnimationFrame`**: Her kare render güncelleme için
- **`setInterval` (250ms)**: Arka plan sekmelerinde bile çalışmayı sürdürmek için
- **`performance.now()`**: Monotonic (her zaman artan) ve milisaniye hassasiyetinde zaman kaynağı

Geçen süre hesaplama formülü:
```
elapsed = performance.now() - startTimestamp
```

Bu yaklaşımla sayfa yavaşlasa, sekme arka plana alınsa bile timer doğruluğu korunur. Her tick'te mevcut durum IndexedDB'ye snapshot olarak yazılır — sayfa yenilenince kullanıcı kaldığı yerden devam eder.

- 3 mod: Focus (25dk), Short Break (5dk), Long Break (15dk) — hepsi ayarlanabilir
- 3 durum: `idle`, `running`, `paused`
- Son 10 saniyede crescendo tick sesleri
- Tamamlanınca yumuşak zil akordu

### 3.2 `audio-engine.ts` — Prosedürel Ses

Hiçbir harici ses dosyası kullanmaz. Tüm sesler Web Audio API üzerinde anlık olarak üretilir:

- **Ambient soundscape**: Filtrelenmiş gürültüden rain, forest, wind, ocean, campfire sesleri
- **UI sesleri**: Her düğme tıklamasına mikro-etkileşim geri bildirimi
- **Level-up arpeji**: XP kilometre taşlarında
- **Zil akordu**: Oturum tamamlanınca

### 3.3 `types.ts` ve `constants.ts`

`types.ts` tüm TypeScript tip tanımlarını, sabit değerleri ve yardımcı (utility) fonksiyonları barındırır. `constants.ts` ise uygulama genelinde kullanılan environment tanımları (7 ortam), ses şablonları, psikolojik teşvik mesajları ve görev şablonlarını içerir.

---

## 4. Servis Katmanı (`services/`)

### 4.1 `storage.ts` — IndexedDB Erişimi

localForage kütüphanesi üzerinden IndexedDB'ye CRUD işlemleri sunar. Her store'un verileri ayrı key'ler altında saklanır. JSON export/import özelliği yedekleme ve göç için kullanılır.

- Timer state, settings, session geçmişi, game state ve task'lar bağımsız olarak persiste edilir
- Sayfa yenilenince `use-persistence` hook'u tüm store'ları bu servis üzerinden besler

### 4.2 `ai-tasks.ts` — AI Görev Bölme

Kullanıcının doğal dil girişini (örn. `'Fizik çalış 3 saat'`) odaklanmış alt görevlere böler.

- **Önce**: `VITE_OPENAI_API_KEY` ortam değişkeni set edilmişse OpenAI GPT kullanır
- **Sonra**: API erişimi yoksa offline fallback devreye girer — zaman ayrıştırma + faz bazlı bölümleme
- **Örnek çıktı**: `'Mekanik (45dk)'`, `'Termodinamik (45dk)'`, `'Problem çöz (45dk)'`, `'Tekrar (45dk)'`

---

## 5. State Yönetimi — Zustand Stores (`store/`)

Zustand hafif ve boilerplate-free bir state kütüphanesidir. Focus Universe beş ayrı store kullanır; her biri net bir sorumluluk sınırına sahiptir.

### 5.1 `timer-store`
- `mode`: `'focus' | 'shortBreak' | 'longBreak'`
- `status`: `'idle' | 'running' | 'paused'`
- `timeLeft` (saniye), `startedAt` (timestamp), `snapshot` (IndexedDB'ye yazılır)

### 5.2 `settings-store`
- Oturum süreleri (focus, shortBreak, longBreak — varsayılan 25/5/15 dk)
- Ses tercihleri, seçili ortam, bildirim ayarları

### 5.3 `session-store`
- `sessions[]`: Tamamlanan oturumların listesi (zaman damgası, süre, mod, görev ID)
- Hesaplanan toplamlar: bugün, bu hafta, tüm zamanlar
- GitHub-stili aktivite heatmap verisi (12 hafta)

### 5.4 `game-store`
- `xp`, `level` (her 100 XP'de bir yükselir)
- `currentPlant`: Büyüme aşaması (`seed → sprout → sapling → tree → glowingTree`)
- `streak`: Günlük ardışık oturum sayısı
- `quests`: 3 günlük + 2 haftalık görev
- `garden`: Tamamlanan bitkilerin kalıcı koleksiyonu

### 5.5 `task-store`
- `tasks[]`: Kullanıcı görevleri (başlık, tahmini pomodoro, tamamlanan pomodoro)
- `activeTaskId`: Aktif görevin ID'si — pomodoro sayacı otomatik artar

---

## 6. React Hook Katmanı (`hooks/`)

### 6.1 `use-timer` — Merkezi Koordinatör

`timer-engine.ts` ile Zustand store'ları arasındaki köprüdür. Oturum tamamlandığında hem `session-store`'u hem de `game-store`'u günceller; oyun olaylarını (XP, bitki büyümesi, streak) tetikler.

### 6.2 `use-audio` — Ses Yaşam Döngüsü

Timer durumuna göre ambient soundscape'i açar/kapar. Son 10 saniyede tick seslerini, tamamlanınca zil sesi ve level-up arpejini tetikler.

### 6.3 `use-background` — Görsel Ortam

Seçili ortama göre Unsplash görsellerini 5 dakikada bir smooth crossfade ile değiştirir. Ken Burns (yavaş zoom/pan) animasyonu ve parallax fare takibi uygular.

### 6.4 `use-persistence` — Uygulama Yükleme

Uygulama mount edildiğinde `storage.ts` üzerinden IndexedDB'den tüm store'ları besler (hydrate). Kullanıcı sayfayı yenilediğinde hiçbir veri kaybolmaz.

---

## 7. UI Bileşen Katmanı

### 7.1 Feature Modülleri (`features/`)

Her özellik kendi dizininde paketlenir. Bir özelliğin UI'ı yalnızca kendi hook'larını ve store'larını kullanır; başka feature modüllerine doğrudan bağımlı değildir.

- **`timer/`**: Dairesel progress ring (60 tik işareti, gradient stroke), mod seçici, kontroller
- **`garden/`**: Bitki büyüme animasyonları (5 aşama) + tamamlanan bitkilerin koleksiyon galerisi
- **`stats/`**: GitHub-stili heatmap (12 hafta), günlük ortalama, streak sayacı
- **`tasks/`**: Görev listesi, AI doğal dil girişi, aktif görev takibi
- **`quests/`**: Günlük (3) ve haftalık (2) görev paneli, XP ödüllü
- **`settings/`**: Süre, ses, ortam ve bildirim ayarları

### 7.2 Efekt Bileşenleri (`components/effects/`)

- **`AnimatedBackground`**: Çok katmanlı arka plan (görsel → renk overlay → sis → vignette → partiküller)
- **`ParticleCanvas`**: Canvas 2D üzerinde parçacık sistemi
- **`BreathingOrb`**: Mola sırasında 4-4-4-2 kutu nefes egzersizi animasyonu

### 7.3 UI Primitifleri (`components/ui/`)

- **`GlassCard`**: Backdrop blur ve ince kenarlıklı donuk cam kartları
- **`CircularProgress`**: SVG dairesel progress (gradient stroke + öncü parlak nokta)
- **`TimerDisplay`**: Sayaç gösterimi
- **`Modal`**: Tam ekran kaplama modalları

---

## 8. Psikoloji & UX Sistemi

Uygulama uzun odaklanma oturumlarını desteklemek için bilinçli psikolojik kararlar içerir:

- **Focus sırasında**: Mor (violet) palet — sakinleştirici
- **Mola sırasında**: Zümrüt (emerald) vurgu rengi — canlandırıcı
- **Focus sırasında minimal UI** — dikkat dağıtıcı öğeler gizlenir
- **Bitki öldürme mekaniki**: Erken çıkış caydırıcısı — kullanıcı oturumu terk ederse bitkisi solar
- **Bağlamsal teşvik mesajları** — oturum süresine ve duruma göre değişir
- **Mola sırasında BreathingOrb** — rehberli nefes egzersizi

---

## 9. Kurulum ve Başlangıç

### 9.1 Temel Komutlar

```bash
npm install --legacy-peer-deps
npm run dev
npm run typecheck
npm test -- --run
npm run build
```

### 9.2 AI Görev Bölme (Opsiyonel)

OpenAI destekli görev bölme için ortam değişkeni ayarlanır. Ayarlanmazsa uygulama yine de tam işlevsellikte çalışır; offline fallback devreye girer.

```bash
VITE_OPENAI_API_KEY=sk-... npm run dev
```

### 9.3 Android APK

```bash
npm run build && npm run cap:sync && npm run cap:open
```

Android özellikleri: Haptic feedback, local notifications, screen wake lock, portrait lock, back button minimizasyonu.

### 9.4 PWA

Chrome/Edge'de URL çubuğundaki 'Yükle' düğmesiyle uygulamayı masaüstüne veya ana ekrana ekleyebilirsiniz. Çevrimdışı (offline) destek mevcuttur.

---

## 10. Kritik Veri Akış Senaryosu

### Odaklanma Oturumu Tamamlanma Akışı

Bir focus oturumu sona erdiğinde aşağıdaki olaylar zinciri tetiklenir:

1. `timer-engine.ts` → `timeLeft === 0` sinyali
2. `use-timer` hook olayı yakalar
3. `session-store.addSession()` çağrısı yapılır
4. `game-store.addXP(100 + streakBonus)` çağrısı yapılır
5. Bitki aşaması artırılır (`game-store.advancePlant()`)
6. Günlük streak güncellenir
7. Görev varsa `task-store.incrementPomodoro()` çağrılır
8. Aktif quest'lerin ilerlemesi kontrol edilir
9. `storage.ts` tüm değişiklikleri IndexedDB'ye yazar
10. `use-audio` zil sesini tetikler
11. `use-audio` level-up arpejini kontrol eder (100 XP sınırı aşıldıysa)
12. UI: animasyonlar, teşvik mesajı, moda geçiş

---

*Focus Universe Mimari Dokümantasyonu — Tüm hakları saklıdır.*
