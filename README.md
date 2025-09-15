# AgroManage — Semi-Blockchain Agricultural Management (MongoDB Edition)


## Quick setup (high level)
1. Extract zip and open terminal.
2. Start Ganache on port 7545.
3. Deploy contracts (Truffle).
4. Configure frontend with deployed contract address.
5. Create `backend/.env` from `.env.example` and add your MongoDB Atlas connection string.
6. Start backend (`npm install && node server.js`).
7. Serve frontend (`python -m http.server 8080`) and open `http://localhost:8080`

## MongoDB Atlas
- Create a free cluster on https://cloud.mongodb.com/
- Create a database user and whitelist your IP (or 0.0.0.0/0 for testing).
- Get the connection string (starts with `mongodb+srv://`...), paste into `backend/.env` as `MONGO_URI`.

## Files of interest
- `truffle/` — smart contract & config.
- `frontend/` — UI and JS.
- `backend/` — Express server with Mongoose support (`backend/.env.example`).

## Running commands
```bash
# Ganache running on 7545
cd truffle
truffle compile
truffle migrate --network development

# Start backend
cd ../backend
npm install
# create .env with MONGO_URI
node server.js

# Serve frontend
cd ../frontend
python -m http.server 8080
```

## Notes
- Paste the deployed contract address into `frontend/js/app.js`.
- The ledger API remains the same: `POST /api/ledger`, `GET /api/ledger`.
- If you want me to also add endpoints for listing farms/crops stored on-chain into MongoDB for faster queries, I can add them.

Enjoy! If anything fails during setup, paste the terminal/browser console errors and I'll fix them with exact commands.
