# Food Delivery Website
This is a Food Delivery website project using React as the main JavaScript library, Node.js with Express.js as the framework and Axios with PostgreSQL for database connection.

⚠️ This project is for learning and demonstration only.
⚠️ The database schema, admin credentials, and .env examples are NOT for production use.


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
Create a admin user with a hashed password in the database to be ble to sign in as an admin and create users, restaurants etc.

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