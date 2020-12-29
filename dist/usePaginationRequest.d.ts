import { HttpMethod, UseRequestOptions } from './useRequest';
import { ResourceType } from './useResource';
interface PaginationProps {
}
interface PaginationData<T> {
    list: T[];
    [key: string]: any;
}
export interface ResourceWithPagination<I = any, O = any> extends ResourceType<I, O> {
    pagination: PaginationProps;
    setFilters: (v: object) => void;
}
export interface UsePaginationRequest {
    <I, O = any>(url: string, params?: I, initOutput?: PaginationData<O>, opt?: Partial<UsePaginationRequestOptions>): ResourceWithPagination<I, PaginationData<O>>;
}
export interface UsePaginationRequestOptions extends UseRequestOptions {
    method: HttpMethod;
    pageSize: number;
    pageNumberName: string;
    totalName: string;
}
export declare const configUsePaginationRequest: (options: Partial<UsePaginationRequestOptions>) => void;
declare const usePaginationRequest: UsePaginationRequest;
export default usePaginationRequest;
