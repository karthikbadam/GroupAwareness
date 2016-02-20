# GroupAwareness

## Build Process

To deploy this application, you must have [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.org/) installed.

1. Open the project folder through the command prompt or terminal. `cd PATH/TO/FOLDER`
2. Run `npm install` to install dependencies.

This takes care of installing all the application dependencies, which are listed in the package.json file.

## How to Run

1. Before deploying the application, have a MongoDB service running on the background by opening your terminal or command prompt and running `mongod` or `sudo mongod` (depending on your access privileges or whatever works).
2. Now, open the project folder through a new command prompt or terminal tab. `cd PATH/TO/FOLDER`
3. Run `npm start` to start the application at port 3000. 

You can now try the visualization interface by opening `localhost:3000` in your browser. The group awareness visualization can be accessed through `localhost:3000/awareness`. Note that the first time you run `npm start` , the application automatically sets up the datasets on MongoDB, and you will see some console logs reflecting this. These logs will not show up during later runs.  

## Interface

Here is the screenshot of the interface. 
![VIS](https://raw.githubusercontent.com/karthikbadam/GroupAwareness/master/public/images/interface.png)


Here are screenshots of the awareness visualizations. 
![GA1](https://raw.githubusercontent.com/karthikbadam/GroupAwareness/master/public/images/barymap.png)
![GA2](https://raw.githubusercontent.com/karthikbadam/GroupAwareness/master/public/images/parallelcoord.png)

