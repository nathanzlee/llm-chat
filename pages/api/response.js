// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ChatOpenAI } from "@langchain/openai";

import { ConversationChain } from "langchain/chains";
import {BufferMemory} from "langchain/memory"
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { normalizeConfig } from "next/dist/server/config";

export default async function handler(req, res) {
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({input: req.body.input, count: req.body.count})
    }
    const urls = [
        fetch('http://localhost:3000/api/grammar', fetchOptions),
        fetch('http://localhost:3000/api/vocab', fetchOptions),
        fetch('http://localhost:3000/api/relevance', fetchOptions)
    ]
    const responses = await Promise.all(urls);

    const results = await Promise.all(responses.map(response => response.json()));

    const [grammarScore, vocabScore, relevanceScore] = results
    console.log(grammarScore, vocabScore, relevanceScore)
    // const grammar = await fetch('http://localhost:3000/api/grammar', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({input: req.body.input})
    // })
    // const grammarScore = await grammar.json()
    // const vocab = await fetch('http://localhost:3000/api/vocab', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({input: req.body.input})
    // })
    // const vocabScore = await vocab.json()
    // const relevance = await fetch('http://localhost:3000/api/relevance', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({input: req.body.input, count: req.body.count})
    // })
    // const relevanceScore = await relevance.json()

    const llm = new ChatOpenAI({model: "gpt-3.5-turbo"});
    const mainTemplate = "You are a virtual English tutor, teaching the user by having a conversation with them about any topic in English. You MUST converse with the user in English. If the user makes a grammatical or spelling error, you MUST correct the sentence and print it out before continuing. The user input will be in this format: \n Preferred lexile level: (lexile level), Text: (User input). Adjust the complexity of the output according to the preferred lexile level provided. Do NOT print the current lexile level in the output."
    const tutorTemplate = ChatPromptTemplate.fromMessages([
        ["system", mainTemplate],
        new MessagesPlaceholder("history"),
        ["user", "{text}"],
      ]); 
    const main_chain = new ConversationChain({
        memory: new BufferMemory({ returnMessages: true, memoryKey: "history",inputKey:"text"}),
        prompt: tutorTemplate,
        llm: llm,
      });
    
    let lexile = req.body.lexile
    console.log("Lexile: ", lexile)
    // if (relevanceScore.score == 0){
    //     lexile = lexile - 200
    // } else if (grammarScore.score < 50){
    //     lexile = lexile - 200
    // } else {
    //     lexile = lexile + 0.2 * grammarScore.score * vocabScore.score * 2000 / (18 * 100) + 200
    // }
    // lexile = Math.max(lexile,0);
    // lexile = Math.min(lexile,3000);

    // normalize the scores
    const normalizedVocabScore = vocabScore.score / 17; // assume 17 is the maximum value of the Coleman-Liau index\
    const normalizedGrammarScore = grammarScore.score / 100;
    console.log(normalizedGrammarScore, normalizedVocabScore)

    // define weights for each metric 
    const vocabWeight = 0.5;
    const grammarWeight = 0.3;
    const relevanceWeight = 0.2;

    // calculate the weighted average
    lexile = (normalizedVocabScore * vocabWeight + normalizedGrammarScore * grammarWeight + relevanceScore.score * relevanceWeight) * 2000;


    // constrain the lexile score to be between 0 and 2000
    lexile = Math.max(lexile, 0);
    lexile = Math.min(lexile, 2000);
    console.log("Lexile: ", lexile)

    const chat = await main_chain.invoke({text: "Preferred lexile level: ".concat(String(lexile),", text: ",req.body.input) });
    res.status(200).json({ response: chat.response, lexile: lexile });
    // console.log(grammarScore, vocabScore, relevanceScore)
    // res.status(200).json({ score: grammarScore.score + vocabScore.score + relevanceScore.score });
  }
  