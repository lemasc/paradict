import { Fragment, useEffect, useState } from 'react'
import { SearchAPIResult } from '../../types/dict'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { default as _axios } from 'axios'
import { ConcurrencyManager } from '../../shared/axios-concurrency'

import { SearchResultProps } from './types'
import { SearchResultCorrection } from './result-correction'

const axios = _axios.create({})

const MAX_CONCURRENT_REQUESTS = 5
ConcurrencyManager(axios, MAX_CONCURRENT_REQUESTS)

export function SearchResult(word: SearchResultProps) {
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
              {!data ? (
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
                <SearchResultCorrection {...word} />
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
