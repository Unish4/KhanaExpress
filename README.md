# KhanaExpress

KhanaExpress is a food delivery and restaurant management backend built with Node.js, Express, and MongoDB. The project is designed to support a complete food-ordering platform where customers can browse restaurants and meals, place orders, manage addresses, and review food, while restaurant owners can manage their menu and orders, and delivery personnel can accept and deliver orders.

This repository currently contains the backend API layer. It is structured as a modular Express application with separate route, controller, model, middleware, and configuration files.

---

## Project purpose

The application is meant to handle the backend logic for a food delivery ecosystem, including:

- User registration and login
- Role-based accounts: customer, restaurant, delivery, admin
- Restaurant creation and management
- Menu item creation and updates
- Order creation and lifecycle
- Delivery pickup and delivery flow
- Customer addresses
- Reviews and ratings
- Image uploads to Cloudinary
- Security and rate limiting

---

## Tech stack

### Runtime
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose ODM

### Authentication
- JWT (jsonwebtoken)
- bcryptjs for password hashing

### Media uploads
- Cloudinary
- Multer

### Security / protection
- Helmet
- CORS
- Arcjet
- Rate limiting for login attempts

### Utilities
- dotenv
- morgan
- nodemon-like watch support via `node --watch` script

---

## Current folder structure

```bash
KhanaExpress/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/
│       │   ├── arcjet.js
│       │   ├── cloudinary.js
│       │   ├── db.js
│       │   ├── env.js
│       │   └── multer.js
│       ├── controllers/
│       │   ├── addressController.js
│       │   ├── authController.js
│       │   ├── menuController.js
│       │   ├── orderController.js
│       │   ├── restaurantController.js
│       │   └── reviewController.js
│       ├── middleware/
│       │   ├── arcjet.js
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── Address.js
│       │   ├── MenuItem.js
│       │   ├── Order.js
│       │   ├── Restaurant.js
│       │   ├── Review.js
│       │   └── User.js
│       ├── routes/
│       │   ├── addressRoutes.js
│       │   ├── authRoutes.js
│       │   ├── menuRoutes.js
│       │   ├── orderRoutes.js
│       │   ├── restaurantRoutes.js
│       │   └── reviewRoutes.js
│       ├── utils/
│       │   ├── cloudinaryUpload.js
│       │   ├── jwt.js
│       │   └── response.js
│       └── ...
└── README.md
```

---

## Backend entry points and runtime flow

### 1) server.js
File: `backend/src/server.js`

This is the main application bootstrap file.

It does the following:

- Creates the Express app
- Loads security middleware such as `helmet()`
- Configures CORS using the `CLIENT_URL` environment variable or `http://localhost:5173`
- Enables request logging with `morgan`
- Parses JSON and URL-encoded bodies
- Mounts Arcjet middleware under `/api`
- Exposes root endpoint `/` with API documentation
- Exposes health endpoint `/health`
- Connects all route groups:
  - `/api/auth`
  - `/api/restaurants`
  - `/api/menu`
  - `/api/orders`
  - `/api/reviews`
  - `/api/addresses`
- Registers global 404 and error middleware
- Calls `connectDB()` and starts the server on the configured PORT

#### Root endpoint behavior
The root `GET /` route returns a JSON overview of the API including sample endpoints for auth, restaurants, menu, orders, reviews, and addresses.

#### Health endpoint behavior
`GET /health` returns server status, uptime, and timestamp.

---

## Configuration layer

### env.js
File: `backend/src/config/env.js`

This file is responsible for loading and validating environment variables.

