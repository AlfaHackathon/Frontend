import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import {
  companyKnowledgeApi,
  companyKnowledgeKeys,
  useCompanyKnowledge,
  useCompanyMaterial,
  useCompanyMaterials,
  useMyCompany,
  type CreateCompanyMaterial,
  type KnowledgeSourceRef,
  type PutCompanyKnowledge,
} from '@/entities/company'
import { ApiError } from '@/shared/api'
import styles from './KnowledgeSection.module.css'

interface PendingWrite {
  body: string
  key: string
}

function idempotencyKey(pending: { current: PendingWrite | null }, body: unknown): string {
  const serialized = JSON.stringify(body)
  if (pending.current?.body === serialized) return pending.current.key
  const key = crypto.randomUUID()
  pending.current = { body: serialized, key }
  return key
}

function refKey(ref: KnowledgeSourceRef): string {
  return `${ref.materialId}\u0000${ref.versionId}`
}

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Проверьте заполнение и размер текста, затем повторите.'
    if (error.status === 403) return 'У вас нет прав на изменение базы знаний.'
    if (error.status === 404) return 'Материал или профиль не найден.'
    if (error.status === 409) return 'Данные изменились. Проверьте форму и повторите сохранение.'
    if (error.status === 503) return 'Сервис временно недоступен. Повторите запрос с теми же данными.'
  }
  return 'Не удалось выполнить запрос. Попробуйте ещё раз.'
}

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

