# Dynamic Block System — Developer Reference

Bu klasör, sayfa editörünün blok altyapısını içerir. Yeni bir blok yazmadan önce bu dokümanı baştan sona okuyun.

---

## Dizin Yapısı

```
components/dynamic/
├── types.ts                  # BlockDefinition, FieldSchema, FieldType
├── icons.ts                  # ICON_OPTIONS + ICON_MAP (FA icon registry)
├── BlockRegistry.ts          # Tüm code-level blokların merkezi kaydı
├── BaseBlock.tsx             # ← TÜM blokların sarmalı — mutlaka kullan
├── BlockBackground.tsx       # Arkaplan render motoru (renk/resim/svg/video)
├── blockBg.ts                # BG prop parse + schema + default değerler
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
    ├── Canvas.tsx             # Editör canvas — SortableBlock + ResizeHandle
    ├── LeftSidebar.tsx        # Sol panel — blok listesi + hover önizleme
    ├── PropsPanel.tsx         # Sağ panel — schema'ya göre input render eder
    ├── RepeaterField.tsx      # Repeater tipi için accordion UI
    ├── IconPicker.tsx         # Icon tipi için grid seçici UI
    └── stores/editorStore.ts  # Zustand store — sections, selectedId, updateBlockProps
```

---

## BaseBlock — Her Bloğun Zorunlu Sarmalı

`BaseBlock`, tüm blokların dışını saran merkezi wrapper bileşenidir. Şunları yönetir:

- **`blockClass`** — Tailwind sınıfları (`bg-base-100 pt-16` gibi)
- **`sectionId`** — HTML `id` attribute'u (anchor bağlantıları için)
- **`blockHeight`** — Sabit yükseklik (px). 0 = serbest yükseklik. Editörde drag ile ayarlanabilir.
- **`bgProps`** — Arkaplan (renk / gradient / resim / video / svg), `BlockBackground` bileşenine iletilir.

### BaseBlock Kullanım Kalıbı

```tsx
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../BaseBlock'

function MyBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)   // bgProps, sectionId, blockHeight, blockClass
  const title = (rawProps.title as string) || 'Başlık'

  return (
    <BaseBlock {...baseProps}>
      {/* İçerik buraya */}
    </BaseBlock>
  )
}
```

**Kural:** `<BaseBlock>` üzerinde asla hardcode `className` veya `style` yazma. Bunları `defaultProps.blockClass` ile belirt.

```tsx
// YANLIŞ
<BaseBlock className="bg-base-100 pt-16" {...baseProps}>

// DOĞRU — hardcode yok, sınıf defaultProps'tan gelir
<BaseBlock {...baseProps}>
```

### `as` Prop

Varsayılan dış eleman `<section>`. Semantik olarak `<div>` gerekiyorsa:

```tsx
<BaseBlock as="div" {...baseProps}>
```

### `style` Prop

Sabit stil eklemek gerekirse (ör. `height: 100dvh`):

```tsx
<BaseBlock as="div" {...baseProps} style={{ height: '100dvh' }}>
```

**Uyarı:** `blockHeight` sıfırdan büyükse `style` proptaki yükseklik değeri geçersiz kılınır — `blockHeight` her zaman kazanır.

### blockHeight Davranışı

`blockHeight > 0` iken BaseBlock şu stilleri uygular:

```css
height: <blockHeight>px;
min-height: 200px;
overflow: hidden;
display: flex;
flex-direction: column;
justify-content: center;   /* içerik küçülünce ortalanır */
```

Bu sayede editörde drag ile yükseklik ayarlandığında içerik her zaman ortalı kalır ve 200px'in altına düşmez.

### BlockDefinition'da defaultProps

Her blokta şu değerleri ekle:

```tsx
defaultProps: {
  blockClass: 'bg-base-100 pt-16',   // blokun Tailwind görünümü
  sectionId: 'my-section',           // <section id="my-section">
  ...BASE_BLOCK_DEFAULT_PROPS,       // bgProps + blockHeight: 0
  // bloka özel prop'lar...
},
schema: {
  // bloka özel schema...
  ...BASE_BLOCK_SCHEMA_FIELDS,       // blockClass, sectionId, blockHeight + bg alanları
},
```

