# Setup Guide

## Frontend

1. Install dependencies in project root: `npm install`
2. Start frontend: `npm run dev`

## Backend

1. `cd backend`
2. `cp .env.example .env`
3. `npm install`
4. Seed doctor/manager accounts: `npm run seed`
5. Start API: `npm run dev`

## MongoDB

Use local instance:

`MONGODB_URI=mongodb://localhost:27017/mediqueue`
