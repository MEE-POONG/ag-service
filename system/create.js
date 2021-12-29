require('dotenv').config()
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const Customer = require('../models/customer.model')
const arrayAG = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const old = 13

async function Create() {
  for (let data of arrayAG) {
    const customer = new Customer({
      "webname": "UFA-66",
      "usernameAG": "ufh27oa2",
      "customerID": "ufh27oa200" + (old + data),
      "customerTAG": "00" + (old + data),
      "countCustomer": 8,
      "statusFlag": "A",
      "statusServe": "PENDING",
      "statusAG": "",
      "createdBy": "60dc8d9e9762420ab43ba7b1",
      "updatedBy": "60dc8d9e9762420ab43ba7b1",
    })
    // SAVE CUSTOMER
    console.log(customer)
    await customer.save()
    console.log('SUCCESS\n' + "ufh27oa10" + (old + data))
  }
}

Create()