**Not:** `...BASE_BLOCK_DEFAULT_PROPS` ve `...BASE_BLOCK_SCHEMA_FIELDS` her zaman spread edilmelidir. Aksi hâlde editörde arkaplan ve yükseklik kontrolleri çalışmaz.

---

## BlockBackground ve blockBg

`blockBg.ts` — arkaplan prop'larını parse eder ve schema tanımlar.

```ts
import { parseBgProps, BG_DEFAULT_PROPS, BG_SCHEMA_FIELDS } from './blockBg'
```

Bunlara doğrudan ihtiyaç yoktur; `parseBaseBlockProps` zaten `parseBgProps` çağırır. `BASE_BLOCK_DEFAULT_PROPS` ve `BASE_BLOCK_SCHEMA_FIELDS` spread edildiğinde arkaplan özellikleri otomatik dahil olur.

Arkaplan tipleri: `none` | `color` | `gradient` | `image` | `video` | `svg`

---

## Editör: Resize Handle

`Canvas.tsx`'teki `ResizeHandle` bileşeni, her bloğun altında görünür bir sürükleme tutacağı ekler. Blok sürüklenince `blockHeight` prop'u güncellenir. Kod blok tarafında hiçbir şey gerektirmez — `BaseBlock` yüksekliği otomatik uygular.

Min yükseklik: **200px** (BaseBlock içinde sabit).

---

## Editör: Blok Önizleme Popup (LeftSidebar)

Sol panelde bir bloğun üzerine gelinince sağda önizleme popup'ı açılır. Bu popup:

- `position: fixed` ile viewport'a göre konumlanır
- `z-index: 50` ile editörün kendi stacking context'i içinde canvas içeriğinin (max z-30) üzerinde durur
- `createPortal` kullanılmaz — popup doğrudan LeftSidebar içinde render edilir

**Stacking context notu:** Editör `position: fixed, z-index: 40` ile kendi stacking context'ini oluşturur. Bu context içindeki z-index değerleri: canvas elemanları max z-30, önizleme popup z-50. Popup her zaman canvas üzerinde kalır. `createPortal` ile `document.body`'e render etmek bu senaryoda çalışmaz çünkü editörün stacking context'i global z-index hesaplamasını etkiler.

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

```tsx
'use client'               // bloklar her zaman client component

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../BaseBlock'
import type { BlockDefinition } from '../types'

// 1. İç arayüz tanımları (varsa)
interface MyItem { ... }

// 2. Sabitler ve varsayılan değerler
const DEFAULT_ITEMS: MyItem[] = [ ... ]

// 3. Parse yardımcıları (raw props → typed)
function parseItems(raw: unknown): MyItem[] { ... }

// 4. Blok bileşeni — props her zaman Record<string, unknown>
function MyBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)  // zorunlu
  const title = (rawProps.title as string) || 'Varsayılan'

  return (
    <BaseBlock {...baseProps}>
      {/* içerik */}
    </BaseBlock>
  )
}

// 5. BlockDefinition export — PascalCase + "Definition" suffix
export const MyBlockDefinition: BlockDefinition = {
  type: 'MyBlock',
  label: 'My Block',
  description: '...',
  category: 'Hero',
  defaultProps: {
    title: 'Varsayılan',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'my-section',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title: { label: 'Başlık', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: MyBlock as unknown as BlockDefinition['Component'],
}

export default MyBlock
```

---

## Yeni Blok Kaydetme

`BlockRegistry.ts` dosyasına import + kayıt eklenir:

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
description: { label: 'Açıklama', type: 'textarea' }
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
}
```

**Not:** `uploadFolder` değeri `BaseStorageProvider.allowedFolders` listesine eklenmiş olmalıdır. Mevcut izinli klasörler: `content`, `blog`, `profile`, `backgrounds`, `platforms`, `services`, `projects`, `blocks`.

### `icon`
```ts
icon: { label: 'İkon', type: 'icon', value: 'briefcase' }
```

Blokta kullanmak için: `ICON_MAP[item.icon] ?? faFallback`

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
    title:       { label: 'Başlık',    type: 'text',     value: '' },
    description: { label: 'Açıklama', type: 'textarea', value: '' },
    image:       { label: 'Görsel',   type: 'img',      uploadFolder: 'content', value: '' },
    icon:        { label: 'İkon',     type: 'icon',     value: 'star' },
    link:        { label: 'Bağlantı', type: 'url',      value: '' },
    side:        { label: 'Taraf',    type: 'select',   options: ['left', 'right'], value: 'left' },
  },
}
```

