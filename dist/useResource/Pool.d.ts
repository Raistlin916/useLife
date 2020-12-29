import { ReactNode } from 'react';
import { Factory, ResourceType } from '.';
declare const ResourcePool: ({ children }: {
    children: ReactNode;
}) => JSX.Element;
declare type CacheId = string;
export declare const useResourcePool: <O>(scope: string, factory: Factory<string[], O[]>, input: CacheId[], initialValue: O) => ResourceType<string[], O[]>;
declare type StringMap<T> = {
    [key: string]: T;
};
export declare const useResourcePoolMap: <I, O>(scope: string, factory: Factory<I, StringMap<O>>, params: I, initialValue?: Map<string, O>) => ResourceType<I, Map<string, O>>;
export declare const useResourceConst: <I, O>(scope: string, factory: Factory<I, O>, params: I, initialValue: O) => ResourceType<I, O>;
export default ResourcePool;
