class APIFilters{
    constructor(query , queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    filter(){
        const queryCopy = {...this.queryStr};

        // TODO: Removing fields from the query
        const removedFields = ['sort']; // More to add.
        removedFields.forEach(field => {
            delete queryCopy[field];
        })

        // Advance filters using lt , lte , gt , gte
        let queryStr = JSON.stringify(queryCopy);
        
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=> `$${match}`);
        // console.log(queryStr);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
}
module.exports = APIFilters;

