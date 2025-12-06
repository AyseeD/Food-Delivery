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