# CampusBite - College Canteen Ordering System

A mini project for the **Microservices** subject (Ganpat University). CampusBite is a small online food ordering system built as independent microservices with **Node.js (Express)** and **MongoDB**, and packaged with **Docker** and **Docker Compose**.

## Links

- GitHub: https://github.com/Samirkumar8207/campusbite
- Docker Hub:
  - https://hub.docker.com/r/samir8207/campusbite-user-service
  - https://hub.docker.com/r/samir8207/campusbite-menu-service
  - https://hub.docker.com/r/samir8207/campusbite-order-service
  - https://hub.docker.com/r/samir8207/campusbite-frontend

## Architecture

```
                 Browser (http://localhost:8080)
                            |
                   Frontend (nginx, index.html)
                            |
        -----------------------------------------
        |                   |                   |
  User Service         Menu Service        Order Service
   (port 5001)          (port 5002)         (port 5003)
        |                   |                   |
     userdb              menudb              orderdb
        \__________________ | _________________/
                       MongoDB (one container)

  Order Service --calls--> User Service  (does the user exist?)
  Order Service --calls--> Menu Service  (item name and price)
```

Each service has its **own database** and runs in its **own container**. The Order Service takes prices from the Menu Service, so the client cannot send a wrong price.

## Services

| Service | Port | Database | Purpose |
|---|---|---|---|
| user-service | 5001 | userdb | Register, login, user CRUD |
| menu-service | 5002 | menudb | Menu items CRUD |
| order-service | 5003 | orderdb | Place, view, update and cancel orders |
| frontend | 8080 | - | Simple web page (nginx) |
| mongo | - | - | MongoDB 7 (data kept in a Docker volume) |

## Tech stack

Node.js, Express, MongoDB (Mongoose), Axios, bcryptjs, Docker, Docker Compose, nginx, Git/GitHub.

## How to run

Requirements: Docker Desktop and Git.

```bash
git clone https://github.com/Samirkumar8207/campusbite.git
cd campusbite
docker compose up --build
```

To use the images from Docker Hub instead of building them:

```bash
docker compose pull
docker compose up
```

Open **http://localhost:8080** in the browser.

Stop everything:

```bash
docker compose down
```

## API list (CRUD)

**User Service (5001)**

| Method | URL | Description |
|---|---|---|
| POST | /users/register | Create user |
| POST | /users/login | Login |
| GET | /users | List users |
| GET | /users/:id | Get one user |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |

**Menu Service (5002)**

| Method | URL | Description |
|---|---|---|
| POST | /menu | Add item |
| GET | /menu | List items |
| GET | /menu/:id | Get one item |
| PUT | /menu/:id | Update item |
| DELETE | /menu/:id | Delete item |

**Order Service (5003)**

| Method | URL | Description |
|---|---|---|
| POST | /orders | Place order |
| GET | /orders | List orders |
| GET | /orders/:id | Get one order |
| PUT | /orders/:id | Update order status |
| DELETE | /orders/:id | Cancel order |

## Demo flow

1. Register a user and login.
2. Add items to the menu.
3. Enter quantities and place an order (total is calculated from menu prices).
4. Change the order status (placed, preparing, ready, delivered).
5. Cancel the order.

## Author

Sameer Kumar, B.Tech CSE, Ganpat University