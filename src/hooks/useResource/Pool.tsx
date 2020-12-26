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

type CacheId = string | number

const requestCache: { [key: string]: { [key: string]: any } } = {}
const withCache = <CacheId, O>(
  scope: string,
  factory: Factory<CacheId[], O[]>
) => (input: CacheId[]): O[] => {
  const id = JSON.stringify(input)
  let scopeCache = requestCache[scope]
  if (!scopeCache) {
    requestCache[scope] = {}
    scopeCache = requestCache[scope]
  }
  if (scopeCache[id]) {
    return scopeCache[id]
  }
  scopeCache[id] = factory(input)
  return scopeCache[id]
}

export const useResourcePool = <O,>(
  scope: string,
  factory: Factory<CacheId[], O[]>,
  input: CacheId[],
  initialValue: O
): ResourceType<CacheId[], O[]> => {
  const pool = useContext(PoolCtx)
  const map = pool.get<O>(scope)

  const resource = useResource<CacheId[], O[]>(
    async (_input) => {
      if (!_input.length) {
        return []
      }
      const residue = _input.filter((id) => !map.has(id))
      const response =
        residue.length > 0 ? await withCache(scope, factory)(residue) : []
      response.forEach((item, index) => map.set(residue[index], item))
      return _input.map((id) => map.get(id) || initialValue)
    },
    input,
    input.map(() => initialValue)
  )

  return resource
}

export default ResourcePool
