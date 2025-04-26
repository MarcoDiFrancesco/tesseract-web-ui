HTTP API
There are a few endpoints exposed this section describes each one.

OCR Endpoint - /tesseract
This endpoint performs OCR on provided file, You can control the OCR process by providing options field with JSON object containing the configuration. This is the main endpoint that expects http multipart request containing options and file fields and returns a json containing stdout and stderr of the tesseract process.

The options json object fields directly relate to the CLI options of tesseract command.

{
  "languages": ['eng'],               // -l LANG[+LANG]        Specify language(s) used for OCR.
  "dpi": 300,                         // --dpi VALUE           Specify DPI for input image.
  "pageSegmentationMethod": 3,        // --psm NUM             Specify page segmentation mode.
  "ocrEngineMode": 3,                 // --oem NUM             Specify OCR Engine mode.
  "tessDataDir": './dir',             // --tessdata-dir PATH   Specify the location of tessdata path.,
  "userPatternsFile": './file',       // --user-words PATH     Specify the location of user words file.
  "userWordsFile": './file',          // --user-patterns PATH  Specify the location of user patterns file.
  "configParams": {                   // -c VAR=VALUE          Set value for config variables.
    "VAR": "VALUE",                   // Note: You can use tesseract --print-parameters to see all available parameters
  },
}
The returned response has the following shape

{
  "exit": {
    "code": 0,                        // Process exit code
    "signal": null                    // Process signal that caused the exit
  },
  "stderr":  "...",                    // Tesseract Errors and warnings
  "stdout":  "..."                     // Tesseract output that contains the result
}
