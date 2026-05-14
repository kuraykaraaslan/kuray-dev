# Dynamic Block System — Developer Reference

Bu klasör, sayfa editörünün blok altyapısını içerir. Yeni bir blok yazmadan önce bu dokümanı baştan sona okuyun.

---

## Dizin Yapısı

```
components/dynamic/
├── types.ts                  # BlockDefinition, FieldSchema, FieldType
├── icons.ts                  # ICON_OPTIONS + ICON_MAP (FA icon registry)
├── BlockRegistry.ts          # Tüm code-level blokların merkezi kaydı
├── Blocks/
│   ├── WelcomeBlock.tsx
│   ├── PlatformsBlock.tsx
│   ├── ServicesBlock.tsx
│   ├── TimelineBlock.tsx
│   ├── ToolboxBlock.tsx
│   ├── TestimonialsBlock.tsx
│   ├── ProjectsBlock.tsx
│   ├── ContactBlock.tsx
│   ├── HireMeBlock.tsx
│   ├── GitContributionsBlock.tsx
│   ├── ProseBlock.tsx
│   └── CustomBlock.tsx       # AI ile oluşturulan dinamik bloklar
└── Editor/
    ├── PropsPanel.tsx         # Sağ panel — schema'ya göre input render eder
    ├── RepeaterField.tsx      # Repeater tipi için accordion UI
    ├── IconPicker.tsx         # Icon tipi için grid seçici UI
    └── ...
```

---

## Temel Tipler (`types.ts`)

```ts
export type FieldType =
  | 'text'      // <input type="text">
  | 'url'       // <input type="url">
  | 'textarea'  // <textarea>
  | 'number'    // <input type="number">
  | 'boolean'   // <input type="checkbox">
  | 'color'     // renk seçici + text input
  | 'select'    // <select> — options dizisi zorunlu
  | 'img'       // resim önizleme + URL input + dosya yükleme
  | 'icon'      // FontAwesome icon grid seçici
  | 'json'      // ham JSON textarea
  | 'repeater'  // tekrarlanan kayıt listesi — fields alt-şeması zorunlu

export interface FieldSchema {
  label: string
  type: FieldType
  value?: unknown           // varsayılan değer (repeater add item için)
  options?: string[]        // select ve repeater>select için
  placeholder?: string
  uploadFolder?: string     // img tipi için S3 klasörü
  accept?: string           // img tipi için dosya filtresi (ör. 'image/*')
  fields?: Record<string, Omit<FieldSchema, 'fields'>>  // repeater alt-alanları
}

export interface BlockDefinition {
  type: string              // benzersiz PascalCase ID (ör. 'WelcomeBlock')
  label: string             // editörde gösterilen isim
  description: string       // editörde gösterilen açıklama
  category: string          // sol panelde gruplama (ör. 'Hero')
  defaultProps: Record<string, unknown>   // yeni blok oluşturunca başlangıç değerleri
  schema: Record<string, FieldSchema>     // PropsPanel'in render ettiği alan listesi
  Component: ComponentType<Record<string, unknown>>
}
```

---

## Blok Dosyası Anatomisi

Her blok dosyası şu yapıyı izler:

```tsx
'use client'               // bloklar her zaman client component

// 1. İç arayüz tanımları (varsa)
interface MyItem { ... }

// 2. Sabitler ve varsayılan değerler
const DEFAULT_ITEMS: MyItem[] = [ ... ]

// 3. Parse yardımcıları (raw props → typed)
function parseItems(raw: unknown): MyItem[] { ... }

// 4. Blok bileşeni — props her zaman Record<string, unknown>
function MyBlock(rawProps: Record<string, unknown>) {
  const title = (rawProps.title as string) || 'Varsayılan'
  // ...
  return <section>...</section>
}

// 5. BlockDefinition export — PascalCase + "Definition" suffix
export const MyBlockDefinition: BlockDefinition = {
  type: 'MyBlock',
  label: 'My Block',
  description: '...',
  category: 'Hero',
  defaultProps: { title: 'Varsayılan', ... },
  schema: { title: { label: 'Başlık', type: 'text' }, ... },
  Component: MyBlock as unknown as BlockDefinition['Component'],
}

export default MyBlock
```

