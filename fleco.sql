CREATE DATABASE fleco;
use fleco;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    street VARCHAR(255),
	city VARCHAR(255),
	barangay VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255) UNIQUE,
	date_of_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   
);

CREATE TABLE complaints (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
complaint_description VARCHAR(255),
city VARCHAR(255),
street VARCHAR(255),
barangay VARCHAR(255),
date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
prioritization_level VARCHAR(255)
);



INSERT INTO users (full_name, date_of_birth, street, city, barangay, phone_number, email)
VALUES
    ('Danzel Fernandez', '2002-10-18', 'Sitio Mayapa', 'Pgasanjan', 'San Isidro', '09071078639', 'danzel@gmail.com'),
    ('Edzelle Baredo', '2002-10-20', 'Sampaloc', 'Pgasanjan', 'Sampaloc', '09071278639', 'edzelle@gmail.com');


INSERT INTO complaints (user_id, complaint_description, city, street, barangay, prioritization_level, consumer)
SELECT 
    u.user_id, 
    'Trash accumulation problem' AS complaint_description, 
    'Town' AS city, 
    'Elm St' AS street, 
    'Barangay 2' AS barangay, 
    'Medium' AS prioritization_level, 
    u.full_name AS consumer
FROM users u
WHERE u.user_id = 2;
			
