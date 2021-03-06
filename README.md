## Data-Aggregation

An automated data integration system that authorizes the user and seamlessly updates/pulls data from 10+ services on a set schedule. Data is stored into a MySQL database

#### Built using:
  - [DataFire][Datafire]
  - [Node.js (version 8)][Node]
  - [AWS EC2][EC2] or on localhost
  - [AWS RDS][RDS] (MySQL)

### Table of Contents  
- [Usage](#usage)
- [Authorization](#authorization)
  * [OAuth2.0](#oauth20-code-grant-flow)
  * [API keys](#api-keys)
- [Scheduling](#scheduling)
- [Database Configuration](#database)
- [Integrations](#integrations)
  * [Enable/Disable-Integration](#enabledisable-integration)
  * [Shopify](#shopify)
  * [Google Sheets](#google-sheets)
  * [Linkedin](#linkedin)
  * [Gmail](#gmail)
  * [Google-Calendar](#google-calendar)
  * [Google-analytics](#google-analytics)
  * [Mailchimp](#mailchimp)
  * [Salesforce](#salesforce)
  * [Xero](#xero)
  * [Trello](#trello)
  * [Quickbooks](#quickbooks)
  * [MySQL or MongoDB](#mysql-or-mongodb)
  * [Hubspot](#hubspot)
- [Logging](#logging)
- [Debugging](#debugging)
- [Result](#result)



## Usage

  - By default the service is hosted on port **3000**
  - OAuth redirect URL is on hosted on port **3333**
  - Run `npm install` and `npm install -g datafire`
  - Start server by ` datafire serve --tasks true ` or by `datafire serve --port {port number}`
  - Can also be started from `startup.js` using `Node startup.js` in the root directory 
  - Follow this [guide][pm2] to setup the service with pm2
 
 
## **Authorization**
  - Specify an `accountName` for each integration to use mutliple accounts
#### OAuth2.0-code-grant-flow
  - **Setup**:
    - *Shopify*
        - Create a developer account [here][shopify]
        - Click *Create Apps* in the *Apps* section
        - Set App name as `Data Integration`
        - Set App Url `http(s)://{Your IP address}:3000`
        - Choose `Shopify admin (required)` and click create app
        - retrieve your `Api Key` and `API secret key`
        - In `App setup`
            - put `http(s)://{Your IP address}:3333` in the `Whitelisted redirection URL(s)` section and save
    -  *Google Apps (Gmail,Calendar,Sheets and Analytics)*
        - Create OAuth token at [Google Api Console][Google Api Console]
        - Enable: `Analytics API`, `Gmail API`, `Google Calendar API` and ` Google Sheets API` in your dashboard
        - Create Credentials for OAuth Client ID and retrieve your `Client ID` and `Client Secret`
    - *Linkedin*
        - Go to [Linkedin Developers][LinkedinApps] and create a new Application
        - set Redirect URL to `https:{Your IP}:3333` 
        - retrieve your `Client ID` and `Client Secret`
    - *Quickbooks*
        - Go to [Quickbooks Developer][Quickbooks] and select "Just Start Coding" and check Accounting
        - set Redirect URI to `https:{Your IP}:3333` 
        - retrieve your `Client ID` and `Client Secret`
    - *SalesForce*
        - Go to [App Manger][SalesForceApp] and create a new "Connected App"
        - Enable `API (Enable OAuth Settings)`
        - for `Callback URL` put `https:{Your IP}:3333` 
        - Under `Available OAuth Scopes` select `Full accesss(full)`
        - Click save at the bottom 
    - *Hubspot*
        - login to your [Hubspot Developer account][hubspot]
        - Select your account
        - Click `Create application` and select `Public`
        - Scroll down to retrieve your `Client ID` and `Client Secret`
        - Under `Scopes` Select `Contacts` .....
        
## Getting OAuth2.0 Tokens 

- `webAuth.js` - To obtain `Access Tokens` and `Refresh Tokens` 
- send a **Get** request to: 
```sh                       
http://localhost:3000/webAuth?integration=${name}&client_id=${client_id}&client_secret=${client_secret}&accountName=${account Name}
```

 ****Note****, when authorizing `shopify` an additional paramter of `shop` is required
Example:
```sh                       
http://localhost:3000/webAuth?integration=${name}&client_id=${client_id}&client_secret=${client_secret}&accountName=${account Name}&shop=${your shop name}
```

- Credentials will be save to your MySQL database in `Accesskeys` 
 - `refreshToken.js` will check for tokens that are about to expire and refresh for new access token automatically 
 
 #### Api-Keys
  - **Setup**:
    -  *Trello*
        - Go to [Trello Api][TrelloApi] and retrieve your `Api Key` and `Api Token`
    - *MailChimp*
        - Go to [MailChimp][MailChimpApi] to retrieve your `Api Key`
        
Current you have to manually put the api keys in the `ApiKeys` table in the database

## Scheduling
  - Under `tasks` in `DataFire.yml`
  - Use `Cron` to schedule your tasks, default is set to every 12 hours
    -   ```sh                       
        schedule: cron(${your cron value})
        ```
## Database
**MySQL** 
  - Create `config.json` and set up SQL connection in `actions/config.json`
  ```sh                       
{
      host: "host",
      user: "user",
      password: "pass",
      database: "Db"
}
```
  - You will need to update the SQL insert queries for your own database
    - My database is setup as:
![alt text](https://raw.githubusercontent.com/Lincoln23/Data-Integration/master/DataIntegration.png)

## Integrations

## Enable/Disable-Integration
Able to disable/enable integrations

**Get** request to:
  ```sh                       
    http://localhost:3000/activate?type={type}&accountName=${name}&apikey={boolean}
```

  - `Parameters`
    - `Type`: Required, 3 options:
        -  `view`, view which accounts/integrations are active
        -  `on`, turn on an integration (requires accountName parameter)
        - `off` turn of an integration (requires accountName parameter)
    - `accountName`: Required for `type`: `on` or `off`
        -  The account you want to enable or disable the integraiton for
    - `apikey`: default is false
            - **Set this to `true` if your integration uses an API key instead of an OAuth Token**
            - if parameter is not included the default value is `false`
            
**Example to view all integrations that uses OAuth tokens**:
  ```sh                       
    http://localhost:3000/activate?type=view
```   
**Example to view all integrations that uses API keys**:
  ```sh                       
    http://localhost:3000/activate?type=view&apikey=true
```   
**Example enabling an integration that uses API key**:
  ```sh                       
    http://localhost:3000/activate?type=on&accountName=${accountName}&apikey=true
```   
**Example disabling an integration using OAuth tokens**:
  ```sh                       
    http://localhost:3000/activate?type=off&accountName=${accountName}
```   
    

## Shopify
Returns the statistics about your store

**Get** request to:
  ```sh                       
    http://localhost:3000/shopify?shop=${your shop name}&accountName=${your account Name}
```
  - `Parameters` 
    - `shop`:  Required - Your shops name (found in the url beofre `.myshopify`)
         ````sh 
        https://${this value}.myshopify.com/admin
         ````
        -  This can be passed as parameters in the **GET** request or set as a default
        -  *To set as default* : retrieve your `shop name` in the url of your store's admin page and store into the `inputs` array in `shopify.js`

         ```sh                       
        {
            type: "string",
            title: "shop",
            default: "${your shop name}"
        },
        ```
        **OR**
        ```sh                       
        http://localhost:3000/shopify?shop=${your shop name}&accountName=${your account Name}
        ```
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`
    
Example 
  ```sh                       
     http://localhost:3000/shopify?shop=my-store&accountName=shopify1
```
## Google-Sheets
  Returns data from the spreadsheet mapped to a field and allows users to post data to the spreadsheet
  
**Get** request to:
  ```sh                       
    http://localhost:3000/sheets?accountName=${account Name}
```
 
  ** **Note** ** You will need to configure the `inputs` JSON array in `create.js` to match the coloumns in your spreadsheet. Label each object in order of your spreadsheet coloumns, from left to right

  I currently have:
```sh                       
inputs: [{
    title: "name",
    type: "string"
    }, {
    type: "string",
    title: "Email"
    }, {
    type: "string",
    title: "phone-number"
    }, {
    type: "string",
    title: "City"
    }, {
    type: "string",
    title: "Organization"
    }], 
```
  - `Parameters`
    - `id`: Required, Your SpreadSheet ID
        ```sh                       
            https://docs.google.com/spreadsheets/d/${this value}/
         ```
        -  This can be passed as a parameter in the **GET** request or set as a default
        -   *To set as default* : The id is found in your spreadsheet URL, then store your id in the `inputs` array in `create.js` and `sheets.js`

         ```sh                       
        {
            type: "string",
            title: "id",
            default: "${your ID}"
        },
        ```
        **OR**
      ```sh                       
        http://localhost:3000/sheets?accountName=${account Name}&id=${your id}
         ```
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`

**Example:**
  ```sh                       
    http://localhost:3000/sheets?accountName=gmail1&id=1htLGczzfdgsd43gXSG4I324dfQQ
```

To add data to your spreadsheet send a **POST** Request to:
```sh                       
http://localhost:3000/postSheet?accountName=${account Name}&spreadsheetId=${your id}
```
With Json Format 
```sh                       
{
 	"name": "name",
 	"Email": "email",
 	"phone": "phone number",
 	"City": "city",
 	"organization": "organization"  
 	....
}
```

## Linkedin
Returns the company's statistics and follow history

**Get** request to:
  ```sh                       
    http://localhost:3000/linkedin?id={id}&filter={day or month}&start={start time}&accountName=${account Name}
```
  - `Parameters` 
    - `id`:  Required - Your Company's id (found in the url on the admin page)
         ````sh 
         https://www.linkedin.com/company/${This Value}/admin 
         ````
        -    This can be passed as parameters in the **GET** request or set as a default
         -  *To set as default* : retrieve your `CompanyID` in the url of your company's admin page and store into the `inputs` array in `linkedin.js`

         ```sh                       
        {
            type: "string",
            title: "id",
            default: "${your ID}"
        },
        ```
        **OR**
        ```sh                       
        http://localhost:3000/linkedin?id={id}&filter={day or month}&start={start time}&accountName=${account Name}&id=${your id}
        ```
    - `filter` Optional - Granularity of statistics. Values `day` or `month`, default is set to `day`
    - `start` Optional - Starting timestamp of when the stats search should begin (milliseconds since epoch), default is set to `1516982869000 ` which is January 26 2018
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`
    
Example 
  ```sh                       
    http://localhost:3000/linkedin?id=123456&filter=day&start=1525028239000&accountName=linkedin&id=1234
```
## Gmail
Returns all emails and relevent metadata

**Get** request to:
  ```sh                       
     http://localhost:3000/gmail?limit={int value}&accountName=${account Name}
```
  - `Parameters` 
    - `limit`:  Optional - limits the number of results returned, default is set to 10
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`

**Example:**
  ```sh                       
    http://localhost:3000/gmail?limit=20&accountName=Lincoln
```

## Google-Calendar
Retrives all your events and when you are free/busy

**Get** request to:
  ```sh                       
     https://localhost:3000/calendar?id={id}&start={start time}&end={end time}&accountName=${account Name}
```
  - `Parameters` 
    - `id`:  Required - Your calendar id (found in the setting page)
        -    This can be passed as a parameter in the **GET** request or set as a default
        -   *To set as default* : [Instructions here for finding id][calendarID] then store your id in the `inputs` array in `calendar.js`
         ```sh                       
        {
            type: "string",
            title: "id",
            default: "${your ID}"
        },
        ```
        **OR**
        ```sh                       
        https://localhost:3000/calendar?id={id}&start={start time}&end={end time}&accountName=${account Name}&id=${your calendar id}
        ```
    - `start` Optional - when to start looking for events in datetime format ( ISO 8601 format) default is set at 2018-05-01T13:00:00-00:00
    - `end` Optional - when to end looking for events in datetime format ( ISO 8601 format)
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`
    
**Example:** 
  ```sh                       
    http://localhost:3000/calendar?id=example@gmail.com&start=2018-03-01T13:00:00-00:00&end=2018-05-29T00:00:00-00:00&accountName=Lincoln&id=example@gmail.com
```

## Google-analytics
Returns real-time analytics and data over time

**Get** request to:
  ```sh                       
http://localhost:3000/analytics?accountName=${accountName}&ids=${ga:XXXX}&accountId=${account Id}&webPropertyId=${web property Id}
```
  - `Parameters` 
    - `ids`:  Required - Unique table ID for retrieving Analytics data. Table ID is of the form ga:XXXX, where XXXX is the Analytics view (profile) ID. **format must be in `ga:{XXXX}`**
    - `start` Optional - Start date for fetching Analytics data. Requests can specify a start date formatted as YYYY-MM-DD, or as a relative date (e.g., today, yesterday, or 7daysAgo). Default: 7daysAgo
    - `end` Optional - End date for fetching Analytics data. Request can should specify an end date formatted as YYYY-MM-DD, or as a relative date (e.g., today, yesterday, or 7daysAgo). Default: today
    - `accountId` Required - Account Id for the custom data sources to retrieve.
    - `webPropertyId` Required - Web property Id for the custom data sources to retrieve.
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`
    
    - `metrics` - A comma-separated list of Analytics metrics. E.g., 'ga:sessions, ga:pageviews'. At least one metric must be specified. 
      **To change this you have to do it in the source code in the `metrics field` refer to [this][analytics_metrics] and find the method for the parameters available**

**Example:** 
  ```sh                       
    http://localhost:3000/analytics?accountName=analytics1&ids=ga:12345&accountId=12345678&webPropertyId=UA-1234124-1
```

## MailChimp
Return all metadata about your campaigns and Lists

**Get** request to:
  ```sh                       
     https://localhost:3000/mailchimp?accountName=${account Name}
```
Returns results about each List and each campiagn 
  - `Parameters` 
    - `accountName`: the account name you assigned it when you authenicated with `WebAuth`

**Example:**
  ```sh                       
     https://localhost:3000/mailchimp?accountName=mail1
```

## SalesForce
Returns all contact and opportunities

**Get** request to:
  ```sh                       
     https://localhost:3000/salesforce?accountName=${account Name}
```
  - `Parameters` 
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`
    
**Example:**
  ```sh                       
     https://localhost:3000/salesforce?accountName=saleforce1
```

## Xero
Retries information about your Accounts, Contacts, BankTransactions, Employees, Invoices, Organisations and Payments

**Get** request to:
  ```sh                       
     https://localhost:3000/xero?accountName=${account Name}
```
Returns information about accounts, contacts, bank transactions, employees, invoices, organisation, payments
  - `Parameters` 
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`
    
**Example:**
  ```sh                       
     https://localhost:3000/xero?accountName=xero1
```


## Trello
Returns information for every board, List, cards(checklists and members)

**Get** request to:
  ```sh                       
     https://localhost:3000/trello?accountName=${account Name}
```
  - `Parameters` 
    - `idMember`: Required - Your member ID
        -   This can be passed as a parameter in the **GET** request or set as a default
        - Can be found in your profile page beside your name. i.e. lincoln23
    - *To set as default*:
         ```sh                       
        {
            type: "string",
            title: "id",
            default: "${your ID}"
        },
        ```
        **OR**
        ```sh                       
        https://localhost:3000/trello?accountName=${account Name}&id=${your id}
        ```
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`
    
**Example:**
```sh                       
 https://localhost:3000/trello?accountName=trello1&id=lincoln23
```

## QuickBooks
Returns information about accounts, bills, and invoices

**Get** request to:
  ```sh                       
     https://localhost:3000/quickbooks?accountName=${account Name}
```
  - `Parameters` 
     - `id`:  Required
        -   This can be passed as a parameter in the **GET** request or set as a default
        -  [Instructions here for finding id][quickbooksID] then store your id in the `inputs` array in `calendar.js`
        - *To set as default* :    
         ```sh            
        
        {
            type: "string",
            title: "id",
            default: "${your ID}"
        },
        ```
        **OR**
        ```sh                       
        https://localhost:3000/quickbooks?accountName=${account Name}&id=${your id}
        ```
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`
    
**Example:**
```sh                       
https://localhost:3000/quickbooks?accountName=quickbooks1&id=1923445979
```



## MySQL or MongoDB
Pulls information from an external MySQL database or Mongo Database to your own MySQl database. Data is stored as a JSON Array as a `TEXT` data type.

**Get** request to:
  ```sh                       
     http://localhost:3000/databaseQuery?host=${host}&user={username}&password={password}&type=${mysql or mongo}&database=${db}&query=${sql query or mongo collection}&stage=${test or save}
```
  - `Paramters`
    - `Host`: endpoint of the external database
    - `user`: User name for the external database
    - `password`: password for the external database
    - `Database`: which schema to pull data from
    - `query`: 
        - For MySQL, your sql query
        - For MongoDB, The collection Name
    - `type`: `mysql` or `monogo`
    - `stage`: Two options
        - `test` only return the JSON response, does not put into database
        - `save` inserts the JSON array into your database

**Examples:**
  ```sh                       
    http://localhost:3000/databaseQuery?host=${host}&user=${user name}&password=${password}&type=mysql&database=FastChat&query=SELECT * FROM Customers&stage=test
```
  ```sh                       
    http://localhost:3000/databaseQuery?host=${host}&user=${user name}&password=${password}&type=mongo&database=FastChat&query=collection2&stage=test
```

## Hubspot
Returns all contacts and companies 

**Get** request to:
  ```sh                       
     http://localhost:3000/hubspot?accountName=${accountName}
```
  - `Paramters`
    - `accountName`: the account name you assigned it when you authorized with `WebAuth`

**Example:**
```sh                       
http://localhost:3000/hubspot?accountName=hubspot1
```

## Logging
**Logs are saved in the `./Logs/access.logs` and `./Logs/error.logs`**
  - `access.log` logs everything non critical
  - `errors.log` logs all warning and errors
  
[Logging is done with winston.js][winston]
- Time format is in UTC

to edit formatting go to `actions/winston`

## Debugging 
- Using WebStorm IDE
    - Configuration:
        - Working Directory: `projects\actions`
        - JavaScript File: `projects\startup.js`

## Result
  - Response is in **JSON** 
  
[shopify]:<https://developers.shopify.com/>
[SalesForceApp]: <https://na72.lightning.force.com/lightning/setup/NavigationMenus/home>
[Quickbooks]: <https://developer.intuit.com/v2/ui#/app/startcreate>
[TrelloApi]: <https://trello.com/app-key>
[MailChimpApi]: <https://us18.admin.mailchimp.com/account/api/>
[Google Api Console]: <https://console.developers.google.com/>
[LinkedinApps]: <https://www.linkedin.com/developer/apps>
[Datafire]: <https://app.datafire.io/>
[Node]:<https://nodejs.org/en/>
[RDS]: <https://aws.amazon.com/rds/>
[EC2]: <https://aws.amazon.com/ec2/>
[hubspot]:<https://developers.hubspot.com/> 
[calendarID]:<https://docs.simplecalendar.io/find-google-calendar-id/>
[quickbooksID]:<https://community.intuit.com/articles/1517319-how-do-i-find-my-company-id>
[winston]:<https://github.com/winstonjs/winston>
[pm2]:<https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04>
[analytics_metrics]:<https://app.datafire.io/integrations/google_analytics>
  
