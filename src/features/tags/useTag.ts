import { useQuery } from '@tanstack/react-query';
import { fetchRelatedTag } from '../../services/apiTags';

export function useTag(post_id: number) {
  const {
    data: relatedTags,
    isPending,
    error
  } = useQuery({
    queryKey: ['tag', post_id],
    queryFn: () => fetchRelatedTag(post_id)
  });

  return { relatedTags, isPending, error };
}
