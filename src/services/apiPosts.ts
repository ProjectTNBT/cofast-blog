import supabase, { supabaseUrl } from './supabase';
import { SortBy as SortByType, newPostData as newPostDataType } from '../types/types';
import { fetchRelatedTag } from './apiTags';

type FetchPostsArgs = {
  sortBy: SortByType;
  page: number;
  postByPage?: number;
};

export async function fetchPosts({ sortBy, page, postByPage }: FetchPostsArgs) {
  let query = supabase.from('posts').select('*', { count: 'exact' });

  // SORT
  if (sortBy) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === 'dec'
    });
  }

  // PAGINATION
  if (page && postByPage) {
    const from = (page - 1) * postByPage;
    const to = from + postByPage - 1;

    query = query.range(from, to);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.log(error.message);
    throw new Error('Posts could not be loaded');
  }

  let { data: post_tags, error: error2 } = await supabase.from('post_tags').select(`
    post_id,
    tags (
      id,
      created_at,
      name
    )
  `);

  if (error2) {
    console.log(error2.message);
    throw new Error('Posts could not be loaded');
  }

  const postsWithTags = [];
  if (!post_tags || !posts) return;
  for (let post of posts) {
    const postTags = post_tags.filter((postTag) => postTag.post_id === post.id);
    const tags = postTags.map((postTag) => postTag.tags);
    postsWithTags.push({ ...post, tags: tags });
  }

  return { postsWithTags, count };
}

export async function fetchPost(slug: string) {
  let { data: post, error } = await supabase.from('posts').select('*').eq('slug', slug).single();

  if (error) {
    console.log(error.message);
    throw new Error('Post could not be loaded');
  }

  const tags = await fetchRelatedTag(post?.id);

  const postWithTags = { ...post, tags };

  return postWithTags;
}

type NewPost = newPostDataType;

export async function createNewPost(newPost: NewPost, tag_ids: number[]) {
  // image path,url
  if (typeof newPost.cover_image == 'string') return;
  const imageName = `${Math.random()}-${newPost.cover_image.name}`.replaceAll('/', '');
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/blog/${imageName}`;

  const imgUrlAddedNewPost = {
    ...newPost,
    cover_image: imageUrl
  };

  // insert newPost
  const { data: newCreatedPost, error } = await supabase
    .from('posts')
    .insert([imgUrlAddedNewPost])
    .select();

  if (error) {
    console.log(error.message);
    throw new Error('Posts could not be created');
  }

  // if there is no error on creating post upload image
  const { error: uploadImgError } = await supabase.storage
    .from('blog')
    .upload(imageName, newPost.cover_image);

  if (uploadImgError) throw new Error('An error occurred while uploading the image.');

  // post tags relation
  const newpost_id = newCreatedPost[0].id;

  const postTags = tag_ids.map((tag_id: number) => ({
    post_id: newpost_id,
    tag_id: tag_id
  }));

  const { error: tagInsertError } = await supabase.from('post_tags').insert(postTags);

  if (tagInsertError) {
    console.log(tagInsertError.message);
    throw new Error('Posts could not be created.');
  }
}

export async function deletePost(post_id: number) {
  // if there is no error
  // delete post
  const { error } = await supabase.from('posts').delete().eq('id', post_id);

  if (error) {
    console.log(error.message);
    throw new Error('Posts could not be deleted.');
  }
}

export async function editPost(newPost: NewPost, post_id: number, tag_ids: number[]) {
  let imageName;
  let imageUrl;

  // image path,url
  if (typeof newPost.cover_image !== 'string') {
    imageName = `${Math.random()}-${newPost.cover_image.name}`.replaceAll('/', '');
    imageUrl = `${supabaseUrl}/storage/v1/object/public/blog/${imageName}`;
  }

  // edit post

  const imgUrlAddedNewPost = {
    ...newPost,
    cover_image: imageUrl
  };

  const { data: editedPost, error: editedPostError } = await supabase
    .from('posts')
    .update({ ...imgUrlAddedNewPost, modified_at: new Date().toISOString() })
    .eq('id', post_id)
    .select();

  if (editedPostError) {
    console.log(editedPostError.message);
    throw new Error('Posts could not be edited.');
  }

  // if there is no error on creating post upload image

  if (imageName) {
    const { error: uploadImgError } = await supabase.storage
      .from('blog')
      .upload(imageName, newPost.cover_image);

    if (uploadImgError) throw new Error('An error occurred while uploading the image.');
  }

  // // edit tags
  // if exists
  const editedpost_id = editedPost[0].id;

  // let { data: isPostExistOnPostTags } = await supabase
  //   .from('post_tags')
  //   .select('post_id', { head: true }) // Explicitly specify the type for select()
  //   .eq('post_id', editedpost_id);

  let { data: isPostExistOnPostTags } = await supabase
    .from('post_tags')
    .select('*') // Select all columns
    .eq('post_id', editedpost_id);

  // delete previous post_tags relation

  if (isPostExistOnPostTags) {
    const { error: postTagRelationError } = await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', editedpost_id);

    if (postTagRelationError) {
      console.log(postTagRelationError.message);
      throw new Error('Posts could not be edited.');
    }
  }

  // add new post_tags relation
  const postTags = tag_ids.map((tag_id: number) => ({
    post_id: editedpost_id,
    tag_id: tag_id
  }));

  const { error: editedTagsError } = await supabase.from('post_tags').insert(postTags).select();

  if (editedTagsError) {
    console.log(editedTagsError.message);
    throw new Error('Posts could not be edited.');
  }

  return editedPost;
}

export async function fetchPostTags() {
  let { data: post_tags } = await supabase.from('post_tags').select('*');

  return post_tags;
}

export async function createRelation({ post_id, tag_id }: { post_id: number; tag_id: number }) {
  const { error } = await supabase.from('post_tags').insert([{ post_id: post_id, tag_id: tag_id }]);

  if (error) {
    console.log(error);
    throw new Error('An error occured.');
  }
}
