import { useState, useEffect } from 'react'
import useRequest, {
  HttpMethod,
  UseRequestOptions,
  defaultOptions as useRequestDefaultOptions,
} from './useRequest'
import { ResourceType } from './useResource'

interface PaginationProps {
  onChange: (page: number, pageSize: number) => void
  current: number
}

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
  resetPageNumberOnParamsChange: boolean
}

const defaultOptions: UsePaginationRequestOptions = {
  ...useRequestDefaultOptions,
  method: 'post',
  pageSize: 10,
  pageNumberName: 'pageNo',
  totalName: 'count',
  resetPageNumberOnParamsChange: true,
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
  type CombineParams = I & any
  // type CombineParams = I & { pageSize: number; pageNumber: number }
  const options = { ...configuredOptions, ...opt }
  const { totalName, pageSize, pageNumberName } = options

  const [combinedParams, setCombinedParams] = useState<CombineParams>({
    ...params,
    pageSize,
    pageNumber: 1,
  })
  const _setCombinedParams = (args: Partial<CombineParams>) =>
    setCombinedParams({ ...combinedParams, ...args })

  const requestParams: any = {
    ...combinedParams,
    [pageNumberName]: combinedParams.pageNumber,
  }
  delete requestParams.pageNumber

  const { data, sync, ...rest } = useRequest<
    PaginationRequestParams<I>,
    PaginationData<O>
  >(
    options.method,
    url,
    requestParams,
    initOutput || { list: [], [totalName]: 0 },
    options
  )

  const pagination = usePagination({
    value: combinedParams.pageNumber,
    onChange: (page: number) => {
      _setCombinedParams({
        pageNumber: page,
      })
    },
    options,
    total: data[totalName],
  })
  const paramsId = JSON.stringify(params)

  useEffect(() => {
    _setCombinedParams(
      options.resetPageNumberOnParamsChange
        ? {
            ...params,
            pageNumber: 1,
          }
        : { ...params }
    )
  }, [paramsId, options.resetPageNumberOnParamsChange])

  return {
    data,
    sync,
    ...rest,
    pagination,
    setFilters(filters) {
      _setCombinedParams({
        pageNumber: 1,
        ...filters,
      })
    },
  }
}

export default usePaginationRequest
