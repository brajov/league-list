import { useQuery } from '@tanstack/react-query';
import { getLeagues } from '../api/leagues';

export function useLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: getLeagues,
  });
}