---

## Yeni Blok Kaydetme

`BlockRegistry.ts` dosyasına import + kayıt eklenmelidir:

```ts
import { MyBlockDefinition } from './Blocks/MyBlock'

const CODE_BLOCKS: Record<string, BlockDefinition> = {
  // ... mevcut bloklar
  [MyBlockDefinition.type]: MyBlockDefinition,
}
```

---

## Schema Alanı Başvurusu

### `text`
```ts
myField: { label: 'Başlık', type: 'text', placeholder: 'Ör. Merhaba' }
```

### `url`
```ts
ctaHref: { label: 'Bağlantı', type: 'url', placeholder: 'https://...' }
```

### `textarea`
```ts
description: { label: 'Açıklama', type: 'textarea', placeholder: '...' }
```

### `number`
```ts
columns: { label: 'Sütun Sayısı', type: 'number', value: 3 }
```

### `boolean`
```ts
showButton: { label: 'Butonu Göster', type: 'boolean', value: true }
```

### `color`
```ts
bgColor: { label: 'Arkaplan Rengi', type: 'color', value: '#ffffff' }
```

### `select`
```ts
dataSource: {
  label: 'Veri Kaynağı',
  type: 'select',
  options: ['api', 'manual', 'both'],
  value: 'api',
}
```

### `img`
```ts
coverImage: {
  label: 'Kapak Görseli',
  type: 'img',
  uploadFolder: 'services',   // ZORUNLU — allowedFolders listesinde olmalı
  accept: 'image/*',          // opsiyonel
}
```

**Not:** `uploadFolder` değeri `BaseStorageProvider.allowedFolders` listesine eklenmiş olmalıdır. Mevcut izinli klasörler: `content`, `blog`, `profile`, `backgrounds`, `platforms`, `services`, `projects`, `blocks`.

### `icon`
```ts
icon: { label: 'İkon', type: 'icon', value: 'briefcase' }
```

`IconPicker` bileşeni açılır. Değer, `icons.ts`'deki `ICON_OPTIONS[].name` string'idir.
Blokta kullanmak için: `ICON_MAP[item.icon] ?? faFallback`.

### `json`
```ts
rawData: { label: 'Ham JSON', type: 'json' }
```

### `repeater`
```ts
items: {
  label: 'Öğeler',
  type: 'repeater',
  fields: {
    title:       { label: 'Başlık',       type: 'text',     value: '' },
    description: { label: 'Açıklama',     type: 'textarea', value: '' },
    image:       { label: 'Görsel',       type: 'img',      uploadFolder: 'content', value: '' },
    icon:        { label: 'İkon',         type: 'icon',     value: 'star' },
    link:        { label: 'Bağlantı',     type: 'url',      value: '' },
    side:        { label: 'Taraf',        type: 'select',   options: ['left', 'right'], value: 'left' },
  },
}
```

- `fields` içinde tekrar `repeater` (iç içe repeater) desteklenmez.
- Her alt alan `value` tanımlamalıdır — "Add Item" butonu buna göre boş kayıt oluşturur.
- Repeater prop'u blokta `Array.isArray(rawProps.items) ? rawProps.items as Item[] : []` ile alınmalıdır.

---

## Repeater Parse Kalıbı

Repeater verileri JSON string olarak saklanabilir. Standart parse fonksiyonu:

```ts
function parseItems(raw: unknown): MyItem[] {
  if (Array.isArray(raw)) return raw as MyItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_ITEMS  // ya da []
}
```

---

## Tailwind JIT — Dinamik Sınıf Yasağı

Tailwind JIT, kaynak kodda literal olarak görünmeyen sınıfları üretmez.

**YANLIŞ:**
```ts
className={`grid-cols-${columns}`}   // JIT tarafından algılanmaz, CSS üretilmez
```

