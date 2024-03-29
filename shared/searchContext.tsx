import { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import { SelectOption } from '../types/select'

interface ISearchContext {
  preload: (key: string) => Promise<SelectOption[]>
  results: Map<string, SelectOption[]>
}

const searchContext = createContext<ISearchContext | undefined>(undefined)

export const useSearch = (): ISearchContext => {
  const ctx = useContext(searchContext)
  if (!ctx) throw new Error('ISearchContext: No context.')
  return ctx
}

/**
 * Remove duplicate values (words) from the cached select results.
 * If we didn't remove, React keys might be duplicated and cause unexpected bug.
 */
const removeDuplicateWords = (data: SelectOption[]): SelectOption[] => {
  const results = new Map<string, string>()
  data.map((d) => results.set(d.value, d.label))
  return Array.from(results.entries()).map((d) => ({
    label: d[1],
    value: d[0],
  }))
}

function useProvideSearch(): ISearchContext {
  const [results, setResults] = useState<Map<string, SelectOption[]>>(new Map())
  const preload = async (key: string) => {
    if (results.has(key)) return
    // We provide the cached results from recent words for faster performance.
    const existingResults = removeDuplicateWords(
      Array.from(results.values())
        .map((d) => d.filter((s) => s.value.startsWith(key)))
        .flat()
    )
    if (existingResults.length > 0) {
      setResults((results) => {
        return new Map(results).set(key, existingResults)
      })
    }
    try {
      const { data } = await axios.get('/api/autocomplete?search=' + key)
      setResults((results) => {
        return new Map(results).set(key, data)
      })
      return data
    } catch (err) {
      console.error(err)
      //results.set(key, [])
      return []
    }
  }

  return {
    preload,
    results,
  }
}

export default function SearchContext({ children }: { children: JSX.Element }) {
  const search = useProvideSearch()
  return <searchContext.Provider value={search}>{children}</searchContext.Provider>
}
