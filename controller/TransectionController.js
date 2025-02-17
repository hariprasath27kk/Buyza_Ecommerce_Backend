const Transaction = require('../models/TransectionModel.js');

exports.sendDetails = async (req, res) => {
    try {
        const { data } = req.body;
        console.log("data", data)

        const transection = new Transaction(data);

        await transection.save();

        res.status(200).send(`successfull ${transection}`)
    } catch (err) {
        console.log('error', err)
        res.status(500).send('An error occurred while saving the transaction.');
    }

}

exports.getTransactions = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10;
  
      const skip = (page - 1) * limit;
  
      const pipeline = [
        
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];
  
      const transactions = await Transaction.aggregate(pipeline);
  
      const totalCount = await Transaction.countDocuments();
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.status(200).json({
        transactions,
        currentPage: page,
        totalPages,
        totalItems: totalCount
      });
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  