import { useCallback } from 'react'
import { SearchAPIRequest } from '../../types/dict'
import { PencilIcon, XIcon } from '@heroicons/react/solid'

import { useRouter } from 'next/router'
import { shallowReplace, toggleEditQuery } from '../../shared/search-query'
import { SearchResult } from './result'

type SearchOutputProps = {
  data: SearchAPIRequest
  onGoBack: () => void
}

const Buttons = ({ onGoBack }: Pick<SearchOutputProps, 'onGoBack'>) => {
  const router = useRouter()
  const onEdit = useCallback(() => {
    shallowReplace(router, toggleEditQuery(router.query))
  }, [router])

  return (
    <div className="flex flex-row gap-4 items-center justify-center">
      <button onClick={onGoBack} className="btn inline text-sm bg-gray-200 hover:bg-gray-300">
        <XIcon className="inline -mt-1 mr-2 h-4 w-4" />
        Clear<span className="hidden sm:inline md:ml-1">Search Results</span>
      </button>

      <button
        onClick={onEdit}
        className="btn inline text-sm bg-blue-200 hover:bg-blue-300 text-blue-800"
      >
        <PencilIcon className="inline -mt-1 mr-2 h-4 w-4" />
        Edit<span className="hidden sm:inline md:ml-1">Search Results</span>
      </button>
    </div>
  )
}

export default function SearchOutput({
  data,
  onGoBack,
}: {
  data: SearchAPIRequest
  onGoBack: () => void
}) {
  return (
    <>
      <h2 className="text-center font-medium">Search Results</h2>
      <Buttons onGoBack={onGoBack} />
      <div className="w-full space-y-6">
        {data.words?.map((word, i) => (
          <SearchResult index={i} key={word.search} {...word} />
        ))}
      </div>
      <Buttons onGoBack={onGoBack} />
    </>
  )
}
