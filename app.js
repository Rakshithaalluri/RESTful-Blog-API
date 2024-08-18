const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require("express-validator");
const initializeDatabase = require("./initializeDatabase");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "blog.db");
const JWT_SECRET = 'your_jwt_secret';

let db = null;

const initializeDbAndServer = async () => {
    try {
        // Initialize the database
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        
        await initializeDatabase();

       if (process.env.NODE_ENV !== 'test') {
          app.listen(3000, () => {
                console.log("Server is running at port 3000");
            });
         }
        } catch (e) {
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();
 
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}

// User Registration
app.post("/register", [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("email").isEmail().withMessage("Valid email is required")
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const { username, password, email } = request.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, email)
      VALUES (?, ?, ?)
    `;
    await db.run(query, [username, hashedPassword, email]);
    response.status(201).send("User registered successfully");
  } catch (e) {
    response.status(500).send({ error: e.message });
  }
});

// User Login
app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const query = "SELECT * FROM users WHERE username = ?";
    const user = await db.get(query, [username]);

    if (!user) {
      return response.status(400).send("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response.status(400).send("Invalid username or password");
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    response.json({ token });
  } catch (e) {
    response.status(500).send({ error: e.message });
  }
});

const validatePost = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required")
];

app.use(authenticateToken);

app.post("/posts",authenticateToken, validatePost, async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({errors: errors.array() });
  }


    const { title, content} = request.body;
    const author_id = request.user.id; 
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try{
      const query = `
      INSERT INTO posts (title, content, author_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.run(query, [title, content, author_id, createdAt, updatedAt]);
    response.send("Post created successfully");
    }catch(e){
       response.status(500).send({errors: e.message});
    }
  });
  
  // Get all blog posts
  app.get("/posts", async (request, response) => {
    try {
      const posts = await db.all("SELECT * FROM posts");
      response.json(posts);
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });
  
  // Get a single blog post by ID
  app.get("/posts/:id", async (request, response) => {
    const { id } = request.params;
    try {
      const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
      if (post) {
        response.json(post);
      } else {
        response.status(404).send("Post not found");
      }
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });
  
  // Update a blog post by ID
  app.put("/posts/:id", validatePost, async (request, response) => {
    const { id } = request.params;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
  
    const { title, content } = request.body;
    const updatedAt = new Date().toISOString();
  
    try {
      const query = `
        UPDATE posts
        SET title = ?, content = ?, updated_at = ?
        WHERE id = ?
      `;
      const result = await db.run(query, [title, content, updatedAt, id]);
      if (result.changes === 0) {
        response.status(404).send("Post not found");
      } else {
        response.send("Post updated successfully");
      }
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });
  
  // Delete a blog post by ID
  app.delete("/posts/:id", async (request, response) => {
    const { id } = request.params;
    try {
      const result = await db.run("DELETE FROM posts WHERE id = ?", id);
      if (result.changes === 0) {
        response.status(404).send("Post not found");
      } else {
        response.send("Post deleted successfully");
      }
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });

  const validateComment = [
    body("post_id").isInt().withMessage("Post ID must be an integer"),
    body("content").notEmpty().withMessage("Content is required")
  ];
  
  // Create a new comment
  app.post("/comments",authenticateToken, validateComment, async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
  
    const { post_id, content} = request.body;
    const author_id = request.user.id; 
    const createdAt = new Date().toISOString();
  
    try {
      const query = `
        INSERT INTO comments (post_id, content, author_id, created_at)
        VALUES (?, ?, ?, ?)
      `;
      await db.run(query, [post_id, content, author_id, createdAt]);
      response.status(201).send("Comment created successfully");
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });
 
 // Get all comments for a post
app.get("/comments", async (request, response) => {
  const { post_id } = request.query;
  
  
  // Convert post_id to an integer
  const postId = parseInt(post_id, 10);

  try {
    // Query to get comments for the specific post_id
    const comments = await db.all("SELECT * FROM comments WHERE post_id = ?", postId);
  
    
    if (comments.length === 0) {
      return response.status(404).send("No comments found for this post");
    }
    response.json(comments);
  } catch (e) {
    response.status(500).send({ error: e.message });
  }
});

  
  
  // Get a single comment by ID
  app.get("/comments/:id", async (request, response) => {
    const { id } = request.params;
    try {
      const comment = await db.get("SELECT * FROM comments WHERE id = ?", id);
      if (comment) {
        response.json(comment);
      } else {
        response.status(404).send("Comment not found");
      }
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });

  // Update a comment by ID
  app.put("/comments/:id",authenticateToken, validateComment, async (request, response) => {
  const { id } = request.params;
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const { content } = request.body;
  const updatedAt = new Date().toISOString();

  try {
    const query = `
      UPDATE comments
      SET content = ?, updated_at = ?
      WHERE id = ?
    `;
    const result = await db.run(query, [content, updatedAt, id]);
    if (result.changes === 0) {
      response.status(404).send("Comment not found");
    } else {
      response.send("Comment updated successfully");
    }
  } catch (e) {
    response.status(500).send({ error: e.message });
  }
});

  
  // Delete a comment by ID
  app.delete("/comments/:id", async (request, response) => {
    const { id } = request.params;
    try {
      const result = await db.run("DELETE FROM comments WHERE id = ?", id);
      if (result.changes === 0) {
        response.status(404).send("Comment not found");
      } else {
        response.send("Comment deleted successfully");
      }
    } catch (e) {
      response.status(500).send({ error: e.message });
    }
  });
  
 

module.exports = app;


