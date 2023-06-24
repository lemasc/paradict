import { NextRequest, NextResponse } from 'next/server'
import ky from 'ky'
import { SelectOption } from '../../types/select'

type RawResponse = {
  s: 'head'
  /** Formatted HTML word string */
  d: string
  /** Actual Word */
  w: string
  id: string
}

export const config = {
  runtime: 'edge',
}

const processLabel = (r: RawResponse) => {
  return r.d.replace(/(<FONT color=blue>)|(<\/FONT>)/g, '**').replace(/\*\*\*\*/g, '')
}
const handler = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams
  const search = params.get('search')
  if (
    typeof search !== 'string' ||
    // Only allow a search with more than 3 characters
    search.length < 3 ||
    req.method !== 'GET'
  )
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

  //https://search.longdo.com/BWTSearch/HeadSearch?json=1&ds=head&num=20&count=5&key=extra
  const data = await ky
    .get('BWTSearch/HeadSearch', {
      prefixUrl: 'https://search.longdo.com',
      searchParams: {
        json: '1',
        ds: 'head',
        num: '20',
        count: search.length,
        key: search,
      },
    })
    .text()
  const results: RawResponse[] = JSON.parse(
    data.slice(data.indexOf('['), data.lastIndexOf(']') + 1).replace(/\r?\n|\r/g, '')
  )

  const resultsMap = new Map<string, SelectOption>()
  results.forEach((r) => {
    const label = processLabel(r)
    resultsMap.set(label.toLowerCase(), {
      label: label.toLowerCase(),
      value: r.w.toLowerCase(),
    })
  })

  return NextResponse.json<SelectOption[]>(Array.from(resultsMap.values()), {
    status: 200,
    headers: {
      'cache-control': `public, max-age=${86400 / 2}, stale-while-revalidate=86400`,
    },
  })
}
export default handler
