import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
};

export type FeedConnection = {
  __typename?: 'FeedConnection';
  edges: Array<FeedEdge>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type FeedEdge = {
  __typename?: 'FeedEdge';
  cursor: Scalars['ID']['output'];
  node: Post;
};

export type Mutation = {
  __typename?: 'Mutation';
  commentOnPost: Comment;
  createPost: Post;
  deleteComment: Scalars['Boolean']['output'];
  deletePost: Scalars['Boolean']['output'];
  followUser: User;
  likePost: Post;
  unfollowUser: User;
  unlikePost: Post;
  updateProfile: User;
};

export type MutationcommentOnPostArgs = {
  body: Scalars['String']['input'];
  postId: Scalars['ID']['input'];
};

export type MutationcreatePostArgs = {
  content: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
};

export type MutationdeleteCommentArgs = {
  commentId: Scalars['ID']['input'];
};

export type MutationdeletePostArgs = {
  postId: Scalars['ID']['input'];
};

export type MutationfollowUserArgs = {
  userId: Scalars['ID']['input'];
};

export type MutationlikePostArgs = {
  postId: Scalars['ID']['input'];
};

export type MutationunfollowUserArgs = {
  userId: Scalars['ID']['input'];
};

export type MutationunlikePostArgs = {
  postId: Scalars['ID']['input'];
};

export type MutationupdateProfileArgs = {
  bio?: InputMaybe<Scalars['String']['input']>;
  github?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type Post = {
  __typename?: 'Post';
  author: User;
  commentCount: Scalars['Int']['output'];
  comments: Array<Comment>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  likeCount: Scalars['Int']['output'];
  viewerHasLiked: Scalars['Boolean']['output'];
};

export type PostcommentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  feed: FeedConnection;
  me: User;
  post: Post;
  postById: Post;
  postsByLikes: Array<Post>;
  user?: Maybe<User>;
  users: Array<User>;
};

export type QueryfeedArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QuerypostArgs = {
  id: Scalars['ID']['input'];
};

export type QuerypostByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QuerypostsByLikesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryuserArgs = {
  username: Scalars['String']['input'];
};

export type QueryusersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  followersCount: Scalars['Int']['output'];
  followingCount: Scalars['Int']['output'];
  github?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFollowing: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  posts: Array<Post>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type PostFragmentFragment = {
  __typename?: 'Post';
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  author: {
    __typename?: 'User';
    id: string;
    username: string;
    name?: string | null;
    imageUrl?: string | null;
  };
};

export type PostsByLikesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;

export type PostsByLikesQuery = {
  __typename?: 'Query';
  postsByLikes: Array<{
    __typename?: 'Post';
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    viewerHasLiked: boolean;
    author: {
      __typename?: 'User';
      id: string;
      username: string;
      name?: string | null;
      imageUrl?: string | null;
    };
  }>;
};

export type FeedQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['ID']['input']>;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  feed: {
    __typename?: 'FeedConnection';
    hasNextPage: boolean;
    edges: Array<{
      __typename?: 'FeedEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        imageUrl?: string | null;
        createdAt: string;
        likeCount: number;
        commentCount: number;
        viewerHasLiked: boolean;
        author: {
          __typename?: 'User';
          id: string;
          username: string;
          name?: string | null;
          imageUrl?: string | null;
        };
      };
    }>;
  };
};

export type CommentOnPostMutationVariables = Exact<{
  postId: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;

export type CommentOnPostMutation = {
  __typename?: 'Mutation';
  commentOnPost: {
    __typename?: 'Comment';
    id: string;
    body: string;
    createdAt: string;
    author: {
      __typename?: 'User';
      id: string;
      username: string;
      name?: string | null;
      imageUrl?: string | null;
    };
  };
};

export type CreatePostMutationVariables = Exact<{
  content: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost: {
    __typename?: 'Post';
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    viewerHasLiked: boolean;
    author: {
      __typename?: 'User';
      id: string;
      username: string;
      name?: string | null;
      imageUrl?: string | null;
    };
  };
};

export type DeleteCommentMutationVariables = Exact<{
  commentId: Scalars['ID']['input'];
}>;

export type DeleteCommentMutation = {
  __typename?: 'Mutation';
  deleteComment: boolean;
};

export type DeletePostMutationVariables = Exact<{
  postId: Scalars['ID']['input'];
}>;

export type DeletePostMutation = {
  __typename?: 'Mutation';
  deletePost: boolean;
};

export type LikePostMutationVariables = Exact<{
  postId: Scalars['ID']['input'];
}>;

export type LikePostMutation = {
  __typename?: 'Mutation';
  likePost: {
    __typename?: 'Post';
    id: string;
    likeCount: number;
    viewerHasLiked: boolean;
  };
};

export type PostWithCommentsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type PostWithCommentsQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: string;
    content: string;
    createdAt: string;
    imageUrl?: string | null;
    likeCount: number;
    commentCount: number;
    viewerHasLiked: boolean;
    author: {
      __typename?: 'User';
      id: string;
      username: string;
      name?: string | null;
      imageUrl?: string | null;
    };
    comments: Array<{
      __typename?: 'Comment';
      id: string;
      body: string;
      createdAt: string;
      author: {
        __typename?: 'User';
        id: string;
        username: string;
        name?: string | null;
        imageUrl?: string | null;
      };
    }>;
  };
};

