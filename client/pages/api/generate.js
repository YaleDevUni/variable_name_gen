import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const code_chunck = req.body.code || "";
  // if (animal.trim().length === 0) {
  //   res.status(400).json({
  //     error: {
  //       message: "Please enter a valid animal",
  //     },
  //   });
  //   return;
  // }
  // console.log(req.body.code);
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(code_chunck),
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(code_chunck) {
  const given_code = code_chunck.split("\n");
  return `Revise given code chunk only for increase readablity of variables, fuctions and class name.

Code: a = [2,3,5,7,11]
Revised: prime_nums = [2,3,5,7,11]
Code: layer_size = 128 \n main_width = 128
Revised: LAYER_SIZE = 128 \n MAIN_WIDTH = 128
Code: class animal: \n def __init__(self, name, age): \n self.name = name \n self.age = age
Revised: class Animal: \n def __init__(self, name, age): \n self.name = name \n self.age = age
Code: def capitalize(string): \n return "".join([string[i].upper() if i % 2 == 0 else string[i] for i in range(len(string))])
Revised: def capitalize_every_other_letter(string): \n return "".join([string[i].upper() if i % 2 == 0 else string[i] for i in range(len(string))])
Code: ${given_code}
Revised:`;
}
