const express = require('express');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const User = require('./models/users');
const path = require('path');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

var cors = require('cors');
const dotenv = require('dotenv');   // to access environment variables

const app = express();

dotenv.config();

app.use(cors());

app.use(express.json());

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const resetPasswordRoutes = require('./routes/resetpassword');
const premiumFeatureRoutes = require('./routes/premiumFeature');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flag:'a'}
)

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');
app.use(helmet());
//app.use(compression());
//app.use(morgan('combined'),{ stream : accessLogStream});
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/password', resetPasswordRoutes);
app.use('/premium', premiumFeatureRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);



sequelize.sync(
  //{force : true}
  )
  .then(result => {
    //http.createServer({key: privateKey,cert:certificate},app).listen(3000); //manual https
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });