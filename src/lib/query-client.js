import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			retry: 1,
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
			networkMode: 'offlineFirst',
		},
		mutations: {
			retry: 0,
			networkMode: 'offlineFirst',
		},
	},
});