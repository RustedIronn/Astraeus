# Astraeus

**Astraeus** is an interactive web application that visualizes astronomical data and integrates blockchain functionality for data and token transactions.  
The project demonstrates real-time 3D rendering, blockchain connectivity, and structured data handling using modern web technologies.

---

## Overview

Astraeus allows users to explore stars, constellations, and spectral classifications through a 3D environment.  
It also includes blockchain integration with an ERC-20 smart contract named **AstraeusCoin**, enabling simple token transfers via a connected wallet.

---

## Features

- **3D Star Visualization:** Rendered using `@react-three/fiber` and `three.js`.  
- **Constellation Viewer:** Interactive viewing and exploration of constellation data.  
- **Spectral Type Legend:** Categorization of stars by spectral class.  
- **Data Parsing:** Uses `PapaParse` to process and display star data from CSV files.  
- **Blockchain Integration:** Connects to the Ethereum network using `ethers.js` for contract interaction.  
- **Transaction Logging:** Displays transaction hashes and confirmations in real time.

---

## Tech Stack

**Frontend:**  
React.js, @react-three/fiber, three.js, PapaParse, Tailwind CSS  

**Blockchain:**  
Solidity, ethers.js, Remix IDE, MetaMask  

**Deployment:**  
Vercel  

---

## Smart Contract

- **Name:** AstraeusCoin  
- **Type:** ERC-20  
- **Address:** `0x500b4351b96b3cAce599E93842EE0248e1FF2Cee`  
Implements standard ERC-20 token functionality for blockchain testing and interaction within Astraeus.

---

## Installation

```bash
git clone https://github.com/RustedIronn/Astraeus.git
cd Astraeus
npm install
npm run dev
