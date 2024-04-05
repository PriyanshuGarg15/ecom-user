# User Microservice

The User microservice is designed to handle user-related operations such as login, registration, account details, and password-related services.

## Access

The microservice is hosted on AWS at the following URL:

http://ecom-user-lb-321143357.ap-south-1.elb.amazonaws.com:4040



## Routes

### Registration

- **Route**: `/api/register`
- **Method**: POST
- **Description**: Register a new user.

### Login

- **Route**: `/api/login`
- **Method**: POST
- **Description**: Log in an existing user.

### Logout

- **Route**: `/api/logout`
- **Method**: GET
- **Description**: Log out the current user.

### Admin Routes

#### Get All Users

- **Route**: `/api/admin/users`
- **Method**: GET
- **Description**: Get details of all users. *(Admin access required)*

#### Get, Update, Delete User

- **Route**: `/api/admin/user/:id`
- **Method**: 
  - GET: Get details of a specific user.
  - PUT: Update user role.
  - DELETE: Delete a user. *(Admin access required)*

### Password Related

#### Forgot Password

- **Route**: `/api/password/forgot`
- **Method**: POST
- **Description**: Initiate the password reset process.

#### Reset Password

- **Route**: `/api/password/reset/:token`
- **Method**: PUT
- **Description**: Reset user password using the provided reset token.

#### Update Password

- **Route**: `/api/password/update`
- **Method**: PUT
- **Description**: Update the password of the authenticated user.

### User Profile

#### Get User Details

- **Route**: `/api/me`
- **Method**: GET
- **Description**: Get details of the authenticated user.

#### Update User Profile

- **Route**: `/api/me/update`
- **Method**: PUT
- **Description**: Update the profile of the authenticated user.

## Authentication and Authorization

- The microservice uses JWT (JSON Web Tokens) for authentication.
- Certain routes are restricted and require the user to be authenticated and/or have specific roles (e.g., admin).

## Dependencies

- Express.js: Web framework for Node.js
- Mongoose: MongoDB object modeling tool
- @sendgrid/mail: ^8.1.3
- bcryptjs: ^2.4.3
- body-parser: ^1.20.2
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- dotenv: ^16.4.5
- express: ^4.19.2
- express-fileupload: ^1.5.0
- express-rate-limit: ^7.2.0
- jsonwebtoken: ^9.0.2

## Usage

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set environment variables (if needed).
4. Run the microservice using `npm start`.

## Contributors

- [Your Name](#) - Lead Developer

- [Priyanshu Garg](#) - Developer
