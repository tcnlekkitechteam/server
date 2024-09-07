exports.Ifilter = (queryParams, allowedFields) => {
    const filter = {};
    const invalidSearchParam = [];
  
    Object.entries(allowedFields).forEach(([field, config]) => {
      const { type, isRange, isSingleDate } = config;
      const queryValue = queryParams[field];
      const fromDate = queryParams.from;
      const toDate = queryParams.to;
      const specificDate = queryParams.date;
      
      
      // Handling date ranges with from and to
      if (type === "date" && isRange && fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filter[field] = { $gte: start, $lte: end };
        } else {
          invalidSearchParam.push(`${field} has an invalid date range`);
        }
      } 
      // Handling specific date with selected date
      else if (type === "date" && isSingleDate && specificDate) {
        const date = new Date(specificDate);
        if (!isNaN(date.getTime())) {
          // Filtering only for the specific date
          filter[field] = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lte: new Date(date.setHours(23, 59, 59, 999)), 
          };
        } else {
          invalidSearchParam.push(`${field} has an invalid date`);
        }
      } 
      else if (queryValue) {
        switch (type) {
          case "string":
            filter[field] = queryValue;
            break;
          case "boolean":
            filter[field] = queryValue === "true";
            break;
          case "number":
            const numberValue = parseFloat(queryValue);
            if (!isNaN(numberValue)) {
              filter[field] = numberValue;
            }
            break;
          default:
            break;
        }
      }
    });
  
    Object.keys(queryParams).forEach((key) => {
      if (!allowedFields[key] && !['page', 'limit', 'from', 'to', 'date'].includes(key)) {
        invalidSearchParam.push(key);
      }
    });
  
    if (invalidSearchParam.length > 0) {
      return {
        error: true,
        message: `Invalid filter parameter(s) provided: ${invalidSearchParam.join(", ")}`,
      };
    }
  
    return { error: false, filter };
  };
  