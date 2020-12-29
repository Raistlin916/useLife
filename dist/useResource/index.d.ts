export interface ResourceType<I = any, O = any> {
    data: O;
    sync: (data?: Partial<I> | I) => Promise<O>;
    loading: boolean;
    loaded: boolean;
    id: string | undefined;
    isEmpty: () => boolean;
}
declare type useEmptyResourceType<T = void> = (data: T) => ResourceType<void, T>;
export declare const useEmptyResource: useEmptyResourceType;
export interface Factory<I, O> {
    (input: I): O | Promise<O>;
    id?: string;
}
export declare const useResource: <I, O>(factory: Factory<I, O>, input: I, initialValue?: O | undefined, autoSync?: boolean | undefined) => ResourceType<I, O>;
export {};
