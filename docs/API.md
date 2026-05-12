# API Overview

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/doctor-login`
- `POST /auth/manager-login`

## Patient

- `POST /patients/register`
- `GET /patients/queue/:token`

## Doctor

- `GET /doctors/queue` (Bearer doctor token)
- `POST /doctors/complete/:visitId` (Bearer doctor token)

## Pharmacy

- `POST /pharmacy/verify`
- `POST /pharmacy/order`

## Manager

- `GET /manager/analytics` (Bearer manager token)