- `fields` içinde tekrar `repeater` desteklenmez.
- Her alt alan `value` tanımlamalıdır — "Add Item" butonu buna göre boş kayıt oluşturur.

---

## Repeater Parse Kalıbı

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

**YANLIŞ:**
```ts
className={`grid-cols-${columns}`}   // JIT algılamaz, CSS üretilmez
```

**DOĞRU — literal map:**
```ts
const COLS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
}
const MD_COLS: Record<number, string> = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4',
}
className={`${COLS[columns]} ${MD_COLS[columns]}`}
```

Bu kural responsive prefix'ler için de geçerlidir.

---

## FontAwesome İkon Serileştirme

`IconDefinition` nesneleri JSON'a dönüştürülemez — asla prop olarak saklama.

- **Prop'ta saklanan:** `string` (ör. `"briefcase"`)
- **Blokta kullanım:** `ICON_MAP[item.icon] ?? faFallback`
- **Editörde seçim:** `type: 'icon'` → `IconPicker`

```ts
import { ICON_MAP } from '../icons'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'

const icon = ICON_MAP[item.icon] ?? faBriefcase
<FontAwesomeIcon icon={icon} />
```

---

## Veri Kaynağı Deseni (API / Manual / Both)

```ts
// Schema'da
dataSource: { label: 'Veri Kaynağı', type: 'select', options: ['api', 'manual', 'both'], value: 'api' }

// Blokta
const dataSource = (rawProps.dataSource as string) || 'api'

useEffect(() => {
  if (dataSource === 'manual') return
  // fetch...
}, [dataSource])

const apiItems    = dataSource === 'manual' ? [] : dbItems
const manualItems = dataSource === 'api'    ? [] : staticItems.map(toShape)
const all         = [...apiItems, ...manualItems].sort(...)
```

---

## Tailwind Boyut Seçici Deseni

```ts
const SIZE_MAP: Record<string, string> = {
  'text-3xl': 'text-3xl', 'text-4xl': 'text-4xl', 'text-5xl': 'text-5xl',
}
const headingSize = SIZE_MAP[(rawProps.headingSize as string) || ''] ?? 'text-5xl'

// Schema
headingSize: { label: 'Başlık Boyutu', type: 'select', options: ['text-3xl', 'text-4xl', 'text-5xl'], value: 'text-5xl' }
```

---

## Mevcut İkon Listesi (`icons.ts`)

**Brand:** `react`, `html5`, `css3`, `nodejs`, `php`, `java`, `python`, `js`, `docker`, `git`, `github`, `aws`, `linux`, `figma`, `vuejs`, `angular`, `swift`, `rust`, `sass`, `wordpress`, `laravel`

**Solid:** `briefcase`, `graduation-cap`, `university`, `school`, `code`, `laptop-code`, `building`, `rocket`, `star`, `medal`, `trophy`, `award`, `certificate`, `chart-line`, `atom`, `flask`, `microscope`, `heart`, `handshake`, `lightbulb`, `users`, `globe`, `layer-group`, `pen-ruler`, `shield-halved`, `database`, `server`, `cloud`, `network-wired`, `cog`, `tools`, `wrench`, `hammer`, `bolt`, `fire`, `leaf`, `flag-checkered`, `map-pin`, `clock`, `calendar`, `key`, `stream`, `money-bill`, `vial`, `archway`, `terminal`, `cubes`, `puzzle-piece`, `gears`, `microchip`

---

## Mevcut Bloklar ve defaultProps Özeti

