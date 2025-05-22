# Aplikacja do zarządzania finansami

Projekt składa się z dwóch części:
- **client** – aplikacja frontendowa w React (TypeScript)
- **server** – backend oparty o Node.js/Express

## Szybki start

1. Zainstaluj zależności w obu katalogach:
```cd client``` ```npm install``` ```cd ../server``` ```npm install```
2. Uruchom serwer:
```cd server``` ```npm start```
3. Uruchom klienta:
```cd ../client``` ```npm start```

## Technologie

- React, TypeScript, MUI
- Node.js, Express, MongoDB

## Licencja

MIT

## Wymagania

- Node.js >= 16
- MongoDB (lokalnie lub w chmurze)

## Konfiguracja bazy danych

1. Upewnij się, że MongoDB jest uruchomione lokalnie (domyślnie na `mongodb://localhost:27017`).
2. Skopiuj plik `.env.example` do `.env` w katalogu `server` i uzupełnij dane (np. `MONGO_URI`, `JWT_SECRET`).