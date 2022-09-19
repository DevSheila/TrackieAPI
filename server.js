const { app, db,PORT } = require('./config/config');
const { SERVER_DB_URI } = require('./constants/constants');

const connectDB = async () => {
  try {
    await db.connect(SERVER_DB_URI,{useNewUrlParser:true,useUnifiedTopology: true},()=>{
      console.log("Connected to DB!");
    })

    //start server
    app.listen(PORT, async () => {
    });
  } catch (error) {
    console.log(error);
  }
};
connectDB();



