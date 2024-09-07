const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const { type } = require("os");
const path = require("path");

const generateFileTimeStamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.-]/g, "_");
};

exports.exportData = async ({
  model,
  query = {},
  headers = [],
  excludeFields = [],
  filePrefix = "export",
  res,
  populateOptions = [],
}) => {
  try {
    const timeStamp = generateFileTimeStamp();
    const fileName = `${filePrefix}_${timeStamp}.csv`;
    const filePath = path.join(__dirname, fileName);

    let queryBuilder = model.find(query, excludeFields.join(" ")).lean();

    if (populateOptions.length > 0) {
      populateOptions.forEach((populateOption) => {
        queryBuilder = queryBuilder.populate(populateOption);
      });
    }

    const data = await queryBuilder;

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: `No ${filePrefix} found to export` });
    }

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    });

    const formattedDataForExport = data.map((record) => {
      const formattedData = { ...record };
      if (formattedData.createdAt) {
        formattedData.createdAt = formattedData.createdAt.toISOString();
      }
      if (formattedData.updatedAt) {
        formattedData.updatedAt = formattedData.updatedAt.toISOString();
      }

      for (const key in formattedData) {
        if (formattedData[key] && typeof formattedData[key] === 'object') {
          formattedData[key] = formattedData[key].name
        } else if (Array.isArray(formattedData[key])){
          formattedData[key] = formattedData[key].map(i => i.name).join(',')
        }
      }

      return formattedData;
    });


    await csvWriter.writeRecords(formattedDataForExport);

    // Send file for Download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "text/csv");
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.err("Error downloading file: ", err);
        return res.status(500).json({ error: "Error exporting data" });
      }

      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file", err);
      });
    });
  } catch (error) {
    console.error("EXPORT DATA ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
