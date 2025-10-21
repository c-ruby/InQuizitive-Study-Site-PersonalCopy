# InQuizitive Study Site

An **interactive web-based study platform** that allows users to create, manage, and learn from 'study sets', similar in format to sites like Quizlet.  
Built with a full-stack JavaScript architecture using **Node.js**, **Express**, and **MySQL**, the site features cloud-stored study materials that the user can interact with via flashcards, fill-in-the-blank, multiple choice, and true-or-false tools.

---

## 🧠 Overview
- InQuizitive is a browser-based study platform designed to offer free, customizable, and convenient methods for learning:
  - Users can create custom study sets, track progress, and engage with intuitive learning modes.
- Sets created on our site add to the growing knowledge base:
  - Sets can be tagged by subject, and any user (with or without an account) can search for and use available sets.

The project was built as part of a two-semester undergraduate capstone course to demonstrate proficiency in software development.  
Our goal was to develop skills in **full-stack web development, database design, and server setup**.

---

## ✨ Features
- User authentication and account management (bcrypt + express-session)
- Creation and editing of study sets and flashcards
- Cloud-based storage of user data, set data, and study history
- Progress tracking with filters
- Custom Node.js backend hosted on AWS Ubuntu instance
- MySQL database hosted on the AWS instance
- Continuous deployment through Git and PM2
- Reverse proxy and HTTPS connection through Nginx, with a custom domain acquired via IONOS

---

## 🛠 Tech Stack
**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express  
**Database:** MySQL  
**Hosting:** AWS EC2  
**Authentication:** bcrypt + express-session  
**Process Management:** PM2  
**Environment Management:** dotenv  
**Reverse Proxy & HTTPS:** Nginx

---

## ⚙️ How to Run

### Prerequisites
- **Node.js** must be installed  
  [Download from Node.js official website](https://nodejs.org)
- **MySQL** server must be installed and running

### Instructions
1. Clone the repository:  
   `git clone https://github.com/yourusername/InQuizitive-Study-Site.git`

2. Navigate to the backend directory:  
   `cd InQuizitive-Study-Site/root/backend`

3. Create your own MySQL database:
   - Open MySQL Workbench or use the command line.
   - Create a new database, for example:  
     `CREATE DATABASE inquizitive;`
   - Initialize tables using the schema defined below.

4. Configure environment variables:
   - Create a `.env` file in the project root.
   - Set your database connection information:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASS=your_mysql_password
     DB_NAME=your_database_name
     ```

5. Run the server:  
   `node server.js`

6. Open a browser and navigate to:  
   **http://localhost:3001**

**Example execution (Windows Command Prompt):**
```
C:\...\...\...\InQuizitive-Study-Site\root\backend>node server.js
Server started successfully on port: 3001
MySQL Connected...
```

---

## 🗄 Database Schema

Use the following SQL definitions to set up your database:

```
CREATE TABLE user_credentials (
  username varchar(255) NOT NULL,
  password varchar(60) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (username)
);

CREATE TABLE StudySets (
  set_id int NOT NULL AUTO_INCREMENT,
  username varchar(255) NOT NULL,
  set_name varchar(100) NOT NULL,
  category varchar(100) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (set_id),
  KEY StudySets_ibfk_1 (username),
  FULLTEXT KEY set_name (set_name, username),
  CONSTRAINT StudySets_ibfk_1 FOREIGN KEY (username) REFERENCES user_credentials (username) ON DELETE CASCADE
);

CREATE TABLE Terms (
  term_id int NOT NULL AUTO_INCREMENT,
  set_id int DEFAULT NULL,
  term text NOT NULL,
  definition text NOT NULL,
  PRIMARY KEY (term_id),
  KEY set_id (set_id),
  CONSTRAINT Terms_ibfk_1 FOREIGN KEY (set_id) REFERENCES StudySets (set_id)
);

CREATE TABLE VisitHistory (
  visit_id int NOT NULL AUTO_INCREMENT,
  username varchar(255) DEFAULT NULL,
  set_id int DEFAULT NULL,
  visit_timestamp timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visit_id),
  KEY username (username),
  CONSTRAINT VisitHistory_ibfk_1 FOREIGN KEY (username) REFERENCES user_credentials (username),
  CONSTRAINT VisitHistory_ibfk_2 FOREIGN KEY (set_id) REFERENCES StudySets (set_id) ON DELETE CASCADE
);

CREATE TABLE TermStatus (
  status_id int NOT NULL AUTO_INCREMENT,
  username varchar(255) DEFAULT NULL,
  term_id int DEFAULT NULL,
  status int DEFAULT '0',
  PRIMARY KEY (status_id),
  UNIQUE KEY unique_user_term (username, term_id),
  CONSTRAINT TermStatus_ibfk_1 FOREIGN KEY (username) REFERENCES user_credentials (username),
  CONSTRAINT TermStatus_ibfk_2 FOREIGN KEY (term_id) REFERENCES Terms (term_id) ON DELETE CASCADE
);
```

---

## 🚀 Future Improvements
- Implement adaptive/persistent learning algorithms and analytics, so users can easily track their progress and tailor their learning experience 
- Add privacy options for users who do not wish to share their sets 
- Improve mobile responsiveness and add PWA support
- Implement modern UI framework for better looking, more consistent, and easier maintained GUI

---

## 👥 Contributors
- Caleb Ruby
- Caleb Rachoki
- Caleb Massey
- Ibraham Al Ani

---

## 📄 License
This project is open-source and available under the **MIT License**.
