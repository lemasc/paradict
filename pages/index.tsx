import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SearchInput from '../components/input'
import SearchOutput from '../components/output'
import { WordsRequest } from '../types/dict'

export default function Home() {
  const router = useRouter()
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (router.query?.search) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [router.query])

  const convertToWordsRequest = (): WordsRequest[] => {
    let search = router.query?.search
    if (!search) return
    if (!Array.isArray(search)) search = [search]
    return search.map((w) => ({
      search: w,
    }))
  }
  return (
    <div className="py-8 px-4 lg:px-6 flex flex-col gap-2 min-h-screen h-full justify-center items-center">
      <Head>
        <title>{showResults ? 'Search Results : ' : ''} ParaDict</title>
      </Head>
      <header className="head-font flex flex-col gap-4 items-center p-4 border-b border-gray-200">
        <h1 className="font-bold text-5xl text-blue-700">ParaDict</h1>
        <span className="text-gray-800 text-center">
          Simple tool to help you search multiple words meaning with ease.
        </span>
      </header>
      <main className="flex flex-col gap-4 p-4 max-w-2xl w-full">
        {!showResults ? (
          <SearchInput
            onSubmit={(results) => {
              const url = new URLSearchParams()
              results.words.map((word) => url.append('search', word.search))
              router.replace('/?' + url.toString(), undefined, {
                shallow: true,
              })
            }}
          />
        ) : (
          <SearchOutput
            data={{
              words: convertToWordsRequest(),
            }}
            onGoBack={() => router.replace('/', undefined, { shallow: true })}
          />
        )}
      </main>

      <footer className="head-font text-sm py-2 text-center text-gray-600">
        <p className="pb-4">
          Copyright &copy; 2021
          {new Date().getFullYear() !== 2021 && `- ${new Date().getFullYear()}`} Lemasc Service Co.,
          ltd
          <br />
          This website was made for educational purposes only.
        </p>
        <span className="py-2">
          Powered by{' '}
          <a
            href="https://dict.longdo.com"
            rel="noreferrer noopener"
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Longdo Dictionary
          </a>
        </span>
      </footer>
    </div>
  )
}