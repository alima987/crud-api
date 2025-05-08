# Setup and Running

- Use `22.x.x version (22.14.0 or upper)` version of Node.js.
- Clone this repo:

    ```bash
    git clone https://github.com/alima987/crud-api.git
    ```

- Install dependencies:

    ```bash
    npm install
    ```

- Rename file `.env.example` into `.env`.
- Start server:

    To run server in development mode:

    ```bash
    npm run start:dev
    ```

    To run server in production mode:

    ```bash
    npm run start:prod
    ```

    To run server with workers in development mode:

    ```bash
    npm run start:dev:multi
    ```

- Now you can send requests to the address: `http://localhost:4000`.
- Start tests:

    ```bash
    npm run test
    ```

