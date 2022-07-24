exports.fieldsValidator = (fields, req) => {
    let errors = [];
    fields.forEach(field => {
        if(req[field] === '' || req[field] === null || req[field] === undefined){
            return errors.push(field + " is required");
        }
    });
    return errors;
}
