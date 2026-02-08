# Census Application Backend

## Deployed Application URL
[https://noroff-exam-backend.onrender.com/](https://noroff-exam-backend.onrender.com/)

## Configuration (.env)
```
PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
```

## Description
This is the backend for the Census Application, built with Express.js and MySQL.

## API Documentation
### Verification Steps

This guide provides `curl` commands to verify that the Census Application backend is working correctly.

> [!IMPORTANT]
> **Prerequisites:**
> 1. Ensure MySQL database is running and reachable.
> 2. Ensure `.env` file is configured with correct DB credentials.
> 3. Start the server with `npm start` (or `node index.js`).
> 4. Ensure the database schema is initialized using `database/init.sql`.

**Authentication:**
All requests require Basic Authentication. The default credentials are:
- **Username:** `admin`
- **Password:** `P4ssword`
- **Header:** `Authorization: Basic YWRtaW46UDRzc3dvcmQ=` (Base64 encoded `admin:P4ssword`)

### 1. Create a Participant (POST)
Add a new participant to the database.
```bash
curl -X POST http://localhost:3000/participants/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ=" \
  -d '{
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "dob": "1985-05-15",
    "work": {
        "companyname": "Tech Solutions",
        "salary": 75000,
        "currency": "USD"
    },
    "home": {
        "country": "USA",
        "city": "New York"
    }
}' -v
```
**Expected Response:** `201 Created` - `{"message": "Participant added successfully"}`

### 2. List All Participants (GET)
Retrieve a list of all participants.
```bash
curl -v http://localhost:3000/participants \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ="
```
**Expected Response:** `200 OK` - JSON array of participant objects.

### 3. Get All Personal Details (GET)
Retrieve personal details (firstname, lastname, email) for all participants.
```bash
curl -v http://localhost:3000/participants/details \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ="
```
**Expected Response:** `200 OK` - JSON array of simplified participant objects.

### 4. Get Specific Participant Details (GET)
Retrieve full personal details for a specific email.
```bash
curl -v http://localhost:3000/participants/details/john.doe@example.com \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ="
```
**Expected Response:** `200 OK` - JSON object with `details`.

### 5. Get Work Details (GET)
Retrieve work details for a specific email.
```bash
curl -v http://localhost:3000/participants/work/john.doe@example.com \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ="
```
**Expected Response:** `200 OK` - JSON object with `work` details.

### 6. Get Home Details (GET)
Retrieve home details for a specific email.
```bash
curl -v http://localhost:3000/participants/home/john.doe@example.com \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ="
```
**Expected Response:** `200 OK` - JSON object with `home` details.

### 7. Update Participant (PUT)
Update the details of an existing participant.
```bash
curl -X PUT http://localhost:3000/participants/john.doe@example.com \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ=" \
  -d '{
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Smith",
    "dob": "1985-05-15",
    "work": {
        "companyname": "Global Tech",
        "salary": 82000,
        "currency": "EUR"
    },
    "home": {
        "country": "UK",
        "city": "London"
    }
}' -v
```
**Expected Response:** `200 OK` - `{"message": "Participant updated successfully"}`

### 8. Delete Participant (DELETE)
Delete a participant by email.
```bash
curl -X DELETE http://localhost:3000/participants/john.doe@example.com \
  -H "Authorization: Basic YWRtaW46UDRzc3dvcmQ=" -v
```
**Expected Response:** `200 OK` - `{"message": "Participant deleted successfully"}`

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure `.env` file.
4. Initialize the database using `database/init.sql`.
5. Start the server: `npm start`
