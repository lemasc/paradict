export type WordsRequest = {
  search: string
}

export type SearchAPIRequest = {
  words: WordsRequest[]
}

export type Word = string

export type Dictionary = {
  dict: string
  results: Word[]
}

export type SearchAPIResult = {
  word: string
  data: Dictionary[]
}