Required variables include:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ARCJET_KEY`

It exports the `ENV` object with these values, which the rest of the project uses for database, JWT, Cloudinary, and security setup.

### db.js
File: `backend/src/config/db.js`

This file creates the MongoDB connection using Mongoose:

- calls `mongoose.connect(ENV.MONGODB_URI)`
- logs connection success
- exits the process if connection fails

This file is called during startup in `server.js`.

### cloudinary.js
File: `backend/src/config/cloudinary.js`

This configures the Cloudinary SDK with credentials pulled from the environment and exports a configured Cloudinary instance.

### multer.js
File: `backend/src/config/multer.js`

This configures incoming file uploads:

- memory storage is used
- image MIME types are allowed only
- max file size is 5MB

This is used for avatar, restaurant, and menu image uploads.

### arcjet.js
File: `backend/src/config/arcjet.js`

This config uses Arcjet to protect the backend from bot traffic and abusive request behavior.

It applies:

- bot detection
- a global shield check
- token-bucket rate limiting based on IP address

This is used by the global middleware before routes handle requests.

---

## Middleware layer

### auth.js
File: `backend/src/middleware/auth.js`

This is the main authorization middleware.

#### protect
- Reads the `Authorization: Bearer <token>` header
- Verifies the JWT token
- Loads the user from the database
- Rejects if the user no longer exists or is inactive
- Attaches the user to `req.user`
- Calls `next()` if valid

#### authorize
- Checks whether the logged-in user has a required role
- Used to protect endpoints for customers, restaurant owners, delivery partners, and admins

### errorHandler.js
File: `backend/src/middleware/errorHandler.js`

This centralizes API error formatting.

It handles:

- validation errors from Mongoose
- duplicate key errors
- invalid ObjectId / cast errors
- custom 404 responses
- generic server errors

### arcjet.js
File: `backend/src/middleware/arcjet.js`

This file contains request middleware functions for rate limiting.

- `arcjetMiddleware`: blocks abusive global traffic
- `loginRateLimit`: restricts repeated login attempts by IP

The logic maps Arcjet decisions to HTTP responses such as 429 or 403.

---

## Utilities

### jwt.js
File: `backend/src/utils/jwt.js`

Contains JWT helpers:

- `generateToken(userId)` creates a signed JWT with a 30-day expiration
- `verifyToken(token)` returns either decoded payload or a clear auth error

This file is used by the auth controller during registration and login, and by the auth middleware for protected routes.

### response.js
File: `backend/src/utils/response.js`

This helper creates paginated JSON responses with:

- `count`
- `pagination`
- current page
- total pages
- limit
- total entries
- `hasNextPage`, `hasPrevPage`
- `data`

This helps keep API responses consistent across list endpoints.

### cloudinaryUpload.js
File: `backend/src/utils/cloudinaryUpload.js`

This utility handles image upload and deletion with Cloudinary.

It includes:

- file signature detection for JPEG, PNG, GIF, WebP
- `uploadToCloudinary(fileBuffer, mimetype, folder)`
- `deleteFromCloudinary(publicId)`

This file is used by user/profile images, restaurant images, and menu item images.

---

## Models and their role

### User.js
File: `backend/src/models/User.js`

Represents application users.

Core fields:

- `name`
- `email`
- `password` (hashed)
- `role`
- `avatar`
- `phone`
- `restaurant` reference
- `vehicle` and `licenseNumber`
- `isAvailable`
- `favoriteRestaurants`
- `favoriteDishes`
- `isActive`

Roles supported:

- `customer`
- `restaurant`
- `delivery`
- `admin`

The model also includes indexes for email, role, and active status.

This model connects to the auth system and to restaurant, order, and address operations.

### Restaurant.js
File: `backend/src/models/Restaurant.js`

Represents a restaurant business.

Fields include:

- `name`
- `description`
- `cuisine` (array)
- `image`
- `owner`
- `address`
- `phone`
- `hours`
- `deliveryTime`
- `minimumFee` / `minimumOrder`
- `deliveryFee`
- `rating`
- `totalReviews`
- `isOpen`
- `status`

This model is connected to:

- `User` via `owner`
- `MenuItem` via restaurant reference
- `Order` via restaurant reference
- `Review` via restaurant reference

### MenuItem.js
File: `backend/src/models/MenuItem.js`

Represents a single dish or menu entry.

Fields include:

- `restaurant`
- `name`
- `description`
- `category`
- `price`
- `image`
- `isVegetarian`
- `isVegan`
- `spicyLevel`
- `ingredients`
- `available`
- `preparationTime`
- `rating`
- `totalReviews`

This model is connected to:

- `Restaurant` via `restaurant`
- `Order` items via `MenuItem` reference in order items
- `Review` via `menuItem`

### Order.js
File: `backend/src/models/Order.js`

Represents a customer purchase.

Important fields:

- `customer`
- `restaurant`
- `deliveryPartner`
- `items[]`
- `subtotal`
- `deliveryFee`
- `tax`
- `total`
- `deliveryAddress`
- `status`
- `paymentMethod`
- `paymentStatus`
- `orderDate`
- `estimatedDelivery`
- `deliveredAt`
- `cancelledAt`
- `cancelReason`

Order states include:

- `pending`
- `confirmed`
- `preparing`
- `ready`
- `delivering`
- `delivered` / `completed`
- `cancelled`

This model connects closely with every major module:

- customer creates order
- restaurant accepts/updates order
- delivery partner picks up and completes order
- reviews are tied to a specific order

### Review.js
File: `backend/src/models/Review.js`

Represents feedback for either a restaurant or a menu item.

Fields include:

- `user`
- `restaurant`
- `menuItem`
- `order`
- `rating`
- `comment`
- `images`
- `isVerified`

This model is linked to both `Restaurant` and `MenuItem` for rating updates, and it is tied to `Order` so reviews only happen for completed purchases.

### Address.js
File: `backend/src/models/Address.js`

Represents saved customer addresses.

Fields include:

- `user`
- `label`
- `street`
- `city`
- `zip`
- `instructions`
- `coordinates`
- `isDefault`

There is a unique partial index ensuring only one default address per user exists.

---

## Controllers and their responsibilities

### authController.js
File: `backend/src/controllers/authController.js`

Handles:

- `register`: create a fresh user account
- `login`: authenticate and return JWT
- `getMe`: fetch current authenticated user
- `updateProfile`: update profile data
- `changePassword`: verify current password and replace it
- `uploadAvatar`: upload and attach avatar to Cloudinary
- `deleteAvatar`: remove avatar image
- `getUserStats`: dashboard stats depending on the role

This controller interacts directly with `User.js` and uses `generateToken()` from the JWT utility.

### restaurantController.js
File: `backend/src/controllers/restaurantController.js`

Handles restaurant lifecycle operations:

- create restaurant
- list/search restaurants
- fetch one restaurant with menu
- update and delete restaurant
- upload restaurant image
- toggle open/closed state
- fetch restaurant stats

This controller connects with `Restaurant.js`, `MenuItem.js`, `Order.js`, and `User.js`.

### menuController.js
File: `backend/src/controllers/menuController.js`

Handles dish menu operations:

- create menu item
- list menu items with filters
- get a single item
- update item
- delete item
- upload item image
- toggle availability
- get menu by restaurant

This controller uses `MenuItem.js` and interacts with `Restaurant.js` for ownership validation.

### orderController.js
File: `backend/src/controllers/orderController.js`

Handles the ordering flow:

- create order
- get customer orders
- get restaurant orders
- get delivery orders
- get available orders
- view single order
- accept order
- update status
- cancel order
- pickup order
- deliver order
- admin stats

This is the most important business-logic controller for the platform.

### reviewController.js
File: `backend/src/controllers/reviewController.js`

Handles ratings and reviews:

- create review for delivered orders
- fetch reviews for a restaurant
- fetch reviews for a menu item
- update review
- delete review
- recalculate average rating for restaurant/menu item

This controller interacts with `Review.js`, `Restaurant.js`, `MenuItem.js`, and `Order.js`.

### addressController.js
File: `backend/src/controllers/addressController.js`

Handles personal address management:

- create address
- list addresses
- get single address
- update address
- delete address
- mark default address
- fetch default address

This is focused on `Address.js` and is restricted to customers.

---

## Routes and API endpoints

### Auth routes
File: `backend/src/routes/authRoutes.js`

Routes include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/stats`
- `PATCH /api/auth/me`
- `PATCH /api/auth/change-password`
- `POST /api/auth/avatar`
- `DELETE /api/auth/avatar`

