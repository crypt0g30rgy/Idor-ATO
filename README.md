# Idor-ATO

This is a demo lab about a recent critical bug i found that resulted in ATO

The ATO was as a result of: 
  - Idor in Email Change and Verification Endpoints
  - No ACL in Email Change
  - No ACL in Email Change Verification

# How to Run the lab

## Pre-Requisites

1. SMTP (GMAIL) creds [https://mailmeteor.com/blog/gmail-smtp-settings]
2. JWT Secret (just random values e.g cat walking on keyboard)
3. MongoDB database (get on here https://www.mongodb.com/)
4. nodejs installed locally (if you don't wanna use docker)

## Running the web app Locally

1. clone this repo
 ```bash
git clone https://github.com/crypt0g30rgy/Idor-ATO.git
```
2. cd into directory
 ```bash
cd Idor-ATO
```
3. run npm install
 ```bash
npm i
```
4. run npm dev server
```bash
npm run dev
```

## Running Web App in docker


// Testing
