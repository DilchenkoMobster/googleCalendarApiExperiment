## Requirements:

* Create client_secret. To create initial clientId and secret you need to follow this wizard https://console.developers.google.com/flows/enableapi?apiid=calendar&authuser=1 The file should have name client_secret.json.
* Replace "redirect_uris": ["http://localhost:3000/callback_authorized"]
* Run command npm install inside the project directory to install all necessary node modules
* Run command node server.js to run the application

### Auth code:
  Server will store auth info in a **mongo database** in port 27107 (default port), therefore there needs to exist a server running 

### Endpoints
 
* PUBLIC
  * GET  **/generateUrl**          Redirects to google authentication flow
  * GET  **/callback_authorized**  Redirect URI for google authentication flow 
     
* PROTECTED (Requires access_token in the header. Access_token is  sent to the client the first time it logs in)
  * GET  **/rooms**                Retrieves rooms. Requires mandatory argument email
  
    * **?email**          Email to be retrieved (by now it allows both Mobiquity and non Mobiquity emails)
    
  * POST **/protected**           For testing purposes, to check the auth header
 

#### Additional libraries

* **Mocha + Chai** tests. Need to define more
* **Winston** for logging

#### Additional notes
* Rooms are hardcoded, only 2 rooms are in the list
* Admin emails are hardcoded too