# Service Vendor - Angular Admin Panel

An **Angular admin panel** for managing a service vendor platform. Dockerized for easy deployment.

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Features

- Admin dashboard for service vendor management
- Role-based access control
- Data tables with filtering and sorting
- Docker support for containerized deployment
- CI/CD ready with Bitbucket Pipelines

## Getting Started

```bash
npm install && ng serve
# With Docker:
docker build -t sv-angular-panel . && docker run -p 4200:4200 sv-angular-panel
```

## License
MIT
