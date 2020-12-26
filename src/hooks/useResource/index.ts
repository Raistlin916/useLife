import { Reducer, useReducer, useEffect, useCallback } from 'react'

enum Status {
  PENDING,
  LOADING,
  LOADED,
}

export interface ResourceType<I = any, O = any> {
  data: O
  sync: (data?: Partial<I> | I) => Promise<O>
  loading: boolean
  loaded: boolean
  id: string | undefined
  isEmpty: () => boolean
}

type useEmptyResourceType<T = void> = (data: T) => ResourceType<void, T>

export const useEmptyResource: useEmptyResourceType = <T>(data: T) => ({
  data,
  sync: () => Promise.resolve(),
  loading: false,
  loaded: false,
  id: undefined,
  isEmpty: () => true,
})

interface ResourceState<T> {
  result: T
  status: Status
}

type Action<T> = { type: 'set'; payload: Partial<ResourceState<T>> } | { type: 'reset' }

export interface Factory<I, O> {
  (input: I): O | Promise<O>
  id?: string
}

const reducer = <T>(state: ResourceState<T>, action: Action<T>) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }
    case 'reset':
      return { ...state, status: Status.PENDING }
    default:
      throw new Error()
  }
}

export const useResource = <I, O>(
  factory: Factory<I, O>,
  input: I,
  initialValue?: O,
  autoSync?: boolean
): ResourceType<I, O> => {
  const [data, dispatch] = useReducer<Reducer<ResourceState<O>, Action<O>>>(reducer, {
    result: initialValue as O,
    status: Status.PENDING,
  })
  const id = `${factory.id}:${input === undefined ? undefined : JSON.stringify(input)}`
  const sync = useCallback(
    async (data?: Partial<I> | I) => {
      try {
        dispatch({
          type: 'set',
          payload: {
            status: Status.LOADING,
          },
        })
        const result = await factory({ ...input, ...data })
        dispatch({
          type: 'set',
          payload: {
            result,
            status: Status.LOADED,
          },
        })
        return result
      } catch (e) {
        dispatch({
          type: 'reset',
        })
        throw e
      }
    },
    [id]
  )

  useEffect(() => {
    if (autoSync === false) {
      return
    }
    if (input !== undefined) {
      sync()
    }
  }, [id, autoSync])

  return {
    data: data.result,
    sync,
    loading: data.status === Status.LOADING,
    loaded: data.status === Status.LOADED,
    id,
    isEmpty: () => !id,
  }
}
