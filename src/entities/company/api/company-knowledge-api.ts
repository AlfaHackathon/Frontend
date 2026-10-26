import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import type {
  CompanyKnowledge,
  CompanyMaterial,
  CompanyMaterialsPage,
  CreateCompanyMaterial,
  PutCompanyKnowledge,
} from '../model/knowledge-types'

const base = '/company-service/companies/me'

export const companyKnowledgeApi = {
  get: () => apiClient.get<CompanyKnowledge>(`${base}/knowledge`),
  put: (value: PutCompanyKnowledge, idempotencyKey: string) =>
    apiClient.put<CompanyKnowledge>(`${base}/knowledge`, value, { 'Idempotency-Key': idempotencyKey }),
  listMaterials: (cursor?: string) => {
    const query = new URLSearchParams({ limit: '20' })
    if (cursor) query.set('cursor', cursor)
    return apiClient.get<CompanyMaterialsPage>(`${base}/materials?${query}`)
  },
  createMaterial: (value: CreateCompanyMaterial, idempotencyKey: string) =>
    apiClient.post<CompanyMaterial>(`${base}/materials`, value, { 'Idempotency-Key': idempotencyKey }),
  getMaterial: (materialId: string, versionId: string) =>
    apiClient.get<CompanyMaterial>(`${base}/materials/${encodeURIComponent(materialId)}/versions/${encodeURIComponent(versionId)}`),
}

export const companyKnowledgeKeys = {
  profile: ['company', 'knowledge'] as const,
  materials: ['company', 'materials'] as const,
  material: (materialId: string, versionId: string) => ['company', 'material', materialId, versionId] as const,
}

export const useCompanyKnowledge = (enabled = true) => useQuery({
  queryKey: companyKnowledgeKeys.profile,
  queryFn: companyKnowledgeApi.get,
  enabled,
  retry: false,
})

export const useCompanyMaterials = (enabled = true) => useInfiniteQuery({
  queryKey: companyKnowledgeKeys.materials,
  queryFn: ({ pageParam }) => companyKnowledgeApi.listMaterials(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (page) => page.nextCursor ?? undefined,
  enabled,
  retry: false,
})

export const useCompanyMaterial = (materialId?: string, versionId?: string) => useQuery({
  queryKey: companyKnowledgeKeys.material(materialId ?? '', versionId ?? ''),
  queryFn: () => companyKnowledgeApi.getMaterial(materialId!, versionId!),
  enabled: Boolean(materialId && versionId),
  retry: false,
})
