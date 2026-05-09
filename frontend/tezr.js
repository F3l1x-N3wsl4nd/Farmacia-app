{
  "name": "farmacia",
  "type": "module",
  "version": "1.0.0",
  "description": "Sistema de gestão de farmácia",
  "author": "Felix",
  "main": "electron/main.js",

  "scripts": {
    "dev": "concurrently \"yarn backend\" \"yarn frontend\" \"yarn electron:dev\"",
    "backend": "cross-env NODE_ENV=development node backend/server.js",
    "frontend": "cd frontend && cross-env NODE_ENV=development vite",
    "electron:dev": "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .",

    "build:ui": "cd frontend && yarn build",

    "build:win": "yarn build:ui && electron-builder --win portable",
    "build:setup": "yarn build:ui && electron-builder --win nsis",
    "build:all": "yarn build:ui && electron-builder --win"
  },

  "build": {
    "appId": "com.felix.farmacia",
    "productName": "FarmaciaApp",

    "directories": {
      "output": "dist"
    },

    "files": [
      "backend/**/*",
      "frontend/dist/**/*",
      "electron/**/*",
      "package.json",
      "node_modules/**/*"
    ],

    "extraResources": [
      {
        "from": "backend/database.sqlite",
        "to": "database.sqlite"
      }
    ],

    "asarUnpack": [
      "node_modules/sqlite3/**",
      "node_modules/sequelize/**",
      "node_modules/express/**"
    ],

    "win": {
      "target": [
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "icon.ico"
    },

    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  },

  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.3",
    "concurrently": "^8.2.0",
    "cross-env": "^7.0.3",
    "electron": "^38.1.1",
    "electron-builder": "^26.0.12",
    "vite": "^7.1.5",
    "wait-on": "^7.0.1"
  },

  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.15.0",
    "pdfkit": "^0.17.2",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "sequelize": "^6.37.7",
    "sqlite3": "^5.1.7"
  }
}