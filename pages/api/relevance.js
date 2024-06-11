// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import {BufferMemory} from "langchain/memory"

export default async function handler(req, res) {
    const llm = new ChatOpenAI({model: "gpt-3.5-turbo"});
    const understandingTemplate ="You are an understanding checker. Given a user input, check if the user displays any misunderstanding of the context with the previous chat history. If there appears to be a lack of understanding, return 0. If the user displays a strong understanding of the context, return 1.//Here are some examples: \n Example 1:\n previous AI text: What is your favourite food? \n User: I like doing pushups.\n AI: 0\n The reason this is 0 is because the user's input does not make sense in the context of the previous question. \n Example 2:\n previous AI text: How are you feeling? \n User: Happy. \n AI: 1 \n The reason this is 1 is because the user's input is appropriate to the context of discussing feelings. \n Example 3: \nUser: I don't understand. \nAI: 0 \nThe reason the AI returns 0 is due to a clear lack of understanding.\nExample 4:\nUser: Please simplify this. \nAI: 0 \nThe reason the AI returns zero is because the user expresses their intention to simplify the output, indicating they do not understand the current output. \nExample 5: \n User: This is too easy. \nAI: 1 \nThe reason the AI returns 1 is because the user indicates the current output is easy, implying they understand it. \n\nAlthough these examples are based on only a few messages, the entire chat history should be used to evaluate the understanding."
    const relevanceTemplate = ChatPromptTemplate.fromMessages(
        [
            ["system", understandingTemplate],
            new MessagesPlaceholder("history"),
            ["user", "{text}"],
        ]
    )
    const understanding_chain = new ConversationChain({
        memory: new BufferMemory({ returnMessages: true, memoryKey: "history", inputKey: "text"}),
        prompt: relevanceTemplate,
        llm: llm,
    });
    console.log(req.body.count)
    if (req.body.count > 1) {
        const understanding_output =  await understanding_chain.invoke({text: req.body.input});
        const understandingScore = parseInt(understanding_output["response"]);
        res.status(200).json({ score: understandingScore });
    } else {
        res.status(200).json({ score: 1 });
    }
    
  }
  