**DOĞRU — literal map:**
```ts
const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}
className={COLS[columns]}
```

Bu kural responsive prefix'ler için de geçerlidir (`md:grid-cols-3` vs.).

---

## FontAwesome İkon Serileştirme Kuralı

`IconDefinition` nesneleri JSON'a dönüştürülemez — asla prop olarak saklama.

- Prop'ta saklanan: `string` (ör. `"briefcase"`)
- Blokta kullanım: `ICON_MAP[item.icon] ?? faFallback`
- Editor'da seçim: `type: 'icon'` → `IconPicker` bileşeni

```ts
import { ICON_MAP } from '../icons'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'

const icon = ICON_MAP[item.icon] ?? faBriefcase
<FontAwesomeIcon icon={icon} />
```

---

## Veri Kaynağı Deseni (API / Manual / Both)

DB verisi veya statik veriyle çalışan bloklar için standart desen:

```ts
// Schema'da
dataSource: {
  label: 'Veri Kaynağı',
  type: 'select',
  options: ['api', 'manual', 'both'],
  value: 'api',
}

// Blokta
const dataSource = (rawProps.dataSource as string) || 'api'

useEffect(() => {
  if (dataSource === 'manual') return
  // fetch from API...
}, [dataSource])

const apiItems  = dataSource === 'manual' ? [] : dbItems
const manualItems = dataSource === 'api' ? [] : staticItems.map(toShape)
const allItems  = [...apiItems, ...manualItems].sort(...)
```

Örnek bloklar: `TestimonialsBlock`, `ProjectsBlock`.

---

## Tailwind Boyut Seçici Deseni

Blokta yazı boyutu gibi Tailwind sınıfları seçilebilir olacaksa:

```ts
const SIZE_MAP: Record<string, string> = {
  'text-3xl': 'text-3xl',
  'text-4xl': 'text-4xl',
  'text-5xl': 'text-5xl',
}
const headingSize = SIZE_MAP[(rawProps.headingSize as string) || ''] ?? 'text-5xl'

// Schema'da
headingSize: {
  label: 'Başlık Boyutu',
  type: 'select',
  options: ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'],
  value: 'text-5xl',
}
```

---

## Mevcut İkon Listesi (`icons.ts`)

**Brand ikonlar:** `react`, `html5`, `css3`, `nodejs`, `php`, `java`, `python`, `js`, `docker`, `git`, `github`, `aws`, `linux`, `figma`, `vuejs`, `angular`, `swift`, `rust`, `sass`, `wordpress`, `laravel`

**Solid ikonlar:** `briefcase`, `graduation-cap`, `university`, `school`, `code`, `laptop-code`, `building`, `rocket`, `star`, `medal`, `trophy`, `award`, `certificate`, `chart-line`, `atom`, `flask`, `microscope`, `heart`, `handshake`, `lightbulb`, `users`, `globe`, `layer-group`, `pen-ruler`, `shield-halved`, `database`, `server`, `cloud`, `network-wired`, `cog`, `tools`, `wrench`, `hammer`, `bolt`, `fire`, `leaf`, `flag-checkered`, `map-pin`, `clock`, `calendar`, `key`, `stream`, `money-bill`, `vial`, `archway`, `terminal`, `cubes`, `puzzle-piece`, `gears`, `microchip`

---

## Mevcut Bloklar

