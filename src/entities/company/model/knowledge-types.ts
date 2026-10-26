export interface KnowledgeSourceRef {
  materialId: string
  versionId: string
}

export interface CompanyKnowledge {
  companyId: string
  revisionId: string
  name: string
  description: string
  industryCodes: string[]
  exposures: string[]
  knownAt: string
  sourceRefs: (KnowledgeSourceRef & { contentHash: string })[]
}

export interface PutCompanyKnowledge {
  description: string
  industryCodes: string[]
  exposures: string[]
  sourceRefs: KnowledgeSourceRef[]
}

export interface MaterialProvenance {
  acquisition: string
  sourceUrl: string | null
  retrievedAt: string
  textCompleteness: string
  originVersionId: string | null
  locator: string | null
}

export interface CompanyMaterialMetadata {
  materialId: string
  versionId: string
  sourceId: string
  kind: string
  title: string
  knownAt: string
  publishedAt: string | null
  correctsVersionId: string | null
  contentHash: string
  textCompleteness: string
  provenance: MaterialProvenance | null
  latestVersionCount: number
}

export interface CompanyMaterialsPage {
  companyId: string
  asOf: string
  items: CompanyMaterialMetadata[]
  nextCursor: string | null
  coverage: string
}

export interface CompanyMaterial extends Omit<CompanyMaterialMetadata, 'latestVersionCount'> {
  text: string
}

export interface CreateCompanyMaterial {
  title: string
  text: string
}
