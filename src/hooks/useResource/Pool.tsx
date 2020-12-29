import React, { useContext, useState, ReactNode } from 'react'
import { useResource, Factory, ResourceType } from '.'

interface PoolType {
  get: <O>(v: string) => Map<CacheId, O>
}

type cacheType = { [key: string]: Map<CacheId, any> }

const cache: cacheType = {}
const defaultPool = {
  get: (scope: string) => {
    if (!cache[scope]) {
      cache[scope] = new Map()
    }
    return cache[scope]
  },
}

const PoolCtx = React.createContext<PoolType>(defaultPool)

const ResourcePool = ({ children }: { children: ReactNode }) => {
  const [pool] = useState(defaultPool)
  return <PoolCtx.Provider value={pool}>{children}</PoolCtx.Provider>
}

type CacheId = string

export const useResourcePool = <O,>(
  scope: string,
  factory: Factory<CacheId[], O[]>,
  input: CacheId[],
  initialValue: O
): ResourceType<CacheId[], O[]> => {
  const pool = useContext(PoolCtx)
  const map = pool.get<O>(scope)

  const residue: CacheId[] = []
  const result = input.map((id) => {
    if (map.has(id)) {
      return map.get(id) as O
    }
    residue.push(id)
    return initialValue
  })
  const resource = useResource<CacheId[], O[]>(
    async (_input) => {
      if (!_input.length) {
        return []
      }
      const data = await factory(_input)
      data.forEach((item, index) => map.set(_input[index], item))
      return data
    },
    residue,
    residue.map(() => initialValue)
  )

  return {
    ...resource,
    data: result,
  }
}

type StringMap<T> = { [key: string]: T }

export const useResourcePoolMap = <I, O>(
  scope: string,
  factory: Factory<I, StringMap<O>>,
  params: I,
  initialValue: Map<CacheId, O> = new Map()
): ResourceType<I, Map<CacheId, O>> => {
  const pool = useContext(PoolCtx)

  const resource = useResource<I, Map<CacheId, O>>(
    async (_params) => {
      const hash = JSON.stringify(params)
      const map = pool.get<O>(`${scope}#${hash}`)
      const data = await factory(_params)
      Object.keys(data).forEach((k) => map.set(k, data[k]))
      return map
    },
    params,
    initialValue
  )

  return resource
}

export const useResourceConst = <I, O>(
  scope: string,
  factory: Factory<I, O>,
  params: I,
  initialValue: O
): ResourceType<I, O> => {
  const pool = useContext(PoolCtx)
  const resource = useResource<I, O>(
    async (_params) => {
      const hash = `${scope}#${JSON.stringify(params)}`
      const map = pool.get<O>('const')
      let data = map.get(hash)
      if (data === undefined) {
        data = await factory(_params)
      }
      map.set(hash, data)
      return data
    },
    params,
    initialValue
  )
  return resource
}

export default ResourcePool
