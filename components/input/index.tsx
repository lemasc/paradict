import { MinusIcon, PlusIcon, SearchIcon, TrashIcon } from '@heroicons/react/solid'
import { useFieldArray, useForm } from 'react-hook-form'
import { SearchAPIRequest } from '../../types/dict'
import { useBeforeunload } from 'react-beforeunload'
import axios from 'axios'
import AutoCompleteInput from './autocomplete'

export default function SearchInput({
  onSubmit: _onSubmit,
}: {
  onSubmit: (data: SearchAPIRequest) => void
}) {
  const defaultValues = {
    words: [{ search: '' }],
  }
  const { register, control, handleSubmit, reset, watch } = useForm<SearchAPIRequest>({
    defaultValues,
  })
  const wordsWatch = watch('words')
  const {
    fields,
    remove: _remove,
    insert,
  } = useFieldArray({
    control,
    name: 'words',
  })
  const onSubmit = async (data: SearchAPIRequest) => {
    const words = data.words.filter((d) => d.search.trim() !== '')
    if (words.length > 0) {
      _onSubmit({
        words,
      })
    }
  }

  const add = (index) =>
    insert(index + 1, {
      search: '',
    })

  const remove = (index) => {
    if (
      wordsWatch[index].search !== '' &&
      !confirm('This field contains value. Are you sure to remove?')
    )
      return
    _remove(index)
  }

  const touchedFields = wordsWatch.filter((w) => w.search !== '')
  const clear = () => {
    if (
      touchedFields.length !== 0 &&
      !confirm('Your current list contains data. Are you sure to clear all fields?')
    )
      return
    reset(defaultValues)
  }

  useBeforeunload((e) => touchedFields.length !== 0 && e.preventDefault())

  return (
    <>
      <span className="text-center">
        Enter your words to search here. Press Enter or Return key to add a new field.
      </span>
      <ul className="w-full py-2 space-y-4">
        {fields.map((item, index) => {
          return (
            <li key={item.id} className="flex gap-4 items-center">
              <span className="font-bold" style={{ minWidth: '1.75rem' }}>
                #{index + 1}
              </span>
              <AutoCompleteInput
                controller={{
                  name: `words.${index}.search`,
                  control,
                }}
                type="text"
                autoComplete="off"
                placeholder="Enter your word..."
                onKeyDown={(e) => {
                  // keyCode is deprecated.
                  // Although their docs recommended using code instead, it returns undefined on Chrome Android.
                  // 13 = Enter
                  if (e.keyCode === 13) {
                    e.preventDefault()
                    add(index)
                  }
                }}
                className="w-full border border-gray-300 rounded-md focus:outline-1 focus:outline-blue-500 focus:ring-1 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <button
                  className="rounded p-2 bg-green-500 text-white"
                  type="button"
                  title="Add a new word"
                  onClick={() => add(index)}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
                {index !== 0 && (
                  <button
                    className="rounded p-2 bg-red-500 text-white"
                    type="button"
                    title="Remove the current word"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <span className="xs:hidden text-center text-blue-500">
        Swipe left-right to see available input options.
      </span>
      <button
        onClick={handleSubmit(onSubmit)}
        className="inline btn bg-blue-500 hover:bg-blue-600 text-white"
      >
        <SearchIcon className="inline -mt-1 mr-2 h-4 w-4" />
        Search
      </button>

      <button
        type="button"
        onClick={() => clear()}
        className="btn bg-red-500 hover:bg-red-600 text-white"
      >
        <TrashIcon className="inline -mt-1 mr-3 h-4 w-4" />
        Clear All
      </button>
    </>
  )
}
