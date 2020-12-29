import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ResourceType } from './useResource';
export declare type HttpMethod = 'get' | 'delete' | 'put' | 'post';
export interface Request<I = any, O = any> {
    (value?: I): Promise<O>;
}
interface UseRequest {
    <I, O>(method: HttpMethod, url?: string, initInput?: I, initOutput?: O, opt?: Partial<UseRequestOptions>): ResourceType<I, O>;
}
export interface UseRequestOptions {
    autoSync?: boolean;
    transformRequest: Function;
    transformResponse: Function;
    config?: AxiosRequestConfig;
}
export declare const defaultOptions: UseRequestOptions;
declare const useRequest: UseRequest;
export default useRequest;
export declare const useGet: <I, O>(url?: string | undefined, params?: I | undefined, initialValue?: O | undefined, opt?: Partial<UseRequestOptions> | undefined) => ResourceType<I, O>;
export declare const usePost: <I, O>(url?: string | undefined, params?: I | undefined, initialValue?: O | undefined, opt?: Partial<UseRequestOptions> | undefined) => ResourceType<I, O>;
export declare const configUseRequest: (requestFn: AxiosInstance) => void;
