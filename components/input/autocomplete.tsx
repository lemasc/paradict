import { Combobox, Transition } from '@headlessui/react'
import {
  FocusEventHandler,
  forwardRef,
  Fragment,
  HTMLProps,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ControllerProps, Controller, useWatch, UseControllerProps } from 'react-hook-form'
import { useSearch } from '../../shared/searchContext'
import { SearchAPIRequest, WordsRequest } from '../../types/dict'
import { Remark } from 'react-remark'

export function AutocompleteResults({
  control,
  name,
}: Pick<ControllerProps<SearchAPIRequest>, 'control' | 'name'>) {
  const timeout = useRef(undefined)
  const _isMounted = useRef(false)
  const { preload, results } = useSearch()
  const [lastWord, setLastWord] = useState<string | undefined>()
  const search = useWatch({
    control,
    name,
  }) as string
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(async () => {
      if (search.length >= 3) {
        await preload(search as string)
        setLastWord(search)
      }
    }, 200)
  }, [search, preload])
  const getResult = () => results.get(search) ?? results.get(lastWord)

  if (search && getResult() && getResult().length !== 0) {
    return (
      <div className="z-10 absolute w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-xl max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
        {getResult().map((d) => (
          <Combobox.Option
            key={d.value}
            className={({ active }) =>
              `${active ? 'text-blue-900 bg-blue-200' : 'text-gray-900'}
            cursor-default select-none relative py-4 sm:py-2 px-4 font-light`
            }
            value={d.value}
          >
            <Remark
              rehypeReactOptions={{
                components: {
                  p: ({ node, ...props }) => <span {...props} />,
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-blue-700" {...props} />
                  ),
                },
              }}
            >
              {d.label}
            </Remark>
          </Combobox.Option>
        ))}
      </div>
    )
  }
  return null
}

type Props = HTMLProps<HTMLInputElement> & {
  controller: UseControllerProps<SearchAPIRequest>
  canShow?: boolean
}

export default forwardRef<HTMLInputElement, Props>(function AutoCompleteInput(
  { controller, canShow = true, ...props },
  ref
) {
  return (
    <Controller
      {...controller}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-2 flex-grow">
          <Combobox value={value} onChange={onChange}>
            {({ open }) => (
              <div className="relative mt-1 flex-grow">
                <Combobox.Input
                  // @ts-expect-error
                  as={'input'}
                  value={value}
                  onChange={onChange}
                  // @ts-expect-error
                  ref={ref}
                  {...props}
                  //className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                />
                {open && canShow && (
                  <Combobox.Options static>
                    <AutocompleteResults control={controller.control} name={controller.name} />
                  </Combobox.Options>
                )}
              </div>
            )}
          </Combobox>
          {error && <span className="text-sm font-medium text-red-800">โปรดกรอกช่องนี้</span>}
        </div>
      )}
    />
  )
})
