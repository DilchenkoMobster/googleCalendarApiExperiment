create client_secret. To create initial clientId and secret you need to follow this wizard https://console.developers.google.com/flows/enableapi?apiid=calendar&authuser=1 The file should have name client_secret.json.
replace "redirect_uris": ["http://localhost:3000/callback_authorized"]
run command npm install inside the project directory to install all necessary node modules
run command node server.js to run the application
visit localhost:3000/ to start working with an app

Auth code:
  Server will store auth info in a mongo database in port 27107 (default port). By now the only requirement to access is give access to calendar endpoint in google and pass the auth code in the header authorization.

Endpoints
  /rooms               Retrieves all rooms
  /rooms/:roomId       Retrieves rooms with specific ID
  
Both endpoints allow to add query parameter "email".


----------------------
----------------------

For the latest commit (The one where mocha+chai and signature headers have been added):
* Set up a mongo environment (same as before)
* Make a POST call to /createUser with an email as body parameter
  * Client will receive its public and private key, must store them
* Make POST call to /protected with the header signature. The header signature must contain:
  * Public key
  * Timestamp
  * Signature (md5 of private_key + timestamp + pub_key + body)

Error codes and strings are toy ones yet (need to discuss which should be returned and when)