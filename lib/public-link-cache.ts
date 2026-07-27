import { revalidatePath, revalidateTag } from 'next/cache'

export const PUBLIC_LINK_CACHE_TAG = 'public-link-data-v2'
export const PUBLIC_LINK_CACHE_SECONDS = 60 * 60

export function invalidatePublicLinkCache(
  ...slugs: Array<string | null | undefined>
) {
  revalidateTag(PUBLIC_LINK_CACHE_TAG)

  for (const slug of new Set(slugs.filter((value): value is string => Boolean(value)))) {
    revalidatePath(`/${encodeURIComponent(slug)}`, 'page')
  }
}
