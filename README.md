<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
||||||| empty tree
=======
# Food Delivery Website
This is a Food Delivery website project using React as the main JavaScript library, Node.js with Express.js as the framework and Axios with PostgreSQL for database connection.

## To Run the Project:
### Installing Needed Modules
Open the project in a terminal and run the following code to install needed node_modules.
```
cd back_end/
npm i
cd ..
cd front_end/
npm i
```

### Creating Needed Database
After installing the node_modules, a database needs to be created to run the backend. Inside the **back_end** folder a SQL file for an example database schema is given to create necessary PostgreSQL database tables.
Create a database in pgAdmin and then run the SQL file called _database.sql_ as a query.

To create an example admin user use this example admin user with example hashed code:
```
INSERT INTO users (full_name, email, password_hash, address, role)
VALUES (
    'Admin User',
    'admin@example.com',
    '$2b$12$2pQF0bpE6qX4BJxVhUtLOeIXrY7xP0oCBZJDo6BroV/abcdefg',  -- hashed password
    '123 Admin Street',
    'admin'
);
```

This creates the admin user: **Admin User**
With E-mail: **admin@example.com**
With Example Password: **admin123**

You can now fill the database tables.

### Connect Database to Backend
For connecting backend with database first in **back_end** folder create a .env file by filling the example .env.example:
```
DATABASE_URL=postgres://user:password@host:postgresql_port/dbName
JWT_SECRET=Enter_Your_Secret_Here
PORT=EnterPort
```

### Run the Project
Open two seperate terminals for the project. Go to **back_end/** and **front_end/** in each terminal and run:
```
npm start
```

Now the project will open in the browser.
>>>>>>> feature/aysedelen-call-backend
