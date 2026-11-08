import { useState } from 'react'
import AdminCrud from '../components/AdminCrud'
import AlbumManager from '../components/AlbumManager'

const TABS = {
  teachers: {
    label: 'Багш нар', table: 'teachers', titleField: 'name', orderBy: 'name', folder: 'teachers',
        fields: [
      { name: 'name', label: 'Нэр', required: true },
      { name: 'position', label: 'Албан тушаал' },
      { name: 'department', label: 'Алба нэгж' },
      { name: 'degree', label: 'Цол зэрэг' },
      { name: 'email', label: 'И-Мэйл' },
      { name: 'office', label: 'Өрөөний дугаар' },
      { name: 'courses', label: 'Заадаг хичээл (таслалаар тусгаарла)', type: 'textarea' },
      { name: 'bio', label: 'Товч танилцуулга', type: 'textarea' },
      { name: 'education', label: 'Боловсрол (мөр бүрт: Хамгаалсан газар | Он | Сэдэв | Зэрэг)', type: 'textarea' },
      { name: 'work_history', label: 'Ажил эрхлэлт (мөр бүрт нэг)', type: 'textarea' },
      { name: 'training', label: 'Мэргэжлийн сургалт (мөр бүрт нэг)', type: 'textarea' },
      { name: 'publications', label: 'Эрдэм шинжилгээний бүтээл (мөр бүрт нэг)', type: 'textarea' },
      { name: 'research', label: 'Судалгааны төсөл, ажлын тайлан, орчуулга (мөр бүрт нэг)', type: 'textarea' },
      { name: 'photo_url', label: 'Зураг', type: 'image' },
    ],
  },
  events: {
    label: 'Арга хэмжээ', table: 'events', titleField: 'title', orderBy: 'event_date', folder: 'events',
    fields: [
      { name: 'title', label: 'Нэр', required: true },
      { name: 'event_date', label: 'Огноо', type: 'date', required: true },
      { name: 'description', label: 'Тайлбар', type: 'textarea' },
      { name: 'cover_image_url', label: 'Нүүр зураг', type: 'image' },
    ],
  },
  photos: {
    label: 'Зурагт цомог', table: 'event_photos', titleField: 'caption', folder: 'events',
    fields: [
      { name: 'event_id', label: 'Арга хэмжээ', type: 'select', required: true, relation: { table: 'events', label: 'title' } },
      { name: 'image_url', label: 'Зураг', type: 'image', required: true },
      { name: 'caption', label: 'Тайлбар' },
    ],
  },
  timeline: {
    label: 'Түүх (Time Machine)', table: 'timeline_events', titleField: 'title', orderBy: 'year', folder: 'timeline',
    fields: [
      { name: 'year', label: 'Он', type: 'number', required: true },
      { name: 'title', label: 'Гарчиг', required: true },
      { name: 'description', label: 'Тайлбар', type: 'textarea' },
      { name: 'kind', label: 'Төрөл', type: 'select', options: [
        { value: 'history', label: 'Түүх' }, { value: 'technology', label: 'Технологи' },
      ] },
      { name: 'image_url', label: 'Зураг', type: 'image' },
    ],
  },
  exhibits: {
    label: 'Үзмэр хянах', table: 'exhibits', titleField: 'title', orderBy: 'created_at', allowCreate: false,
    fields: [
      { name: 'title', label: 'Гарчиг', required: true },
      { name: 'status', label: 'Төлөв', type: 'select', options: [
        { value: 'published', label: 'Нийтлэгдсэн' }, { value: 'draft', label: 'Ноорог / нууцалсан' },
      ] },
    ],
  },
  categories: {
    label: 'Ангилал', table: 'exhibition_categories', titleField: 'name',
    fields: [
      { name: 'name', label: 'Нэр', required: true },
      { name: 'description', label: 'Тайлбар' },
    ],
  },
}

export default function Admin() {
  const [tab, setTab] = useState('teachers')
  const cfg = TABS[tab]
  return (
    <>
      <h1>Админ хэсэг</h1>
      <div className="chips">
        {Object.entries(TABS).map(([k, t]) => (
          <button key={k} className={tab === k ? 'chip active' : 'chip'} onClick={() => setTab(k)}>{t.label}</button>
        ))}
      </div>
      {tab === 'photos' ? <AlbumManager /> : <AdminCrud key={tab} {...cfg} />}
    </>
  )
}