| type | blockClass (default) | sectionId | as |
|------|---------------------|-----------|-----|
| `WelcomeBlock` | `bg-base-200` | `home` | `div` |
| `HireMeBlock` | `bg-base-200 min-h-screen` | — | `div` |
| `ProjectsBlock` | `bg-base-200 pt-16` | `portfolio` | `section` |
| `TestimonialsBlock` | `bg-base-300 md:px-24` | — | `section` |
| `ToolboxBlock` | `hero bg-base-300 py-8 px-4 md:px-20 items-center justify-center min-h-screen` | — | `section` |
| `GitContributionsBlock` | `hero min-h-screen bg-base-100 hidden lg:flex items-center justify-center` | — | `div` |
| `ContactBlock` | `min-h-screen md:pt-24 bg-base-100` | `contact` | `section` |
| `ProseBlock` | `min-h-screen bg-base-100 pt-32` | — | `section` |
| `PlatformsBlock` | `py-12 bg-base-200` | — | `section` |
| `ServicesBlock` | `bg-base-100 pt-16` | `services` | `section` |
| `TimelineBlock` | `bg-base-100 pt-16` | `timeline` | `section` |

---

## Tam Blok Örneği (Referans)

```tsx
'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { ICON_MAP } from '../icons'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../BaseBlock'
import type { BlockDefinition } from '../types'

interface CardItem {
  title: string
  description: string
  icon: string
}

const DEFAULT_CARDS: CardItem[] = [
  { title: 'Kart 1', description: 'Açıklama.', icon: 'star' },
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
  const baseProps = parseBaseBlockProps(rawProps)
  const title   = (rawProps.title as string) || 'Başlık'
  const columns = Math.min(4, Math.max(1, Number(rawProps.columns) || 3))
  const cards   = parseCards(rawProps.cards)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 px-4 mx-auto max-w-screen-xl py-8">
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
      </div>
    </BaseBlock>
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
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'example',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title:   { label: 'Başlık',       type: 'text' },
    columns: { label: 'Sütun Sayısı', type: 'number', value: 3 },
    cards: {
      label: 'Kartlar',
      type: 'repeater',
      fields: {
        title:       { label: 'Başlık',    type: 'text',     value: '' },
        description: { label: 'Açıklama', type: 'textarea', value: '' },
        icon:        { label: 'İkon',     type: 'icon',     value: 'star' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ExampleBlock as unknown as BlockDefinition['Component'],
}

export default ExampleBlock
```

---

## Sık Yapılan Hatalar

| Hata | Çözüm |
|------|-------|
| `<BaseBlock>` kullanmamak | Her blok `<BaseBlock {...baseProps}>` sarmalında olmalı |
| `<BaseBlock className="...">` yazmak | Hardcode class yasak — `defaultProps.blockClass` kullan |
| `parseBaseBlockProps` çağırmamak | Her blokta `const baseProps = parseBaseBlockProps(rawProps)` zorunlu |
| `...BASE_BLOCK_DEFAULT_PROPS` eksik | `defaultProps`'a spread edilmezse arkaplan/yükseklik kontrolleri çalışmaz |
| `...BASE_BLOCK_SCHEMA_FIELDS` eksik | `schema`'ya spread edilmezse editörde bg/height alanları görünmez |
| Dinamik Tailwind sınıfı (`grid-cols-${n}`) | Literal map kullan |
| FA `IconDefinition` prop'a saklanıyor | String isim sakla, `ICON_MAP` ile çöz |
| `uploadFolder` allowedFolders'da yok | `BaseStorageProvider.allowedFolders`'a ekle |
| Repeater içinde repeater | Desteklenmez, yapıyı düzleştir |
| `rawProps.x` undefined hatası | `(rawProps.x as T) \|\| fallback` kalıbını kullan |
| `'use client'` eksik | Her blok dosyası `'use client'` ile başlamalı |
| BlockRegistry'e eklenmemiş | `BlockRegistry.ts`'e import + kayıt ekle |
| `z-index` çakışması içerikte | İçerik div'ine `relative z-10` ekle — `BlockBackground` `z-0`'da kalır |
| Editör içinde `createPortal` ile `document.body` | Çalışmaz — editör kendi stacking context'ini oluşturur; fixed/portalled elemanları editör içinde `z-index` ile yönet |
