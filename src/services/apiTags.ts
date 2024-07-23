import { SortBy as SortByType } from '../types/types';
import supabase from './supabase';

type fetchTagsArgs = {
  page: number;
  sortBy: SortByType;
  tagByPage?: number;
};

export async function fetchTags({ page, sortBy, tagByPage }: fetchTagsArgs) {
  let query = supabase.from('tags').select('*', { count: 'exact' });

  // PAGINATION
  if (page && tagByPage) {
    const from = (page - 1) * tagByPage;
    const to = from + tagByPage - 1;

    query = query.range(from, to);
  }

  if (sortBy) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === 'dec'
    });
  }

  const { data: tags, error, count } = await query;

  if (error) {
    console.log(error.message);
    throw new Error('Tags could not be fetched');
  }

  return { tags, count };
}

export async function fetchTagsWithoutPagination() {
  let query = supabase.from('tags').select('*').order('created_at', {
    ascending: false
  });

  const { data: tags, error } = await query;

  if (error) {
    console.log(error.message);
    throw new Error('Tags could not be fetched');
  }

  return tags;
}

export async function addTags(newTags: string[]) {
  const insertingData = newTags.map((tag) => ({
    name: tag
  }));

  const { data, error } = await supabase.from('tags').insert(insertingData).select();

  if (error) {
    console.log(error.message);
    throw new Error('Tags could not be added');
  }

  return data;
}

export async function fetchRelatedTag(post_id: any) {
  const { data: selectedTagsData, error: error1 } = await supabase
    .from('post_tags')
    .select('*')
    .eq('post_id', post_id);

  if (error1) {
    console.log(error1.message);
    throw new Error('The related tag id/ids could not be fetched.');
  }

  const selectedtag_ids = selectedTagsData?.map((selectedTagData) => selectedTagData.tag_id);

  // get matching tags
  let { data: relatedTags, error: error2 } = await supabase
    .from('tags')
    .select('*')
    .in('id', selectedtag_ids);

  if (error2) {
    console.log(error2.message);
    throw new Error('The related tag could not be fetched.');
  }
  // console.log(relatedTags);
  return relatedTags;
}

export async function deleteTag(tag_id: number) {
  // delete post_tag relation
  const { error } = await supabase.from('post_tags').delete().eq('tag_id', tag_id);

  if (error) {
    console.log(error.message);
    throw new Error('The post-tag relation could not be deleted.');
  }

  // delete tag
  const { error: error2 } = await supabase.from('tags').delete().eq('id', tag_id);

  if (error2) {
    console.log(error2.message);
    throw new Error('The tag could not be deleted.');
  }
}
