const express = require("express")

module.exports = (sql) => {
  const router = express.Router()

  const authMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Not authenticated" })
    }
    req.user = req.session.user
    next()
  }

  const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }
    next()
  }

  function createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }


  router.get("/", async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 100
      const offset = (page - 1) * limit

      const countResult = await sql`SELECT COUNT(*) as total FROM posts`
      const total = Number.parseInt(countResult[0].total)

      const posts = await sql`
        SELECT p.*, 
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
          (SELECT COUNT(*) FROM post_dislikes WHERE post_id = p.id) as dislikes,
          (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
        FROM posts p 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      res.json(posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/search/query", async (req, res) => {
    const searchTerm = req.query.q

    if (!searchTerm) {
      return res.status(400).json({ error: "Search query required" })
    }

    try {
      const posts = await sql`
        SELECT p.*, 
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
          (SELECT COUNT(*) FROM post_dislikes WHERE post_id = p.id) as dislikes,
          (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
        FROM posts p 
        WHERE title ILIKE ${"%" + searchTerm + "%"} OR content ILIKE ${"%" + searchTerm + "%"}
        ORDER BY created_at DESC
      `
      res.json(posts || [])
    } catch (error) {
      console.error("Error searching posts:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id", async (req, res) => {
    try {
      const identifier = req.params.id
      const isNumeric = /^\d+$/.test(identifier)

      let post
      if (isNumeric) {
        const result = await sql`
          SELECT p.*, 
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
            (SELECT COUNT(*) FROM post_dislikes WHERE post_id = p.id) as dislikes,
            (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
          FROM posts p WHERE p.id = ${Number.parseInt(identifier)}
        `
        post = result[0]
      } else {
        const result = await sql`
          SELECT p.*, 
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
            (SELECT COUNT(*) FROM post_dislikes WHERE post_id = p.id) as dislikes,
            (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
          FROM posts p WHERE p.slug = ${identifier}
        `
        post = result[0]
      }

      if (!post) {
        return res.status(404).json({ error: "Post not found" })
      }
      res.json(post)
    } catch (error) {
      console.error("Error fetching post:", error)
      res.status(500).json({ error: "Database error" })
    }
  })

  
  router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    const { title, content, image_url, author_name, slug } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const finalSlug = slug && slug.trim() ? slug.trim() : createSlug(title)
    const finalAuthorName = author_name && author_name.trim() ? author_name.trim() : req.user.username

    try {
      const result = await sql`
        INSERT INTO posts (title, slug, content, image_url, author_id, author_name)
        VALUES (${title}, ${finalSlug}, ${content}, ${image_url || null}, ${req.user.id}, ${finalAuthorName})
        RETURNING *
      `

      res.status(201).json({
        ...result[0],
        message: "Post created successfully",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        return res.status(400).json({ error: "A post with this title already exists" })
      }
      res.status(500).json({ error: "Database error" })
    }
  })


  router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { title, content, image_url, author_name, slug } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const finalSlug = slug && slug.trim() ? slug.trim() : createSlug(title)
    const finalAuthorName = author_name && author_name.trim() ? author_name.trim() : req.user.username

    try {
      const result = await sql`
        UPDATE posts 
        SET title = ${title}, slug = ${finalSlug}, content = ${content}, 
            image_url = ${image_url || null}, author_name = ${finalAuthorName}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${Number.parseInt(req.params.id)}
        RETURNING *
      `

      if (result.length === 0) {
        return res.status(404).json({ error: "Post not found" })
      }

      res.json({ message: "Post updated successfully", slug, post: result[0] })
    } catch (error) {
      console.error("Error updating post:", error)
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        return res.status(400).json({ error: "A post with this title already exists" })
      }
      res.status(500).json({ error: "Database error" })
    }
  })


  router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const postResult = await sql`
        SELECT title FROM posts WHERE id = ${Number.parseInt(req.params.id)}
      `

      if (postResult.length === 0) {
        return res.status(404).json({ error: "Post not found" })
      }

      const post = postResult[0]

      await sql`
        DELETE FROM posts WHERE id = ${Number.parseInt(req.params.id)}
      `

      res.json({ message: "Post deleted successfully" })
    } catch (error) {
      console.error("Error deleting post:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id/likes", async (req, res) => {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${Number.parseInt(req.params.id)}
      `
      res.json({ count: Number.parseInt(result[0].count) })
    } catch (error) {
      console.error("Error counting likes:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.post("/:id/like", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      await sql`
        INSERT INTO post_likes (post_id, user_identifier)
        VALUES (${postId}, ${userIdentifier})
        ON CONFLICT (post_id, user_identifier) DO NOTHING
      `

      const result = await sql`
        SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}
      `

      res.json({
        message: "Post liked",
        likes: Number.parseInt(result[0].count),
        liked: true,
      })
    } catch (error) {
      console.error("Error adding like:", error)
      res.status(500).json({ error: "Database error" })
    }
  })

  router.delete("/:id/like", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      await sql`
        DELETE FROM post_likes 
        WHERE post_id = ${postId} AND user_identifier = ${userIdentifier}
      `

      const result = await sql`
        SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}
      `

      res.json({
        message: "Like removed",
        likes: Number.parseInt(result[0].count),
        liked: false,
      })
    } catch (error) {
      console.error("Error removing like:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id/liked", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      const result = await sql`
        SELECT * FROM post_likes 
        WHERE post_id = ${postId} AND user_identifier = ${userIdentifier}
      `
      res.json({ liked: result.length > 0 })
    } catch (error) {
      console.error("Error checking like status:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id/dislikes", async (req, res) => {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM post_dislikes 
        WHERE post_id = ${Number.parseInt(req.params.id)}
      `
      res.json({ count: Number.parseInt(result[0].count) })
    } catch (error) {
      console.error("Error counting dislikes:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.post("/:id/dislike", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      await sql`
        INSERT INTO post_dislikes (post_id, user_identifier)
        VALUES (${postId}, ${userIdentifier})
        ON CONFLICT (post_id, user_identifier) DO NOTHING
      `
      
      const result = await sql`
        SELECT COUNT(*) as count FROM post_dislikes WHERE post_id = ${postId}
      `
      
      res.json({
        message: "Post disliked",
        dislikes: Number.parseInt(result[0].count),
        disliked: true,
      })
    } catch (error) {
      console.error("Error adding dislike:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.delete("/:id/dislike", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      await sql`
        DELETE FROM post_dislikes 
        WHERE post_id = ${postId} AND user_identifier = ${userIdentifier}
      `
      
      const result = await sql`
        SELECT COUNT(*) as count FROM post_dislikes WHERE post_id = ${postId}
      `
      
      res.json({
        message: "Dislike removed",
        dislikes: Number.parseInt(result[0].count),
        disliked: false,
      })
    } catch (error) {
      console.error("Error removing dislike:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id/disliked", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    try {
      const result = await sql`
        SELECT * FROM post_dislikes 
        WHERE post_id = ${postId} AND user_identifier = ${userIdentifier}
      `
      res.json({ disliked: result.length > 0 })
    } catch (error) {
      console.error("Error checking dislike status:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.post("/:id/share", async (req, res) => {
    const postId = Number.parseInt(req.params.id)
    const { platform } = req.body
    const userIdentifier = req.session?.user?.id?.toString() || req.ip || "anonymous"

    if (!platform) {
      return res.status(400).json({ error: "Platform required" })
    }

    try {
      await sql`
        INSERT INTO post_shares (post_id, platform, user_identifier)
        VALUES (${postId}, ${platform}, ${userIdentifier})
      `
      res.json({ message: "Share tracked successfully" })
    } catch (error) {
      console.error("Error tracking share:", error)
      res.status(500).json({ error: "Database error" })
    }
  })


  router.get("/:id/shares", async (req, res) => {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM post_shares WHERE post_id = ${Number.parseInt(req.params.id)}
      `
      res.json({ count: Number.parseInt(result[0].count) })
    } catch (error) {
      console.error("Error counting shares:", error)
      res.status(500).json({ error: "Database error" })
    }
  })

  return router
}