| type | Dosya | Açıklama |
|------|-------|----------|
| `WelcomeBlock` | WelcomeBlock.tsx | Tam ekran hero, profil fotoğrafı, arkaplan |
| `PlatformsBlock` | PlatformsBlock.tsx | Logo grid, resim yüklemeli, mobil/desktop sütun |
| `ServicesBlock` | ServicesBlock.tsx | Hizmet kartı grid, repeater |
| `TimelineBlock` | TimelineBlock.tsx | Dikey zaman çizelgesi, FA ikon seçici |
| `ToolboxBlock` | ToolboxBlock.tsx | Teknoloji kartları, büyük/küçük satır tipleri |
| `TestimonialsBlock` | TestimonialsBlock.tsx | İki sütun referans grid, API/manual |
| `ProjectsBlock` | ProjectsBlock.tsx | Filtreli proje grid, API/manual/both |
| `ContactBlock` | ContactBlock.tsx | İletişim formu + sosyal bağlantılar |
| `HireMeBlock` | HireMeBlock.tsx | Dünya haritası animasyonu, video |
| `GitContributionsBlock` | GitContributionsBlock.tsx | GitHub katkı ısı haritası |
| `ProseBlock` | ProseBlock.tsx | Zengin metin (TipTap/HTML) |
| `CustomBlock` | CustomBlock.tsx | AI ile oluşturulan özel blok |

---

## Tam Blok Örneği (Referans)

```tsx
'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_MAP } from '../icons'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import type { BlockDefinition } from '../types'

interface CardItem {
  title: string
  description: string
  icon: string
  image: string
}

const DEFAULT_CARDS: CardItem[] = [
  { title: 'Kart 1', description: 'Açıklama.', icon: 'star', image: '' },
]

function parseCards(raw: unknown): CardItem[] {
  if (Array.isArray(raw)) return raw as CardItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_CARDS
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
}
const MD_COLS: Record<number, string> = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4',
}

function ExampleBlock(rawProps: Record<string, unknown>) {
  const title   = (rawProps.title as string) || 'Başlık'
  const columns = Math.min(4, Math.max(1, Number(rawProps.columns) || 3))
  const cards   = parseCards(rawProps.cards)

  return (
    <section className="py-16 px-4 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <div className={`grid gap-6 ${COLS[columns]} ${MD_COLS[columns]}`}>
        {cards.map((card, i) => {
          const icon = ICON_MAP[card.icon] ?? faStar
          return (
            <div key={i} className="p-6 rounded-lg bg-base-100 shadow">
              <FontAwesomeIcon icon={icon} className="text-3xl mb-3" />
              <h3 className="font-bold text-lg">{card.title}</h3>
              <p className="text-sm opacity-70">{card.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export const ExampleBlockDefinition: BlockDefinition = {
  type: 'ExampleBlock',
  label: 'Example',
  description: 'Örnek kart grid bloğu.',
  category: 'Hero',
  defaultProps: {
    title: 'Başlık',
    columns: 3,
    cards: DEFAULT_CARDS,
  },
  schema: {
    title:   { label: 'Başlık',           type: 'text' },
    columns: { label: 'Sütun Sayısı',     type: 'number', value: 3 },
    cards: {
      label: 'Kartlar',
      type: 'repeater',
      fields: {
        title:       { label: 'Başlık',    type: 'text',     value: '' },
        description: { label: 'Açıklama', type: 'textarea', value: '' },
        icon:        { label: 'İkon',      type: 'icon',     value: 'star' },
        image:       { label: 'Görsel',   type: 'img',      uploadFolder: 'content', value: '' },
      },
    },
  },
  Component: ExampleBlock as unknown as BlockDefinition['Component'],
}

export default ExampleBlock
```

---

## Sık Yapılan Hatalar

| Hata | Çözüm |
|------|-------|
| Dinamik Tailwind sınıfı (`grid-cols-${n}`) | Literal map kullan |
| FA `IconDefinition` prop'a saklanıyor | String isim sakla, `ICON_MAP` ile çöz |
| `uploadFolder` allowedFolders'da yok | `BaseStorageProvider.allowedFolders`'a ekle |
| Repeater içinde repeater | Desteklenmez, yapıyı düzleştir |
| Props `rawProps.x` undefined hatası | `(rawProps.x as T) \|\| fallback` kalıbını kullan |
| `'use client'` eksik | Her blok dosyası `'use client'` ile başlamalı |
| BlockRegistry'e eklenmemiş | `BlockRegistry.ts`'e import + kayıt ekle |
