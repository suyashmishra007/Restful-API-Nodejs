class APIFilters{
    constructor(query , queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    //   {{DOMAIN}}/api/v1/jobs 
    filter(){
        const queryCopy = {...this.queryStr};

        // TODO: Removing fields from the query
        const removedFields = ['sort','fields','q','limit','page']; // More to add.
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

    //  {{DOMAIN}}/api/v1/jobs?sort=salary
    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);       
        }else{
            this.query = this.query.sort('-postingDate');
        }
        return this;
    }

    // {{DOMAIN}}/api/v1/jobs?fields=title,description,
    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);       
        }else{
            this.query = this.query.select('-__v'); 
        }
        return this;
    }

    // {{DOMAIN}}/api/v1/jobs?q=python-developer
    searchByQuery() {
        if(this.queryStr.q) {
            const qu = this.queryStr.q.split('-').join(' ');
            this.query = this.query.find({$text: {$search: "\""+ qu +"\""}});
        }
        return this;
    }

    // {{DOMAIN}}/api/v1/jobs?limit=1&fields=title&page=3
    pagination(){
        const page = parseInt(this.queryStr.page,10)  || 1;
        const limit = parseInt(this.queryStr.limit,10) || 10;
        const skipResults= (page-1) * limit; 

        this.query=this.query.skip(skipResults).limit(limit);

        return this;
    }
}
module.exports = APIFilters;

