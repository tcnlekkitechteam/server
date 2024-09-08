const fs = require('fs');
const csv = require('csv-parser');


exports.importData = async ({
  model,
  req,
  fieldMappings,
  preProcessRow = async (row) => row,  
  postProcess = async (savedData) => {},  
  res,
}) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const processedData = await Promise.all(
            results.map(async (row) => {
              const processedRow = {};
              for (const [key, value] of Object.entries(fieldMappings)) {
                processedRow[key] = row[value];
              }
              return await preProcessRow(processedRow);
            })
          );

          const savedData = await model.insertMany(processedData);

          await postProcess(savedData);

          res.status(201).json({
            message: `Data imported and saved successfully for ${model.modelName}.`,
          });
        } catch (error) {
          console.error(`ERROR SAVING DATA FOR ${model.modelName}:`, error);
          res.status(500).json({ message: `Error saving data for ${model.modelName}` });
        }
      });
  } catch (error) {
    console.error(`IMPORT DATA ERROR FOR ${model.modelName}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
