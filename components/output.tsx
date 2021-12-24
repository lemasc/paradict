import Head from 'next/head'
import { Fragment, useEffect, useState } from 'react'
import SearchInput from '../components/input'
import { SearchAPIRequest, SearchAPIResult, WordsRequest } from '../types/dict'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon, XIcon } from '@heroicons/react/solid'
import axios from 'axios'

function SearchResult(word: WordsRequest) {
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
        console.log(err)
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

  if (success === undefined)
    return (
      <div className="flex items-center space-x-4 w-full px-4 py-2 text-sm font-medium text-left text-blue-900 bg-blue-100 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
        <h4 className="text-lg flex-grow head-font">{word.search}</h4>
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
                className={`flex items-center space-x-4 w-full px-4 py-2 text-sm font-medium text-left ${
                  success ? 'text-green-900 bg-green-100' : 'text-red-900 bg-red-100'
                } rounded-lg ${
                  success ? 'hover:bg-green-200' : 'hover:bg-red-200'
                } focus:outline-none focus-visible:ring ${
                  success ? 'focus-visible:ring-green-500' : 'focus-visible:ring-red-500'
                } focus-visible:ring-opacity-75`}
              >
                <h4 className="text-lg flex-grow head-font">{word.search}</h4>
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
                    <>
                      <span className="font-medium text-green-800">Defintions from {d.dict}</span>
                      <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        {d.results.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </>
                  ))}
                </div>
              ) : (
                <span className="text-red-800">We couldn&apos;t find any results.</span>
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
  return (
    <>
      <h2 className="text-center font-medium">Search Results</h2>
      <div className="flex flex-col items-center justify-center">
        <button onClick={onGoBack} className="btn inline text-sm bg-gray-200 hover:bg-gray-300">
          <XIcon className="inline -mt-1 mr-2 h-4 w-4" />
          Clear Search Results
        </button>
      </div>
      <div className="w-full space-y-6">
        {data.words?.map((word) => (
          <SearchResult key={word.search} {...word} />
        ))}
      </div>
    </>
  )
}
