# Fashion Store - React Native Clothing Store App

This project is a clothing store application built with React Native for the mobile app and Node.js with MySQL for the backend API.

## Project Structure

- `api/` - Node.js backend API
- `moblie_app/` - React Native mobile application

## Features

- User authentication (login/register)
- Home screen with slideshow, categories, and featured products
- Product browsing by categories
- Shopping cart functionality
- User profile management
- Admin panel for product and category management (CRUD operations)

## Requirements

- Node.js 14+
- MySQL 5.7+
- React Native development environment

## Backend API Setup

1. Navigate to the API directory:

```bash
cd api
```

2. Install dependencies:

```bash
npm install
```

3. Create a MySQL database:

```sql
CREATE DATABASE banquanao_db;
```

4. Import the database schema:

```bash
mysql -u your_username -p banquanao_db < config/database.sql
```

5. Configure the database connection in `.env` file:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=banquanao_db
JWT_SECRET=your_secret_key
PORT=5000
```

6. Run the server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

## Mobile App Setup

1. Navigate to the mobile app directory:

```bash
cd moblie_app
```

2. Install dependencies:

```bash
npm install
```

3. Update API URL:
   
   Edit `src/api/config.js` and update the `API_URL` to point to your backend API server.

4. Run the app:

```bash
npm run start
```

5. Use Expo to run on a device or emulator:
   - For Android: Press `a` in the terminal
   - For iOS: Press `i` in the terminal
   - For web: Press `w` in the terminal

## Default Admin Account

- Email: admin@example.com
- Password: admin123

## License

MIT 