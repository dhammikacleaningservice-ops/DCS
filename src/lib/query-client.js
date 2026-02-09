import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			retry: 1,
			staleTime: 1000 * 60 * 2, // 2 minutes (reduced from 5)
			gcTime: 1000 * 60 * 5, // 5 minutes (reduced from 10)
			networkMode: 'online', // Changed from offlineFirst for better performance
		},
		mutations: {
			retry: 0,
		},
	},
});