export function KnowledgeSection() {
  const queryClient = useQueryClient()
  const company = useMyCompany()
  const knowledge = useCompanyKnowledge(company.isSuccess)
  const materials = useCompanyMaterials(company.isSuccess)
  const [selectedMaterial, setSelectedMaterial] = useState<KnowledgeSourceRef | null>(null)
  const material = useCompanyMaterial(selectedMaterial?.materialId, selectedMaterial?.versionId)
  const [description, setDescription] = useState('')
  const [industryCodes, setIndustryCodes] = useState('')
  const [exposures, setExposures] = useState('')
  const [sourceRefs, setSourceRefs] = useState<KnowledgeSourceRef[]>([])
  const [title, setTitle] = useState('')
  const [documentText, setDocumentText] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const loadedRevision = useRef<string | null>(null)
  const pendingProfile = useRef<PendingWrite | null>(null)
  const pendingMaterial = useRef<PendingWrite | null>(null)

  useEffect(() => {
    const profile = knowledge.data
    if (!profile || loadedRevision.current === profile.revisionId) return
    loadedRevision.current = profile.revisionId
    setDescription(profile.description)
    setIndustryCodes(profile.industryCodes.join('\n'))
    setExposures(profile.exposures.join('\n'))
    setSourceRefs(profile.sourceRefs.map(({ materialId, versionId }) => ({ materialId, versionId })))
  }, [knowledge.data])

  const saveProfile = useMutation({
    mutationFn: ({ body, key }: { body: PutCompanyKnowledge; key: string }) => companyKnowledgeApi.put(body, key),
    onSuccess: (profile) => {
      pendingProfile.current = null
      queryClient.setQueryData(companyKnowledgeKeys.profile, profile)
      setValidation(null)
    },
  })
  const addMaterial = useMutation({
    mutationFn: ({ body, key }: { body: CreateCompanyMaterial; key: string }) => companyKnowledgeApi.createMaterial(body, key),
    onSuccess: (created) => {
      pendingMaterial.current = null
      setTitle('')
      setDocumentText('')
      setSourceRefs((current) => [...current, { materialId: created.materialId, versionId: created.versionId }])
      void queryClient.invalidateQueries({ queryKey: companyKnowledgeKeys.materials })
    },
  })

  const items = materials.data?.pages.flatMap((page) => page.items) ?? []
  const loadedKeys = new Set(items.map(refKey))
  const isCreator = company.data?.isCreator === true
  const unavailable = materials.error instanceof ApiError && materials.error.status === 404 && company.isSuccess
  const profileMissing = knowledge.error instanceof ApiError && knowledge.error.status === 404
  const profileReady = knowledge.isSuccess || profileMissing

  function toggleSource(ref: KnowledgeSourceRef) {
    const key = refKey(ref)
    setSourceRefs((current) => current.some((item) => refKey(item) === key)
      ? current.filter((item) => refKey(item) !== key)
      : [...current, ref])
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body: PutCompanyKnowledge = {
      description: description.trim(),
      industryCodes: industryCodes.split(/[\r\n,]+/).map((item) => item.trim()).filter(Boolean),
      exposures: lines(exposures),
      sourceRefs,
    }
    if (!body.description || body.sourceRefs.length === 0) {
      setValidation('Укажите описание и выберите хотя бы один материал.')
      return
    }
    if (body.industryCodes.length > 64 || body.industryCodes.some((code) => code.length > 100) ||
      body.exposures.length > 64 || body.exposures.some((exposure) => exposure.length > 1000) || body.sourceRefs.length > 64) {
      setValidation('Превышен лимит кодов, факторов или материалов.')
      return
    }
    setValidation(null)
    try {
      await saveProfile.mutateAsync({ body, key: idempotencyKey(pendingProfile, body) })
    } catch { /* Ошибка показана рядом с формой; ключ сохранён для повторения. */ }
  }

  async function submitMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = { title: title.trim(), text: documentText.trim() }
    if (!body.title || !body.text) return
    try {
      await addMaterial.mutateAsync({ body, key: idempotencyKey(pendingMaterial, body) })
    } catch { /* Ошибка показана рядом с формой; ключ сохранён для повторения. */ }
  }

  if (company.isPending) return <p className={styles.state}>Загружаем компанию…</p>
  if (company.isError) return <p className={styles.state} role="alert">{company.error instanceof ApiError && company.error.status === 404
    ? 'Вы пока не состоите в компании.' : `Не удалось получить компанию. ${errorText(company.error)}`}</p>
  if (materials.isPending) return <p className={styles.state}>Загружаем базу знаний…</p>
  if (unavailable) return <p className={styles.state}>База знаний появится после обновления CompanyService.</p>
  if (materials.isError && !materials.data) return <div className={styles.state} role="alert">{errorText(materials.error)} <button type="button" onClick={() => void materials.refetch()}>Повторить</button></div>

  return <div className={styles.root}>
    {knowledge.isPending && <p className={styles.state}>Загружаем профиль знаний…</p>}
    {knowledge.isError && !profileMissing &&
      <p className={styles.state} role="alert">{errorText(knowledge.error)}</p>}

    {profileReady && (isCreator ? <form className={styles.profileForm} onSubmit={(event) => void submitProfile(event)}>
      <h3>Профиль знаний</h3>
      <label>Коротко о бизнесе<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={16000} rows={4} required /></label>
      <label>Коды отраслей<textarea value={industryCodes} onChange={(event) => setIndustryCodes(event.target.value)} rows={2} placeholder="По одному коду на строку" /></label>
      <label>Факторы влияния<textarea value={exposures} onChange={(event) => setExposures(event.target.value)} rows={3} placeholder="По одному фактору на строку" /></label>
      <fieldset className={styles.sources}>
        <legend>Материалы для профиля</legend>
        {items.map((item) => <label key={refKey(item)} className={styles.sourceChoice}>
          <input type="checkbox" checked={sourceRefs.some((ref) => refKey(ref) === refKey(item))} onChange={() => toggleSource(item)} />
          {item.title}
        </label>)}
        {sourceRefs.filter((ref) => !loadedKeys.has(refKey(ref))).map((ref) => <label key={refKey(ref)} className={styles.sourceChoice}>
          <input type="checkbox" checked onChange={() => toggleSource(ref)} />
          Сохранённый материал {ref.materialId}
        </label>)}
        {items.length === 0 && sourceRefs.length === 0 && <span className={styles.muted}>Сначала добавьте текст материала.</span>}
      </fieldset>
      {validation && <p className={styles.error} role="alert">{validation}</p>}
      {saveProfile.isError && <p className={styles.error} role="alert">{errorText(saveProfile.error)}</p>}
      <button className={styles.primaryButton} type="submit" disabled={saveProfile.isPending || knowledge.isPending}>{saveProfile.isPending ? 'Сохраняем…' : 'Сохранить профиль'}</button>
    </form> : <div className={styles.profileReadOnly}>
      <h3>Профиль знаний</h3>
      {knowledge.data ? <>
        <p>{knowledge.data.description}</p>
        {knowledge.data.industryCodes.length > 0 && <div><strong>Коды отраслей</strong><span>{knowledge.data.industryCodes.join(', ')}</span></div>}
        {knowledge.data.exposures.length > 0 && <div><strong>Факторы влияния</strong><span>{knowledge.data.exposures.join(', ')}</span></div>}
      </> : <p className={styles.muted}>Профиль пока не заполнен.</p>}
    </div>)}

    <div className={styles.materialsHeader}><h3>Материалы</h3><span>{items.length}</span></div>
    {items.length === 0 && <p className={styles.muted}>Материалов пока нет.</p>}
    <div className={styles.materialList}>{items.map((item) => <div className={styles.materialRow} key={refKey(item)}>
      <span className={styles.fileIcon}><FileText size={20} strokeWidth={1.6} /></span>
      <div><strong>{item.title}</strong><small>Текст · {new Date(item.knownAt).toLocaleDateString('ru-RU')}</small></div>
      <button type="button" onClick={() => setSelectedMaterial({ materialId: item.materialId, versionId: item.versionId })}>Читать</button>
    </div>)}</div>
    {materials.hasNextPage && <button className={styles.secondaryButton} type="button" disabled={materials.isFetchingNextPage} onClick={() => void materials.fetchNextPage()}>
      {materials.isFetchingNextPage ? 'Загружаем…' : 'Показать ещё'}
    </button>}
    {materials.isFetchNextPageError && <p className={styles.error} role="alert">{errorText(materials.error)}</p>}

    {selectedMaterial && <div className={styles.reader}>
      <div><h3>{material.data?.title ?? 'Материал'}</h3><button type="button" onClick={() => setSelectedMaterial(null)} aria-label="Закрыть материал">×</button></div>
      {material.isPending && <p className={styles.state}>Загружаем текст…</p>}
      {material.isError && <p className={styles.error} role="alert">{errorText(material.error)}</p>}
      {material.data && <p className={styles.materialText}>{material.data.text}</p>}
    </div>}

    {isCreator && <form className={styles.materialForm} onSubmit={(event) => void submitMaterial(event)}>
      <h3>Добавить текст материала</h3>
      <label>Название<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={1000} required /></label>
      <label>Текст<textarea value={documentText} onChange={(event) => setDocumentText(event.target.value)} maxLength={200000} rows={6} required /></label>
      {addMaterial.isError && <p className={styles.error} role="alert">{errorText(addMaterial.error)}</p>}
      <button className={styles.primaryButton} type="submit" disabled={addMaterial.isPending}>{addMaterial.isPending ? 'Добавляем…' : 'Добавить материал'}</button>
    </form>}
  </div>
}
