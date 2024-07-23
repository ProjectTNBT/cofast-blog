import { Database } from './supabase';

export type Post = Database['public']['Tables']['posts']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type PostTagsRelation = Database['public']['Tables']['post_tags']['Row'];

export type PostWithTags = Post & {
  tags: Tag[];
};

export type newPostData = Omit<
  Post,
  'cover_image' | 'id' | 'created_at' | 'modified_at' | 'tags'
> & { cover_image: File | string };

export type TagWithCount = Tag & {
  postCount?: number;
};

export type SortBy = {
  field: string;
  direction: string;
};

export type Option = {
  value: string;
  label: string;
};
