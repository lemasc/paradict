import { Fragment, useEffect, useState } from 'react'
import { SearchAPIRequest, SearchAPIResult, WordsRequest } from '../types/dict'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon, SearchIcon, XIcon } from '@heroicons/react/solid'
import { default as _axios } from 'axios'
import { ConcurrencyManager } from '../shared/axios-concurrency'

import AutoCompleteInput from './input/autocomplete'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'

const axios = _axios.create({})

const MAX_CONCURRENT_REQUESTS = 5
ConcurrencyManager(axios, MAX_CONCURRENT_REQUESTS)

type Props = WordsRequest & { index: number }

function SearchEditForm({ index, ...word }: Props) {
  const router = useRouter()
  const { control, handleSubmit } = useForm<SearchAPIRequest>()
  const onSubmit = (data: SearchAPIRequest) => {
    const search = Array.isArray(router.query.search) ? router.query.search : [router.query.search]
    search[index] = data.words[0].search
    const url = new URLSearchParams()
    search.map((word) => url.append('search', word))
    router.replace('/?' + url.toString(), undefined, {
      shallow: true,
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

function SearchRemoveButton({ index, children }: Props & { children: React.ReactNode }) {
  const router = useRouter()
  const onClick = () => {
    const search = Array.isArray(router.query.search) ? router.query.search : [router.query.search]
    search.splice(index, 1)
    if (search.length === 0) {
      router.replace('/', undefined, {
        shallow: true,
      })
      return
    }
    const url = new URLSearchParams()
    search.map((word) => url.append('search', word))
    router.replace('/?' + url.toString(), undefined, {
      shallow: true,
    })
  }
  return (
    <button onClick={onClick} className="text-red-900 underline">
      {children}
    </button>
  )
}

function SearchResult(word: Props) {
  const [data, setData] = useState<SearchAPIResult | undefined>()

  const [success, setSuccess] = useState<boolean | undefined>()

  useEffect(() => {
    let loading = false
    if (success !== undefined) return
    ;(async () => {
      if (loading) return
      try {
        loading = true
        setData((await axios.get<SearchAPIResult>('/api/dict?search=' + word.search)).data)
        setSuccess(true)
      } catch (err) {
        setSuccess(false)
        console.error(err)
      } finally {
        loading = false
      }
    })()
  }, [word, success])

  useEffect(() => {
    if (data && data.word !== word.search) {
      setData(undefined)
      setSuccess(undefined)
    }
  }, [data, word.search])

  const baseClasses = {
    wrapper:
      'flex items-center space-x-4 w-full px-4 py-2 text-sm font-medium text-left rounded-lg focus:outline-none focus-visible:ring',
  }

  const WordTitle = () => (
    <h4 className="text-lg flex-grow head-font">
      {word.index + 1}. {word.search}
    </h4>
  )

  const onUpdate = () => {}
  if (success === undefined)
    return (
      <div
        className={[
          baseClasses.wrapper,
          'text-blue-900 bg-blue-100 focus-visible:ring-blue-500',
        ].join(' ')}
      >
        <WordTitle />
        <span>Loading...</span>
      </div>
    )
  return (
    <div className={`${success ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button as={Fragment}>
              <button
                className={[
                  baseClasses.wrapper,
                  success
                    ? 'text-green-900 bg-green-100 hover:bg-green-200 focus-visible:ring-green-500'
                    : 'text-red-900 bg-red-100 hover:bg-red-200 focus-visible:ring-red-500',
                ].join(' ')}
              >
                <WordTitle />
                <span>{success ? 'Success' : 'Failed'}</span>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5 ${
                    success ? 'text-green-500' : 'text-red-500'
                  }`}
                />
              </button>
            </Disclosure.Button>
            <Disclosure.Panel className="p-4 text-gray-800 content-font">
              {data ? (
                <div className="flex flex-col gap-2">
                  {data.data.map((d) => (
                    <Fragment key={d.dict}>
                      <span className="font-medium text-green-800">Definitions from {d.dict}</span>
                      <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        {d.results.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-red-800 flex flex-col gap-2">
                  <span>
                    We couldn&apos;t find any results. Edit or{' '}
                    <SearchRemoveButton {...word}>remove</SearchRemoveButton> this search.
                  </span>
                  <SearchEditForm {...word} />
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
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
  const ClearButton = () => (
    <div className="flex flex-col items-center justify-center">
      <button onClick={onGoBack} className="btn inline text-sm bg-gray-200 hover:bg-gray-300">
        <XIcon className="inline -mt-1 mr-2 h-4 w-4" />
        Clear Search Results
      </button>
    </div>
  )
  return (
    <>
      <h2 className="text-center font-medium">Search Results</h2>
      <ClearButton />
      <div className="w-full space-y-6">
        {data.words?.map((word, i) => (
          <SearchResult index={i} key={word.search} {...word} />
        ))}
      </div>
      <ClearButton />
    </>
  )
}