These endpoints use the `authController.js` functions and protect middleware where needed.

### Restaurant routes
File: `backend/src/routes/restaurantRoutes.js`

Routes include:

- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `POST /api/restaurants`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`
- `POST /api/restaurants/:id/image`
- `PATCH /api/restaurants/:id/toggle-open`
- `GET /api/restaurants/:id/stats`

### Menu routes
File: `backend/src/routes/menuRoutes.js`

Routes include:

- `GET /api/menu`
- `GET /api/menu/restaurant/:restaurantId`
- `GET /api/menu/:id`
- `POST /api/menu`
- `PUT /api/menu/:id`
- `DELETE /api/menu/:id`
- `POST /api/menu/:id/image`
- `PATCH /api/menu/:id/availability`

### Order routes
File: `backend/src/routes/orderRoutes.js`

Routes include:

- `GET /api/orders/stats/summary`
- `GET /api/orders/restaurant`
- `GET /api/orders/delivery`
- `GET /api/orders/available`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/accept`
- `PATCH /api/orders/:id/status`
- `PATCH /api/orders/:id/cancel`
- `PATCH /api/orders/:id/pickup`
- `PATCH /api/orders/:id/deliver`

### Review routes
File: `backend/src/routes/reviewRoutes.js`

Routes include:

- `GET /api/reviews/restaurant/:restaurantId`
- `GET /api/reviews/menu/:menuItemId`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

### Address routes
File: `backend/src/routes/addressRoutes.js`

Routes include:

- `GET /api/addresses/default`
- `GET /api/addresses`
- `POST /api/addresses`
- `GET /api/addresses/:id`
- `PUT /api/addresses/:id`
- `DELETE /api/addresses/:id`
- `PATCH /api/addresses/:id/default`

---

## How the files connect with each other

This is the key architecture of the project.