export type UnlikePostMutationVariables = Exact<{
  postId: Scalars['ID']['input'];
}>;

export type UnlikePostMutation = {
  __typename?: 'Mutation';
  unlikePost: {
    __typename?: 'Post';
    id: string;
    likeCount: number;
    viewerHasLiked: boolean;
  };
};

export type UpdateProfileMutationVariables = Exact<{
  bio?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  github?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateProfileMutation = {
  __typename?: 'Mutation';
  updateProfile: {
    __typename?: 'User';
    id: string;
    bio?: string | null;
    website?: string | null;
    github?: string | null;
  };
};

export type UserProfileQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  user?: {
    __typename?: 'User';
    id: string;
    username: string;
    name?: string | null;
    bio?: string | null;
    website?: string | null;
    imageUrl?: string | null;
    github?: string | null;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    posts: Array<{
      __typename?: 'Post';
      id: string;
      content: string;
      imageUrl?: string | null;
      createdAt: string;
      likeCount: number;
      commentCount: number;
      viewerHasLiked: boolean;
      author: {
        __typename?: 'User';
        id: string;
        username: string;
        name?: string | null;
        imageUrl?: string | null;
      };
    }>;
  } | null;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    email: string;
    username: string;
    name?: string | null;
    bio?: string | null;
    website?: string | null;
    imageUrl?: string | null;
    github?: string | null;
    followersCount: number;
    followingCount: number;
    posts: Array<{
      __typename?: 'Post';
      id: string;
      content: string;
      imageUrl?: string | null;
      createdAt: string;
      likeCount: number;
      commentCount: number;
      viewerHasLiked: boolean;
      author: {
        __typename?: 'User';
        id: string;
        username: string;
        name?: string | null;
        imageUrl?: string | null;
      };
    }>;
  };
};

export type FollowUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;

export type FollowUserMutation = {
  __typename?: 'Mutation';
  followUser: {
    __typename?: 'User';
    id: string;
    isFollowing: boolean;
    followersCount: number;
  };
};

export type UnfollowUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;

export type UnfollowUserMutation = {
  __typename?: 'Mutation';
  unfollowUser: {
    __typename?: 'User';
    id: string;
    isFollowing: boolean;
    followersCount: number;
  };
};

export type UsersQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    username: string;
    name?: string | null;
    imageUrl?: string | null;
    isFollowing: boolean;
  }>;
};

export const PostFragmentFragmentDoc = gql`
  fragment PostFragment on Post {
    id
    content
    imageUrl
    createdAt
    author {
      id
      username
      name
      imageUrl
    }
    likeCount
    commentCount
    viewerHasLiked
  }
`;
export const PostsByLikesDocument = gql`
  query PostsByLikes($first: Int = 20) {
    postsByLikes(first: $first) {
      ...PostFragment
    }
  }
  ${PostFragmentFragmentDoc}
`;

/**
 * __usePostsByLikesQuery__
 *
 * To run a query within a React component, call `usePostsByLikesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostsByLikesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostsByLikesQuery({
 *   variables: {
 *      first: // value for 'first'
 *   },
 * });
 */
export function usePostsByLikesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    PostsByLikesQuery,
    PostsByLikesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostsByLikesQuery, PostsByLikesQueryVariables>(
    PostsByLikesDocument,
    options,
  );
}
export function usePostsByLikesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PostsByLikesQuery,
    PostsByLikesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PostsByLikesQuery, PostsByLikesQueryVariables>(
    PostsByLikesDocument,
    options,
  );
}
export function usePostsByLikesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        PostsByLikesQuery,
        PostsByLikesQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<PostsByLikesQuery, PostsByLikesQueryVariables>(
    PostsByLikesDocument,
    options,
  );
}
export type PostsByLikesQueryHookResult = ReturnType<
  typeof usePostsByLikesQuery
>;
export type PostsByLikesLazyQueryHookResult = ReturnType<
  typeof usePostsByLikesLazyQuery
>;
export type PostsByLikesSuspenseQueryHookResult = ReturnType<
  typeof usePostsByLikesSuspenseQuery
>;
export type PostsByLikesQueryResult = Apollo.QueryResult<
  PostsByLikesQuery,
  PostsByLikesQueryVariables
>;
export const FeedDocument = gql`
  query Feed($first: Int = 20, $after: ID) {
    feed(first: $first, after: $after) {
      edges {
        cursor
        node {
          ...PostFragment
        }
      }
      hasNextPage
    }
  }
  ${PostFragmentFragmentDoc}
`;

/**
 * __useFeedQuery__
 *
 * To run a query within a React component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeedQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useFeedQuery(
  baseOptions?: Apollo.QueryHookOptions<FeedQuery, FeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
}
export function useFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<FeedQuery, FeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    options,
  );
}
export function useFeedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<FeedQuery, FeedQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    options,
  );
}
export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
export type FeedLazyQueryHookResult = ReturnType<typeof useFeedLazyQuery>;
export type FeedSuspenseQueryHookResult = ReturnType<
  typeof useFeedSuspenseQuery
>;
export type FeedQueryResult = Apollo.QueryResult<FeedQuery, FeedQueryVariables>;
export const CommentOnPostDocument = gql`
  mutation CommentOnPost($postId: ID!, $body: String!) {
    commentOnPost(postId: $postId, body: $body) {
      id
      body
      createdAt
      author {
        id
        username
        name
        imageUrl
      }
    }
  }
`;
export type CommentOnPostMutationFn = Apollo.MutationFunction<
  CommentOnPostMutation,
  CommentOnPostMutationVariables
>;

/**
 * __useCommentOnPostMutation__
 *
 * To run a mutation, you first call `useCommentOnPostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCommentOnPostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [commentOnPostMutation, { data, loading, error }] = useCommentOnPostMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *      body: // value for 'body'
 *   },
 * });
 */
export function useCommentOnPostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CommentOnPostMutation,
    CommentOnPostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CommentOnPostMutation,
    CommentOnPostMutationVariables
  >(CommentOnPostDocument, options);
}
export type CommentOnPostMutationHookResult = ReturnType<
  typeof useCommentOnPostMutation
>;
export type CommentOnPostMutationResult =
  Apollo.MutationResult<CommentOnPostMutation>;
export type CommentOnPostMutationOptions = Apollo.BaseMutationOptions<
  CommentOnPostMutation,
  CommentOnPostMutationVariables
>;
export const CreatePostDocument = gql`
  mutation CreatePost($content: String!, $imageUrl: String) {
    createPost(content: $content, imageUrl: $imageUrl) {
      id
      content
      imageUrl
      createdAt
      likeCount
      commentCount
      viewerHasLiked
      author {
        id
        username
        name
        imageUrl
      }
    }
  }
`;
export type CreatePostMutationFn = Apollo.MutationFunction<
  CreatePostMutation,
  CreatePostMutationVariables
>;

/**
 * __useCreatePostMutation__
 *
 * To run a mutation, you first call `useCreatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostMutation, { data, loading, error }] = useCreatePostMutation({
 *   variables: {
 *      content: // value for 'content'
 *      imageUrl: // value for 'imageUrl'
 *   },
 * });
 */
export function useCreatePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePostMutation,
    CreatePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreatePostMutation, CreatePostMutationVariables>(
    CreatePostDocument,
    options,
  );
}
export type CreatePostMutationHookResult = ReturnType<
  typeof useCreatePostMutation
>;
export type CreatePostMutationResult =
  Apollo.MutationResult<CreatePostMutation>;
export type CreatePostMutationOptions = Apollo.BaseMutationOptions<
  CreatePostMutation,
  CreatePostMutationVariables
