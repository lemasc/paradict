import { NextRequest, NextResponse } from 'next/server'
import { parseHTML } from 'linkedom/worker'
import ky from 'ky'
import { Dictionary, SearchAPIResult } from '../../types/dict'

export const config = {
  runtime: 'edge',
}

/**
 * Hope Dictionary returns a very long definition string.
 * Seperate and format it ourselves.
 */
const processHopeDict = (definition: string): string[] => {
  const partOfSpeech = /([a-z])\.+/
  return definition.split(' ').reduce((data, define) => {
    if (partOfSpeech.test(define)) {
      data.push(`(${define})`)
    } else if (data.length !== 0) {
      data[data.length - 1] = data[data.length - 1] + ' ' + define
    }
    return data
  }, [])
}

const isAllowedLanguage = (d: string[]) => {
  const english = /([a-zA-Z])+/g
  const thai = /([ก-๏])+/g
  // Adding EN-TH dictionary will result in too large payload.
  // Uncomment the condition if you know what you are doing!
  return (
    english.test(d[0]) && thai.test(d[1]) //|| (english.test(d.meaning) && thai.test(d.word))
  )
}

/**
 * Process each defintion by removing `See also:` and `Syn.` records.
 * @param define The definition string
 */
const processDefinition = (define: string) => {
  for (let _kw of ['See also:', 'Syn.']) {
    // Add seperator
    const kw = `, ${_kw}`
    if (define.indexOf(kw) !== -1) return define.slice(0, define.indexOf(kw)).trim()
  }
  return define.trim()
}
const processTable = (table: HTMLTableElement, baseWord: string) => {
  const rows = table.querySelectorAll('tr')
  return Array.from(rows)
    .map((row) => {
      const cells = row.querySelectorAll('td')
      return Array.from(cells).map((cell, i) =>
        i === 1 ? processDefinition(cell.textContent) : cell.textContent
      )
    })
    .filter((d) => baseWord.toLowerCase() === d[0].toLowerCase() && isAllowedLanguage(d))
}

const isHTMLTable = (elem: Element): elem is HTMLTableElement => {
  return elem.tagName === 'TABLE'
}

const handler = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search')
  if (typeof search !== 'string' || req.method !== 'GET')
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const data = await ky
    .get('mobile.php', {
      prefixUrl: 'https://dict.longdo.com',
      searchParams: {
        search,
      },
    })
    .text()
  const { document } = parseHTML(data.replace(/\t/g, '').replace(/ {2}/g, ' '))
  const children = document.querySelectorAll('body > *')
  const dictResults: Dictionary[] = []
  for (var i = 0; i < children.length; i++) {
    const elem = children[i]
    if (isHTMLTable(elem) && elem.classList.contains('result-table')) {
      const dict = children[i - 1].textContent
      const results = processTable(elem, search)
      if (results.length === 0) continue
      dictResults.push({
        dict,
        results: dict.includes('Hope') ? processHopeDict(results[0][1]) : results.map((d) => d[1]),
      })
    }
  }

  return NextResponse.json<SearchAPIResult>(
    {
      word: search,
      data: dictResults,
    },
    {
      status: dictResults.length === 0 ? 404 : 200,
      headers: {
        'cache-control': `public, max-age=${86400 / 2}, stale-while-revalidate=86400`,
      },
    }
  )
}

export default handler