### 1) Request flow
A request usually flows like this:

```text
server.js
  -> route file
  -> middleware/auth.js or middleware/arcjet.js
  -> controller
  -> model
  -> MongoDB
  -> response JSON
```

Example:

- A user logs in
- `authRoutes.js` receives `POST /api/auth/login`
- `loginRateLimit` checks traffic limits
- `authController.login` validates inputs
- `User` model checks the email and password hash
- JWT is generated through `utils/jwt.js`
- Response includes token and basic user data

### 2) Auth and authorization flow

```text
login/register -> authController -> User model -> JWT -> protect middleware -> req.user -> authorize checks
```

This is the standard access-control system.

### 3) Restaurant and menu flow

```text
User role = restaurant
  -> create restaurant in restaurantController
  -> Restaurant model stores record
  -> User.restaurant reference updated
  -> create menu items in menuController
  -> MenuItem model stores dish records
  -> restaurant detail endpoint joins restaurant + menu data
```

### 4) Order lifecycle flow

```text
Customer creates order
  -> createOrder controller validates restaurant and items
  -> Order model stores order
  -> Restaurant accepts order
  -> Delivery partner picks up order
  -> Delivery partner marks as delivered
  -> Review can be created afterward
```

### 5) Review and rating flow

```text
Customer reviews delivered order
  -> reviewController validates order ownership and status
  -> Review model saves review
  -> aggregate rating data updates Restaurant or MenuItem rating fields
```

### 6) Image upload flow

```text
route -> multer -> controller -> uploadToCloudinary() -> Cloudinary -> save URL/publicId in model -> response
```

This is used for:

- user avatars
- restaurant images
- menu item images

---

## Database relationships

The application uses MongoDB with Mongoose references, mainly as follows:

- `User.restaurant` -> `Restaurant._id`
- `Restaurant.owner` -> `User._id`
- `MenuItem.restaurant` -> `Restaurant._id`
- `Order.customer` -> `User._id`
- `Order.restaurant` -> `Restaurant._id`
- `Order.deliveryPartner` -> `User._id`
- `Order.items[].menuItem` -> `MenuItem._id`
- `Review.user` -> `User._id`
- `Review.restaurant` -> `Restaurant._id`
- `Review.menuItem` -> `MenuItem._id`
- `Address.user` -> `User._id`

This makes the API capable of linking customers, restaurants, food items, orders, reviews, and addresses logically.

---

## Example user roles and responsibilities

### Customer
- register/login
- place orders
- manage addresses
- view order history
- write reviews
- get user stats

### Restaurant owner
- create restaurant
- update restaurant settings
- add/edit menu items
- accept orders
- update restaurant order status
- view restaurant stats

### Delivery partner
- view available orders
- pick up orders
- complete deliveries
- view assigned orders

### Admin
- access dashboard-level stats
- manage general platform-level metrics

---

## Required environment variables

Create a `.env` file in the `backend` folder with values such as:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/khanaexpress
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ARCJET_KEY=your_arcjet_key
```

Without these values, the app will fail to start.

---

## Scripts

File: `backend/package.json`

Available scripts:

```bash
npm start
npm run dev
npm test
```

### `start`
Runs the application normally:

```bash
node src/server.js
```

### `dev`
Runs the server with watch mode:

```bash
node --watch src/server.js
```

---

## Why this backend is well structured

This project is organized in a clean modular style:

- `config/` stores environment and infrastructure setup
- `routes/` defines HTTP endpoints
- `controllers/` handles business logic
- `models/` defines MongoDB schema and validation
- `middleware/` handles security and auth
- `utils/` contains reusable helper logic

This separation makes the app easier to maintain, extend, and debug.

---

## Current project status

At the moment, the repository contains the backend service for the KhanaExpress application. The project is designed to support a full food delivery platform, but the frontend layer is not yet present in this workspace.

This means the backend is ready as a standalone API foundation for a client app to consume.

---

## Conclusion

The KhanaExpress backend is a full-featured food delivery API with complete logic for:

- authentication
- restaurant management
- menu management
- order processing
- delivery flow
- customer address management
- review system
- Cloudinary image handling
- global security and rate limiting

All of these modules are connected through well-defined route, controller, model, and middleware relationships, making the project a strong foundation for a complete food-ordering application.

---

## Suggested next steps

If you want to continue building the project, the next logical steps would be:

1. Create the frontend app (React or Next.js)
2. Connect it to the backend API
3. Build restaurant listing, cart, checkout, and profile pages
4. Add delivery rider and admin dashboards
5. Add tests for authentication, orders, and API routes

---

## End note

This README documents the backend architecture, file structure, and component relationships to help you understand how the project works and how each part connects to the others.
