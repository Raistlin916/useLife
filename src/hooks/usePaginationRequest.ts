import { useState, useEffect } from 'react'
import useRequest, {
  HttpMethod,
  UseRequestOptions,
  defaultOptions as useRequestDefaultOptions,
} from './useRequest'
import { ResourceType } from './useResource'

interface PaginationProps {}

interface PaginationData<T> {
  list: T[]
  [key: string]: any
}

export interface ResourceWithPagination<I = any, O = any>
  extends ResourceType<I, O> {
  pagination: PaginationProps
  setFilters: (v: object) => void
}

export interface UsePaginationRequest {
  <I, O = any>(
    url: string,
    params?: I,
    initOutput?: PaginationData<O>,
    opt?: Partial<UsePaginationRequestOptions>
  ): ResourceWithPagination<I, PaginationData<O>>
}

export interface UsePaginationRequestOptions extends UseRequestOptions {
  method: HttpMethod
  pageSize: number
  pageNumberName: string
  totalName: string
}

const defaultOptions: UsePaginationRequestOptions = {
  ...useRequestDefaultOptions,
  method: 'post',
  pageSize: 10,
  pageNumberName: 'pageNo',
  totalName: 'count',
}

let configuredOptions: UsePaginationRequestOptions = defaultOptions

type UsePagination = ({
  value,
  onChange,
  total,
  options,
}: {
  value: number
  onChange: (v: number) => void
  total: number
  options: UsePaginationRequestOptions
}) => PaginationProps

const usePagination: UsePagination = ({
  value: pageNumber,
  onChange,
  total,
  options,
}) => {
  const { pageSize } = options
  return {
    onChange,
    current: pageNumber,
    pageSize,
    total,
    showQuickJumper: true,
    showTotal: (t: number) => `共${t}条`,
  }
}

type PaginationParams = {
  pageSize: number
}
type PaginationRequestParams<T> = T | PaginationParams

export const configUsePaginationRequest = (
  options: Partial<UsePaginationRequestOptions>
) => {
  configuredOptions = {
    ...configuredOptions,
    ...options,
  }
}

const usePaginationRequest: UsePaginationRequest = <I, O>(
  url: string,
  params?: I,
  initOutput?: PaginationData<O>,
  opt?: Partial<UsePaginationRequestOptions>
) => {
  const options = { ...configuredOptions, ...opt }
  const [pageNumber, setPageNumber] = useState(1)
  const [filters, _setFilters] = useState({})
  const { totalName, pageSize, pageNumberName } = options
  const { data, sync, ...rest } = useRequest<
    PaginationRequestParams<I>,
    PaginationData<O>
  >(
    options.method,
    url,
    { ...params, pageSize, [pageNumberName]: pageNumber, ...filters },
    initOutput || { list: [], [totalName]: 0 },
    { autoSync: false, ...options }
  )

  const pagination = usePagination({
    value: pageNumber,
    onChange: (page: number) => {
      setPageNumber(page)
    },
    options,
    total: data[totalName],
  })
  const paramsId = JSON.stringify(params)

  useEffect(() => {
    setPageNumber(1)
  }, [paramsId])

  return {
    data,
    sync,
    ...rest,
    pagination,
    setFilters(filters) {
      setPageNumber(1)
      _setFilters(filters)
    },
  }
}

export default usePaginationRequest
