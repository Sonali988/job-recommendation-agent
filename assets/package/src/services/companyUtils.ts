import type { JobOpportunity } from '../types/case'

const GENERIC_ORG_PATTERNS = [
  /^corporate\s*bank/i,
  /^back\s*office$/i,
  /^corporate\s*company$/i,
  /^employer$/i,
  /^banking\s*career\s*management\s*service$/i,
  /^hr\s/i,
  /^recruiter$/i,
]

const BRAND_COLORS: Record<string, string> = {
  google: '#4285F4',
  microsoft: '#00A4EF',
  amazon: '#FF9900',
  zomato: '#E23744',
  paytm: '#00BAF2',
  flipkart: '#2874F0',
  swiggy: '#FC8019',
  tcs: '#001F8B',
  infosys: '#007CC3',
  wipro: '#341C53',
  ola: '#1FAB24',
  phonepe: '#5F259F',
  razorpay: '#072654',
  freshworks: '#7B68EE',
  digitalindiacorporation: '#1B4F8A',
  digitalindia: '#1B4F8A',
  nationalinformaticscentre: '#2E5090',
}

const COLOR_PALETTE = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0d9488',
  '#2563eb',
  '#ea580c',
  '#9333ea',
  '#16a34a',
]

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function isGenericOrg(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 3) return true
  return GENERIC_ORG_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function extractOnBehalf(name: string): string | null {
  const match = name.match(/on behalf of\s+(.+?)(?:\)|$)/i)
  return match?.[1]?.trim() || null
}

function extractTitleHint(title: string): string | null {
  const cleaned = title
    .replace(/\b(call|contact|hr|whatsapp|urgent|hiring|apply now)\b/gi, ' ')
    .replace(/\d{5,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const withMatch = cleaned.match(/\bwith\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/)
  if (withMatch?.[1]) return titleCase(withMatch[1].trim())

  const atMatch = cleaned.match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/)
  if (atMatch?.[1]) return titleCase(atMatch[1].trim())

  return null
}

function buildDistinctLabel(base: string, opp: JobOpportunity): string {
  const suffix =
    opp.functionalArea?.trim() ||
    opp.functionalState?.trim() ||
    opp.jobLocations[0]?.trim() ||
    extractTitleHint(opp.jobTitle) ||
    `Role #${opp.id % 1000}`

  return `${titleCase(base)} — ${titleCase(suffix)}`
}

export function resolveCompanyName(opp: JobOpportunity): string {
  const raw = opp.organizationName?.trim() || ''
  const onBehalf = raw ? extractOnBehalf(raw) : null
  let name = onBehalf || raw || 'Employer'

  if (isGenericOrg(name)) {
    const titleHint = extractTitleHint(opp.jobTitle)
    if (titleHint) return titleHint
    if (raw) return buildDistinctLabel(raw, opp)
    return buildDistinctLabel('Hiring Partner', opp)
  }

  return titleCase(name)
}

export function companyLogoKey(name: string): string {
  return normalizeKey(name).slice(0, 16)
}

export function companyColor(name: string): string {
  const key = companyLogoKey(name)
  if (BRAND_COLORS[key]) return BRAND_COLORS[key]
  return COLOR_PALETTE[hashString(key) % COLOR_PALETTE.length]
}

export function companyInitial(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase() || '?'
}
