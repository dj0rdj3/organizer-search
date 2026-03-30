# Organizer Search
Index your organizer and quickly locate your items

**Warning: this is a quick prototype and may contain bugs. Use with caution. Contributions and bug reports are welcome.**

## Deployment
### Frontend
Install the required packages: `npm install`

Build it: `npm run build`
### Backend
Install the required packages: `npm install`

#### Environment
Copy the environment file: `cp .env.example .env`

Change the values according to your setup

You can use `openssl rand -hex 40` to generate a new `JWT_SECRET`

#### Initialize data files
Organizer storage: `cp storage.json.example storage.json`

User database: `cp users.json.example users.json`

#### Start the server
`node index.js`

## Usage
### Default credentials:

Username: `admin`

Password: `admin`

### Security recommendation: Change the default password immediately
You can generate a bcrypt hash using: `require('bcrypt').hashSync('NewPassword', 10)` and replace the existing password in `users.json`. Don't forget to restart the server afterwards!