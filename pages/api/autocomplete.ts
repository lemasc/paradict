import { NextApiHandler } from 'next'
import axios from 'axios'
import { SelectOption } from '../../types/select'

type RawResponse = {
  s: 'head'
  /** Formatted HTML word string */
  d: string
  /** Actual Word */
  w: string
  id: string
}

const processLabel = (r: RawResponse) => {
  return r.d.replace(/(<FONT color=blue>)|(<\/FONT>)/g, '**').replace(/\*\*\*\*/g, '')
}
const handler: NextApiHandler<SelectOption[]> = async (req, res) => {
  if (!req.query.search || req.method !== 'GET') return res.status(400).end()

  const search = req.query.search as string
  if (search.length < 3) return res.status(400).end()
  //https://search.longdo.com/BWTSearch/HeadSearch?json=1&ds=head&num=20&count=5&key=extra
  const { data } = await axios.get<string>('/BWTSearch/HeadSearch', {
    baseURL: 'https://search.longdo.com',
    params: {
      json: '1',
      ds: 'head',
      num: '20',
      count: search.length,
      key: search,
    },
  })
  const results: RawResponse[] = JSON.parse(
    data.slice(data.indexOf('['), data.lastIndexOf(']') + 1).replace(/\r?\n|\r/g, '')
  )
  res.setHeader('cache-control', `public, max-age=${86400 / 2}, stale-while-revalidate=86400`)
  res.status(200).send(
    results.map((r) => ({
      label: processLabel(r),
      value: r.w,
    }))
  )
}
export default handler
