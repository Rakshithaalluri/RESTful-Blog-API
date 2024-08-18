# Blog API

This is a RESTful API for managing a blog platform. The API provides user authentication, blog post creation, and comment functionalities. It's built using Node.js, Express, SQLite, and JWT for authentication.

## Table of Contents

- [Installation](#installation)
- [Database Initialization](#database-initialization)
- [Starting the Server](#starting-the-server)
- [API Endpoints](#api-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Post Endpoints](#post-endpoints)
  - [Comment Endpoints](#comment-endpoints)
- [Authentication](#authentication)
- [Example Requests](#example-requests)
  - [User Registration](#user-registration)
  - [User Login](#user-login)
  - [Create a Post](#create-a-post)
  - [Get All Posts](#get-all-posts)
  - [Create a Comment](#create-a-comment)
- [Running Tests](#running-tests)

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/blog-api.git
   cd blog-api

2. Install the dependencies:
   npm install
   
## Database Initialization
To initialize the database, the API runs an automatic setup when the server starts. The database schema is defined in the initializeDatabase.js file.
If you need to manually reset the database, run:
npm run init-db

## Starting the Server
### To start the server, use the following command:
node app.js

The server will run on http://localhost:3000.

## API Endpoints
### User Endpoints
POST /register: Register a new user.
POST /login: Log in a user and return a JWT token.
### Post Endpoints
POST /posts: Create a new blog post (requires authentication).
GET /posts: Retrieve all blog posts.
GET /posts/:id: Retrieve a single blog post by its ID.
PUT /posts/:id: Update a blog post by its ID (requires authentication).
DELETE /posts/:id: Delete a blog post by its ID (requires authentication).
### Comment Endpoints
POST /comments: Create a new comment on a post (requires authentication).
GET /comments: Retrieve all comments for a specific post.
GET /comments/:id: Retrieve a single comment by its ID.
PUT /comments/:id: Update a comment by its ID (requires authentication).
DELETE /comments/:id: Delete a comment by its ID (requires authentication).

## Authentication
The API uses JWT (JSON Web Token) for authentication. To access protected routes, users must include a valid JWT token in the Authorization header of their requests.

### Example of an Authorization header:
Authorization: Bearer your_jwt_token

## Example Requests
### User Registration
To register a new user:
POST /register
Content-Type: application/json

{
    "username": "exampleuser",
    "password": "password123",
    "email": "user@example.com"
}

## User Login
### To log in and receive a JWT token:
POST /login
Content-Type: application/json

{
    "username": "exampleuser",
    "password": "password123"
}

## Create a Post
To create a new blog post (requires authentication):
POST /posts
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post."
}

## Get All Posts
To retrieve all blog posts:
GET /posts

## Create a Comment
To create a new comment on a post (requires authentication):
POST /comments
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
    "post_id": 1,
    "content": "This is a comment on the first post."
}

## Running Tests
To run the test suite, use the following command:
npx jest

This will execute all tests and provide output on whether the tests have passed or failed.

## Conclusion
This Blog API provides a basic structure for managing users, posts, and comments with authentication. You can extend and modify the functionality to suit your needs. For any further enhancements, contributions are welcome!


You can directly copy and paste this `README.md` file into your project directory. It provides a comprehensive guide on how to set up and use the API, including installation, authentication, and example requests.
