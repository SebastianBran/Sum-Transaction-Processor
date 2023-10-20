# SUM TRANSACTION PROCESSOR

## Description

This is a Sawtooth transaction processor that implements a simple "sum" transaction family.

## Pre-requisites

* Python 3
* Sawtooth-sdk
* Node.js
* Docker
* Docker-compose

## Usage

### 1. Run sawtooth test node

```bash
docker compose -f sawtooth-default.yaml up
```

### 2. Run transaction processor

```bash
cd processor
python3 main.py
```

### 3. Run client

```bash
cd rest-api
npm install
node index.js
```

