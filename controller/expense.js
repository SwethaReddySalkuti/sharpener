const Expense = require('../models/expenses');
const User = require('../models/users');
const AWS = require('aws-sdk');
const { v1: uuidv1} = require('uuid');

const ITEMS_PER_PAGE = 2;

const getexpensespage = (req,res,next) => {
    const page= req.params.page;
    let totalExpensesCount;
    Expense.count()
    .then((total) => {

        totalExpensesCount = total;
        return Expense.findAll({
            offset:(page-1)*ITEMS_PER_PAGE,
            limit:ITEMS_PER_PAGE
        })
    })
    .then((expenses) => {
        return res.json({
            expenses : expenses,
            currentPage:page,
            hasNextPage:ITEMS_PER_PAGE*page<totalExpensesCount,
            nextPage:Number(page)+1,
            hasPreviousPage:page>1,
            previousPage:Number(page)-1,
            lastPage:Math.ceil(totalExpensesCount/ITEMS_PER_PAGE)
        })
    })
}

const addexpense = (req, res) => {
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0 ){
        return res.status(400).json({success: false, message: 'Parameters missing'})
    }
    
    Expense.create({ expenseamount, description, category, userId: req.user.id}).then(expense => {
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);
        User.update({
            totalExpenses : totalExpense
        },{
            where : {id:req.user.id}
        })
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(500).json({success : false, error: err})
    })
}

const getexpenses = (req, res)=> {
    
    Expense.findAll({ where : { userId: req.user.id}}).then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        console.log(err)
        return res.status(500).json({ error: err, success: false})
    })
}

const deleteexpense = (req, res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0){
        return res.status(400).json({success: false, })
    }
    Expense.destroy({where: { id: expenseid, userId: req.user.id }}).then((noofrows) => {
        if(noofrows === 0){
            return res.status(404).json({success: false, message: 'Expense doenst belong to the user'})
        }
        return res.status(200).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ success: true, message: "Failed"})
    })
}

const downloadexpenses =  async (req, res) => {

    try
    {
        const expenses = await req.user.getExpenses();
        const userId = req.user.id;
        const stringifiedExpenses = JSON.stringify(expenses);  //bcz we can write only a string to a file but not array
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await uploadToS3(stringifiedExpenses,filename);
        res.status(200).json({fileURL,success:true,err:null})
    }
    catch(err)
    {
        res.status(500).json({fileURL:'',success:false,err:err})
    }
        

}

function uploadToS3(data,filename)
{

    const BUCKET_NAME = '';
    const IAM_USER_KEY = '';
    const IAM_USER_SECRET = '';
    
    let s3bucket = new AWS.S3({
        accessKeyId : IAM_USER_KEY,
        secretAccessKey : IAM_USER_SECRET
    })

    
        var params = {
            Bucket : BUCKET_NAME,
            Key : filename,
            Body : data,
            ACL : 'public-read'
        }
        return new Promise((resolve,reject) => {
            s3bucket.upload(params,(err, s3response) => {
                if(err)
                {
                    console.log('Something went wrong',err);
                    reject(err);
                }
                else
                {
                    console.log('success',s3response);
                    resolve(s3response.Location);
                }
            })
        })
        
    

}

module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadexpenses,
    getexpensespage
}