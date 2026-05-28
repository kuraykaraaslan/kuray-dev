import PostCard from '@/components/frontend/Features/Blog/OtherPosts/Partials/PostCard'
import { PostWithData } from '@/types/content/BlogTypes'

interface ProjectPostsProps {
  posts: PostWithData[]
  title?: string
}

const ProjectPosts = ({ posts, title = 'Bu projeyle ilgili yazılar' }: ProjectPostsProps) => {
  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const p = { ...post, image: post.image || `/api/posts/${post.postId}/cover.jpeg` }
          return <PostCard key={post.postId} post={p} />
        })}
      </div>
    </section>
  )
}

export default ProjectPosts
