import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { CheckCircle2, Cloud, CloudOff, ImagePlus, LoaderCircle, MapPin, Save, Star, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { getAllSurveys, saveSurveyDraft, syncPendingData } from './services/db'
import type { SurveyData } from './services/db'

type SurveyForm = Omit<SurveyData, 'id' | 'timestamp' | 'syncStatus'>

const emptyForm: SurveyForm = {
  building: '', floor: '', room: '', category: '', rating: 0, notes: '', photoBase64: '',
}

const inputClassName = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'

function App() {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine)
  const [form, setForm] = useState<SurveyForm>(emptyForm)
  const [surveys, setSurveys] = useState<SurveyData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')

  const refreshSurveys = async () => setSurveys(await getAllSurveys())

  const syncSurveys = async () => {
    if (!window.navigator.onLine || isSyncing) return
    setIsSyncing(true)
    try {
      await syncPendingData()
      await refreshSurveys()
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    void getAllSurveys().then((data) => {
      if (isMounted) setSurveys(data)
    })
    const handleOnline = () => {
      setIsOnline(true)
      setIsSyncing(true)
      void syncPendingData()
        .then(() => getAllSurveys())
        .then((data) => {
          if (isMounted) setSurveys(data)
        })
        .finally(() => {
          if (isMounted) setIsSyncing(false)
        })
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      isMounted = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateField = <Key extends keyof SurveyForm>(key: Key, value: SurveyForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setPhoto = (base64: string) => {
    const dataUrl = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`
    updateField('photoBase64', dataUrl)
    setPhotoPreview(dataUrl)
  }

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Base64, source: CameraSource.Camera })
    if (photo.base64String) setPhoto(photo.base64String)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhoto(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoClick = async () => {
    if (Capacitor.isNativePlatform()) {
      await takePhoto()
    } else {
      document.getElementById('photo-upload')?.click()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.building || !form.floor || !form.room || !form.category || !form.rating) return
    setIsSaving(true)
    try {
      await saveSurveyDraft(form)
      setForm(emptyForm)
      setPhotoPreview('')
      await refreshSurveys()
      if (isOnline) void syncSurveys()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><MapPin size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">VKU Field Survey</p><h1 className="text-xl font-bold tracking-tight text-slate-900">Kiểm tra cơ sở vật chất</h1></div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isOnline ? <Cloud size={17} /> : <CloudOff size={17} />}{isOnline ? 'Online' : 'Offline'}{isSyncing && <LoaderCircle className="animate-spin" size={15} />}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7"><p className="mb-2 text-sm font-semibold text-sky-600">Phiếu kiểm tra mới</p><h2 className="text-2xl font-bold tracking-tight">Ghi nhận hiện trạng</h2><p className="mt-2 text-sm text-slate-500">Dữ liệu sẽ được lưu an toàn ngay cả khi mất kết nối.</p></div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Tòa nhà<input className={inputClassName} value={form.building} onChange={(event) => updateField('building', event.target.value)} placeholder="Ví dụ: Khu A" required /></label>
              <label className="text-sm font-semibold text-slate-700">Tầng<input className={inputClassName} value={form.floor} onChange={(event) => updateField('floor', event.target.value)} placeholder="Ví dụ: Tầng 2" required /></label>
              <label className="text-sm font-semibold text-slate-700">Số phòng<input className={inputClassName} value={form.room} onChange={(event) => updateField('room', event.target.value)} placeholder="Ví dụ: A201" required /></label>
              <label className="text-sm font-semibold text-slate-700">Phân loại thiết bị<select className={inputClassName} value={form.category} onChange={(event) => updateField('category', event.target.value)} required><option value="">Chọn loại thiết bị</option><option>Điện / Chiếu sáng</option><option>Điều hòa</option><option>Bàn ghế</option><option>Thiết bị mạng</option><option>Khác</option></select></label>
            </div>
            <fieldset><legend className="text-sm font-semibold text-slate-700">Đánh giá tình trạng</legend><div className="mt-3 flex gap-2" aria-label="Đánh giá từ 1 đến 5 sao">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} sao`} onClick={() => updateField('rating', star)} className={`rounded-xl p-2 transition hover:bg-amber-50 ${star <= form.rating ? 'text-amber-400' : 'text-slate-200'}`}><Star size={28} fill="currentColor" /></button>)}</div></fieldset>
            <label className="block text-sm font-semibold text-slate-700">Ghi chú lỗi<textarea className={`${inputClassName} min-h-28 resize-y`} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Mô tả lỗi hoặc vấn đề cần xử lý..." /></label>
            <div><p className="text-sm font-semibold text-slate-700">Ảnh hiện trạng</p><input id="photo-upload" className="hidden" type="file" accept="image/*" capture="environment" onChange={handleFileChange} /><button type="button" onClick={() => void handlePhotoClick()} className="mt-2 flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700">{photoPreview ? <img src={photoPreview} alt="Ảnh khảo sát" className="max-h-40 rounded-xl object-cover" /> : <><ImagePlus size={25} /><span>{Capacitor.isNativePlatform() ? 'Chụp ảnh bằng camera' : 'Tải ảnh từ thiết bị'}</span><span className="flex items-center gap-1 text-xs font-normal"><Upload size={13} /> JPG, PNG tối đa 10MB</span></>}</button></div>
            <button disabled={isSaving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-70"><Save size={18} />{isSaving ? 'Đang lưu...' : 'Lưu Báo Cáo'}</button>
          </form>
        </section>

        <section className="lg:pt-2"><div className="mb-5 flex items-end justify-between"><div><p className="mb-2 text-sm font-semibold text-sky-600">Nhật ký kiểm tra</p><h2 className="text-2xl font-bold tracking-tight">Lịch sử khảo sát</h2></div><span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{surveys.length} bản ghi</span></div><div className="space-y-3">{surveys.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">Chưa có báo cáo nào được lưu.</div> : surveys.slice().reverse().map((survey) => <article key={survey.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-800">{survey.building} · {survey.room}</h3><p className="mt-1 text-sm text-slate-500">{survey.floor} · {survey.category}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${survey.syncStatus === 'SYNCED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{survey.syncStatus === 'SYNCED' ? <><CheckCircle2 size={13} /> Đã đồng bộ</> : '⏳ Chờ đồng bộ'}</span></div><div className="mt-3 flex items-center gap-1 text-amber-400">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill={star <= survey.rating ? 'currentColor' : 'none'} />)}</div>{survey.notes && <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">{survey.notes}</p>}<time className="mt-3 block text-xs text-slate-400">{new Date(survey.timestamp).toLocaleString('vi-VN')}</time></article>)}</div></section>
      </div>
    </main>
  )
}

export default App