>;
export const DeleteCommentDocument = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`;
export type DeleteCommentMutationFn = Apollo.MutationFunction<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useDeleteCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >(DeleteCommentDocument, options);
}
export type DeleteCommentMutationHookResult = ReturnType<
  typeof useDeleteCommentMutation
>;
export type DeleteCommentMutationResult =
  Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;
export const DeletePostDocument = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;
export type DeletePostMutationFn = Apollo.MutationFunction<
  DeletePostMutation,
  DeletePostMutationVariables
>;

/**
 * __useDeletePostMutation__
 *
 * To run a mutation, you first call `useDeletePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePostMutation, { data, loading, error }] = useDeletePostMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useDeletePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeletePostMutation,
    DeletePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeletePostMutation, DeletePostMutationVariables>(
    DeletePostDocument,
    options,
  );
}
export type DeletePostMutationHookResult = ReturnType<
  typeof useDeletePostMutation
>;
export type DeletePostMutationResult =
  Apollo.MutationResult<DeletePostMutation>;
export type DeletePostMutationOptions = Apollo.BaseMutationOptions<
  DeletePostMutation,
  DeletePostMutationVariables
>;
export const LikePostDocument = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likeCount
      viewerHasLiked
    }
  }
`;
export type LikePostMutationFn = Apollo.MutationFunction<
  LikePostMutation,
  LikePostMutationVariables
>;

/**
 * __useLikePostMutation__
 *
 * To run a mutation, you first call `useLikePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likePostMutation, { data, loading, error }] = useLikePostMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useLikePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LikePostMutation,
    LikePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikePostMutation, LikePostMutationVariables>(
    LikePostDocument,
    options,
  );
}
export type LikePostMutationHookResult = ReturnType<typeof useLikePostMutation>;
export type LikePostMutationResult = Apollo.MutationResult<LikePostMutation>;
export type LikePostMutationOptions = Apollo.BaseMutationOptions<
  LikePostMutation,
  LikePostMutationVariables
>;
export const PostWithCommentsDocument = gql`
  query PostWithComments($id: ID!) {
    post(id: $id) {
      id
      content
      createdAt
      imageUrl
      likeCount
      commentCount
      viewerHasLiked
      author {
        id
        username
        name
        imageUrl
      }
      comments {
        id
        body
        createdAt
        author {
          id
          username
          name
          imageUrl
        }
      }
    }
  }
`;

/**
 * __usePostWithCommentsQuery__
 *
 * To run a query within a React component, call `usePostWithCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostWithCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostWithCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePostWithCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    PostWithCommentsQuery,
    PostWithCommentsQueryVariables
  > &
    (
      | { variables: PostWithCommentsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostWithCommentsQuery, PostWithCommentsQueryVariables>(
    PostWithCommentsDocument,
    options,
  );
}
export function usePostWithCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PostWithCommentsQuery,
    PostWithCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    PostWithCommentsQuery,
    PostWithCommentsQueryVariables
  >(PostWithCommentsDocument, options);
}
export function usePostWithCommentsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        PostWithCommentsQuery,
        PostWithCommentsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    PostWithCommentsQuery,
    PostWithCommentsQueryVariables
  >(PostWithCommentsDocument, options);
}
export type PostWithCommentsQueryHookResult = ReturnType<
  typeof usePostWithCommentsQuery
>;
export type PostWithCommentsLazyQueryHookResult = ReturnType<
  typeof usePostWithCommentsLazyQuery
>;
export type PostWithCommentsSuspenseQueryHookResult = ReturnType<
  typeof usePostWithCommentsSuspenseQuery
>;
export type PostWithCommentsQueryResult = Apollo.QueryResult<
  PostWithCommentsQuery,
  PostWithCommentsQueryVariables
>;
export const UnlikePostDocument = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likeCount
      viewerHasLiked
    }
  }
`;
export type UnlikePostMutationFn = Apollo.MutationFunction<
  UnlikePostMutation,
  UnlikePostMutationVariables
>;

/**
 * __useUnlikePostMutation__
 *
 * To run a mutation, you first call `useUnlikePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnlikePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unlikePostMutation, { data, loading, error }] = useUnlikePostMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useUnlikePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UnlikePostMutation,
    UnlikePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UnlikePostMutation, UnlikePostMutationVariables>(
    UnlikePostDocument,
    options,
  );
}
export type UnlikePostMutationHookResult = ReturnType<
  typeof useUnlikePostMutation
>;
export type UnlikePostMutationResult =
  Apollo.MutationResult<UnlikePostMutation>;
export type UnlikePostMutationOptions = Apollo.BaseMutationOptions<
  UnlikePostMutation,
  UnlikePostMutationVariables
>;
export const UpdateProfileDocument = gql`
  mutation UpdateProfile($bio: String, $website: String, $github: String) {
    updateProfile(bio: $bio, website: $website, github: $github) {
      id
      bio
      website
      github
    }
  }
`;
export type UpdateProfileMutationFn = Apollo.MutationFunction<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      bio: // value for 'bio'
 *      website: // value for 'website'
 *      github: // value for 'github'
 *   },
 * });
 */
