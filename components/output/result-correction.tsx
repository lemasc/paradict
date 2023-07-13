import { useRouter } from 'next/router'
import { SearchIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'

import { normalizeQueryArray, SEARCH_QUERY_KEY, shallowReplace } from '../../shared/search-query'
import AutoCompleteInput from '../input/autocomplete'
import { SearchAPIRequest } from '../../types/dict'
import { SearchResultProps } from './types'

function SearchEditForm({ index, ...word }: SearchResultProps) {
  const router = useRouter()
  const { control, handleSubmit } = useForm<SearchAPIRequest>({
    defaultValues: {
      words: [{ search: '' }],
    },
  })
  const onSubmit = (data: SearchAPIRequest) => {
    const search = normalizeQueryArray(router.query?.[SEARCH_QUERY_KEY])
    search[index] = data.words[0].search
    shallowReplace(router, {
      [SEARCH_QUERY_KEY]: search,
    })
  }
  return (
    <form className="flex flex-row gap-2 flex-wrap items-start" onSubmit={handleSubmit(onSubmit)}>
      <AutoCompleteInput
        controller={{
          name: `words.0.search`,
          control: control,
          rules: { required: true },
        }}
        type="text"
        autoComplete="off"
        placeholder={word.search}
        className="w-full border border-gray-300 rounded-md focus:outline-1 focus:outline-red-500 focus:ring-1 px-3 py-2"
      />

      <button className="inline mt-1 btn bg-red-500 hover:bg-red-600 text-white">
        <SearchIcon className="inline -mt-1 mr-2 h-4 w-4" />
        Search
      </button>
    </form>
  )
}

function SearchRemoveButton({
  index,
  children,
}: SearchResultProps & { children: React.ReactNode }) {
  const router = useRouter()
  const onClick = () => {
    const search = normalizeQueryArray(router.query?.[SEARCH_QUERY_KEY])
    search.splice(index, 1)
    if (search.length === 0) {
      shallowReplace(router, null)
      return
    }
    shallowReplace(router, {
      [SEARCH_QUERY_KEY]: search,
    })
  }
  return (
    <button onClick={onClick} className="text-red-900 underline">
      {children}
    </button>
  )
}

export function SearchResultCorrection(word: SearchResultProps) {
  return (
    <div className="text-red-800 flex flex-col gap-2">
      <span>
        We couldn&apos;t find any results. Edit or{' '}
        <SearchRemoveButton {...word}>remove</SearchRemoveButton> this search.
      </span>
      <SearchEditForm {...word} />
    </div>
  )
}
