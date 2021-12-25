import { NextApiHandler } from 'next'
import { JSDOM } from 'jsdom'
import axios from 'axios'
import { Dictionary, SearchAPIResult } from '../../types/dict'

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
const getNameFromResultTable = (table: HTMLTableElement, documentChildren: Element[]) => {
  return documentChildren[documentChildren.indexOf(table) - 1].innerHTML
}

const isAllowedLanguage = (d: string[]) => {
  const english = /([a-zA-Z])\w+/g
  const thai = /([ก-๏])+/g
  // Adding EN-TH dictionary will result in too large payload.
  // Uncomment the condition if you know what you are doing!
  return (
    english.test(d[0]) && thai.test(d[1]) //|| (english.test(d.meaning) && thai.test(d.word))
  )
}

const processTable = (table: HTMLTableElement, baseWord: string) => {
  return Array.from(table.rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.textContent))
    .filter((d) => baseWord === d[0] && isAllowedLanguage(d))
}

const handler: NextApiHandler<SearchAPIResult> = async (req, res) => {
  if (!req.query.search || req.method !== 'GET') return res.status(400).end()
  const search = req.query.search as string
  const { data } = await axios.get('/mobile.php', {
    baseURL: 'https://dict.longdo.com',
    params: {
      search,
    },
  })
  const dom = new JSDOM(data.replace(/\t/g, '').replace(/ {2}/g, ' '))
  const document = (dom.window as unknown as Window).document.body
  const docChildren = Array.from(document.children)
  const resultTables: HTMLTableElement[] = Array.from(document.querySelectorAll('.result-table'))
  const results: Dictionary[] = resultTables
    .map((elem) => {
      const dict = getNameFromResultTable(elem, docChildren)
      const results = processTable(elem, search)
      if (results.length === 0) return null
      return {
        dict,
        results: dict.includes('Hope') ? processHopeDict(results[0][1]) : results.map((d) => d[1]),
      }
    })
    .filter((r) => r !== null)

  res.setHeader('cache-control', 'public, max-age=300, stale-while-revalidate=600')
  res.status(results.length === 0 ? 404 : 200).send({
    word: search,
    data: results,
  })
}

export default handler