export function useUpdateProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >(UpdateProfileDocument, options);
}
export type UpdateProfileMutationHookResult = ReturnType<
  typeof useUpdateProfileMutation
>;
export type UpdateProfileMutationResult =
  Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const UserProfileDocument = gql`
  query UserProfile($username: String!) {
    user(username: $username) {
      id
      username
      name
      bio
      website
      imageUrl
      github
      followersCount
      followingCount
      isFollowing
      posts {
        ...PostFragment
      }
    }
  }
  ${PostFragmentFragmentDoc}
`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions: Apollo.QueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  > &
    (
      | { variables: UserProfileQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        UserProfileQuery,
        UserProfileQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<
  typeof useUserProfileLazyQuery
>;
export type UserProfileSuspenseQueryHookResult = ReturnType<
  typeof useUserProfileSuspenseQuery
>;
export type UserProfileQueryResult = Apollo.QueryResult<
  UserProfileQuery,
  UserProfileQueryVariables
>;
export const MeDocument = gql`
  query Me {
    me {
      id
      email
      username
      name
      bio
      website
      imageUrl
      github
      followersCount
      followingCount
      posts {
        ...PostFragment
      }
    }
  }
  ${PostFragmentFragmentDoc}
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(
  baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    options,
  );
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const FollowUserDocument = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      isFollowing
      followersCount
    }
  }
`;
export type FollowUserMutationFn = Apollo.MutationFunction<
  FollowUserMutation,
  FollowUserMutationVariables
>;

/**
 * __useFollowUserMutation__
 *
 * To run a mutation, you first call `useFollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [followUserMutation, { data, loading, error }] = useFollowUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFollowUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    FollowUserMutation,
    FollowUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<FollowUserMutation, FollowUserMutationVariables>(
    FollowUserDocument,
    options,
  );
}
export type FollowUserMutationHookResult = ReturnType<
  typeof useFollowUserMutation
>;
export type FollowUserMutationResult =
  Apollo.MutationResult<FollowUserMutation>;
export type FollowUserMutationOptions = Apollo.BaseMutationOptions<
  FollowUserMutation,
  FollowUserMutationVariables
>;
export const UnfollowUserDocument = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      isFollowing
      followersCount
    }
  }
`;
export type UnfollowUserMutationFn = Apollo.MutationFunction<
  UnfollowUserMutation,
  UnfollowUserMutationVariables
>;

/**
 * __useUnfollowUserMutation__
 *
 * To run a mutation, you first call `useUnfollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnfollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unfollowUserMutation, { data, loading, error }] = useUnfollowUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUnfollowUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UnfollowUserMutation,
    UnfollowUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UnfollowUserMutation,
    UnfollowUserMutationVariables
  >(UnfollowUserDocument, options);
}
export type UnfollowUserMutationHookResult = ReturnType<
  typeof useUnfollowUserMutation
>;
export type UnfollowUserMutationResult =
  Apollo.MutationResult<UnfollowUserMutation>;
export type UnfollowUserMutationOptions = Apollo.BaseMutationOptions<
  UnfollowUserMutation,
  UnfollowUserMutationVariables
>;
export const UsersDocument = gql`
  query Users($search: String) {
    users(search: $search) {
      id
      username
      name
      imageUrl
      isFollowing
    }
  }
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options,
  );
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options,
  );
}
export function useUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options,
  );
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersSuspenseQueryHookResult = ReturnType<
  typeof useUsersSuspenseQuery
>;
export type UsersQueryResult = Apollo.QueryResult<
  UsersQuery,
  UsersQueryVariables
>;
