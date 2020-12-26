import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useResource, ResourceType } from './useResource'

let request: AxiosInstance = axios.create()

export type HttpMethod = 'get' | 'delete' | 'put' | 'post'

export interface Request<I = any, O = any> {
  (value?: I): Promise<O>
}

interface UseRequest {
  <I, O>(
    method: HttpMethod,
    url?: string,
    initInput?: I,
    initOutput?: O,
    opt?: Partial<UseRequestOptions>
  ): ResourceType<I, O>
}

export interface UseRequestOptions {
  autoSync?: boolean
  transformRequest: Function
  transformResponse: Function
  config?: AxiosRequestConfig
}

export const defaultOptions: UseRequestOptions = {
  autoSync: undefined,
  transformRequest: (v: any) => v,
  transformResponse: (v: any) => v,
}

const useRequest: UseRequest = <I, O>(
  method: HttpMethod,
  url?: string,
  params?: I,
  initialValue?: O,
  opt?: Partial<UseRequestOptions>
) => {
  const id = `request-${method}-${url}-${JSON.stringify(params)}`
  const options = { ...defaultOptions, ...opt }

  const factory = async (input: I) => {
    if (!url) {
      return (await initialValue) as O
    }
    const transformedInput = options.transformRequest(input)
    const response =
      method === 'get' || method === 'delete'
        ? await request[method]<O>(url, { params: transformedInput, ...options.config })
        : await request[method]<O>(url, transformedInput, options.config)
    return options.transformResponse(response)
  }
  factory.id = url

  const resource = useResource<I, O>(factory, params as I, initialValue, options.autoSync)

  return {
    ...resource,
    id,
  }
}

export default useRequest
export const useGet = <I, O>(
  url?: string,
  params?: I,
  initialValue?: O,
  opt?: Partial<UseRequestOptions>
) => useRequest('get', url, params, initialValue, opt)
export const usePost = <I, O>(
  url?: string,
  params?: I,
  initialValue?: O,
  opt?: Partial<UseRequestOptions>
) => useRequest('post', url, params, initialValue, opt)

export const configUseRequest = (requestFn: AxiosInstance) => {
  request = requestFn
}
