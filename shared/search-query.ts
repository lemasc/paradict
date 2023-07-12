import { NextRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import { WordsRequest } from '../types/dict'

export const SEARCH_QUERY_KEY = 'q'
export const EDIT_QUERY_KEY = 'edit'

export const normalizeQueryArray = (query: string | string[]): string[] => {
  if (Array.isArray(query)) return query
  return [query]
}

export const shallowReplace = (router: NextRouter, targetQuery: ParsedUrlQuery | null) => {
  router.replace(
    {
      pathname: router.pathname,
      ...(targetQuery
        ? {
            query: targetQuery,
          }
        : {}),
    },
    undefined,
    {
      shallow: true,
    }
  )
}

export const isSearchView = (
  query: ParsedUrlQuery
): query is {
  [SEARCH_QUERY_KEY]: string[]
} => {
  if (query?.[EDIT_QUERY_KEY]) return false
  const searchQuery = query?.[SEARCH_QUERY_KEY]
  if (!searchQuery) return false
  return normalizeQueryArray(searchQuery).length > 0
}

export const shouldRefactorSearchQuery = (query: ParsedUrlQuery): ParsedUrlQuery | undefined => {
  const v1_searchQuery = query?.search
  if (!v1_searchQuery) return
  const filteredQuery: ParsedUrlQuery = {
    ...query,
    [SEARCH_QUERY_KEY]: normalizeQueryArray(v1_searchQuery),
  }
  if (filteredQuery.search) delete filteredQuery.search
  return filteredQuery
}

export const convertQueryToWordsRequest = (query: ParsedUrlQuery): WordsRequest[] => {
  const searchQuery = query?.[SEARCH_QUERY_KEY]
  if (!searchQuery) return []
  return normalizeQueryArray(searchQuery).map((w) => ({
    search: w,
  }))
}

export const convertWordsRequestToQuery = (wordsRequest: WordsRequest[]): ParsedUrlQuery => {
  return {
    [SEARCH_QUERY_KEY]: wordsRequest
      .filter((word) => word.search && typeof word.search === 'string')
      .map((word) => word.search),
  }
}

export const toggleEditQuery = (query: ParsedUrlQuery): ParsedUrlQuery => {
  const editQuery = query?.[EDIT_QUERY_KEY]
  if (editQuery) {
    const filteredQuery = { ...query }
    delete filteredQuery[EDIT_QUERY_KEY]
    return filteredQuery
  }
  return {
    ...query,
    [EDIT_QUERY_KEY]: 'true',
  }
}
