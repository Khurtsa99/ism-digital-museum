# ISM Digital Museum

Мэдээллийн Системийн Менежментийн тэнхимийн түүх, багш нар, арга хэмжээ, оюутнуудын бүтээлийг интерактив байдлаар танилцуулах веб аппликейшн.
Internet Programming · Гэрийн даалгавар №1.

## Онцлог
- Дижитал үзэсгэлэн: үзмэрийн жагсаалт, дэлгэрэнгүй хуудас, хайлт ба ангилал (нэр, он, ангилал, технологи)
- Тэнхимийн багш нар, өдөрлөг/арга хэмжээ ба зурагт цомог
- **Бүтээлч шийдэл: ISM Time Machine**: түүх, арга хэмжээ, оюутны бүтээл, технологийг нэг цаг хугацааны шугамд нэгтгэн, төрлөөр шүүж, дарж дэлгэрүүлж үздэг
- ISM Creators: оюутны профайл ба тэдний бүтээлийн холбоос; тэнхимийн түүхийн хуудас
- Бүртгэл, нэвтрэлт (Supabase Auth), оюутны өөрийн бүтээлийн CRUD + зураг оруулах (Supabase Storage)
- Админ хэсэг: багш, арга хэмжээ, цомог, түүх, ангилал удирдах
- Row Level Security: хэрэглэгч зөвхөн өөрийн бүтээлийг засна/устгана

## Технологи
React 18 + JavaScript (Vite), React Router, Supabase (Auth, PostgreSQL, Storage, RLS), Vercel/Netlify

## Суулгах заавар
1. `npm install`
2. Supabase дээр project үүсгээд **SQL Editor**-т `supabase/schema.sql`-ийг ажиллуулна
3. `.env.example`-ийг `.env` болгож хуулаад Project Settings → API хэсгээс `URL` ба `anon public` түлхүүрийг бөглөнө
   (service_role түлхүүрийг ХЭЗЭЭ Ч frontend-д тавихгүй)
4. `npm run dev`
5. Бүртгүүлсний дараа админ болгохдоо SQL Editor-т:
   `update profiles set role = 'admin' where id = (select id from auth.users where email = 'ТАНЫ_ИМЭЙЛ');`

## Өгөгдлийн сангийн бүтэц
`profiles` (id → auth.users), `exhibition_categories`, `exhibits` (creator_id → profiles.id, category_id → exhibition_categories.id),
`teachers`, `events`, `event_photos` (event_id → events.id), `timeline_events`.
Primary key нь мөр бүрийг өвөрмөц тодорхойлж, foreign key нь хүснэгтүүдийг холбоно.

## Баримтжуулалт
- ERD: `docs/ERD.png`, тайлбар `docs/ERD.md`
- Wireframe: `docs/wireframes.png`
- Шаардлагын шалгах хуудас: `docs/CHECKLIST.md`
- Demo скрипт: `docs/DEMO.md`

## Байршуулалт
Vercel/Netlify дээр repo-г холбож, Environment Variables-д `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`-г нэмнэ.

## Эх сурвалж
Багш нарын нэр, албан тушаал, зургийг тэнхимийн нийтэд ил вэб сайтаас авсан болно.
