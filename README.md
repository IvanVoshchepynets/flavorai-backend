# FlavorAI Backend (NestJS + Prisma)

A backend API for the **FlavorAI – Personal Recipe Discovery** application.  
Provides authentication, recipe management, and rating features with PostgreSQL and Prisma.

## Main Features

- JWT-based authentication (register & login)
- User accounts with password hashing (bcrypt)
- CRUD for recipes:
  - title, description, ingredients, instructions, optional cuisine
- Browse all recipes
- Search recipes by name (`?search=...`)
- View only recipes created by the current user (`/recipes/me`)
- Rate recipes (1–5 stars):
  - One rating per user per recipe
  - Average rating and ratings count

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT, Passport, bcrypt
- **Containerization (optional):** Docker + Docker Compose (for PostgreSQL)

---

## How to Run the Backend

1. Clone the repository

git clone https://github.com/IvanVoshchepynets/flavorai-backend.git

2. Navigate into the backend folder:

cd flavorai-backend

3. Install dependencies

npm install

4. Configure environment variables, create a .env file in the root of the backend project

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flavorai?schema=public"
JWT_SECRET="super_secret_jwt_key"
PORT=3000

5. Build and start Docker containers for PostgreSQL:

docker-compose build

docker-compose up -d

6. Run Prisma migrations & generate client

npx prisma migrate dev --name init_db
npx prisma generate

7. Start the backend server

npm run start:dev

8. The backend will be available at:

http://localhost:3000
