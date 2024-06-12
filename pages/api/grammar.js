// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import {BufferMemory} from "langchain/memory"

export default async function handler(req, res) {
    const llm = new ChatOpenAI({model: "gpt-4-turbo"});
    const understandingTemplate =`You are a grammar checker. Given a user input, check if the user's grammar is correct using the following scoring metrics and give a total score. Grammar Evaluation Metrics:
    1. Syntax Appropriateness (30 Points): This measures whether the sentence structure adheres to English syntactic rules.
    2. Verb Tense and Form (30 Points): Evaluating the proper use of verb tenses and forms according to the context.
    3. Grammar and Usage (20 Points): Includes checking for grammatical agreement (subject-verb), proper conjugation, and prepositions.
    4. Clarity and Coherence (20 Points): Focuses on how well the sentence communicates the desired question or statement.
    
    Explanation: This scoring system reflects the critical elements of grammar that contribute to clear and correct English. Each category is scored independently:
    - Syntax and Structure focus on whether the sentence formation follows the rules of English sentence construction, particularly for questions.
    - Verb Tense and Form is crucial as it directly affects the intelligibility and appropriateness of the statement within its context.
    - Grammar and Usage assess broader grammatical correctness beyond just the verb, including subject-verb agreement and proper use of other grammatical constructs.
    - Clarity and Coherence assesses if the sentence is easily understandable and communicates the intended meaning effectively.
    
    Here are some examples:
    Sentence 1: "I likes apple."
    - Syntax Appropriateness (30 Points): 25/30 (Correct basic syntax but verb conjugation error)
    - Verb Tense and Form (30 Points): 10/30 (Incorrect verb form for the singular subject)
    - Grammar and Usage (20 Points): 10/20 (Errors in subject-verb agreement; missing article for correct English)
    - Clarity and Coherence (20 Points): 15/20 (Understandable but grammatically incorrect)
    - Total: 60/100
    
    Sentence 2: "I like apple."
    - Syntax Appropriateness (30 Points): 30/30 (Correct syntax)
    - Verb Tense and Form (30 Points): 30/30 (Correct verb form for the singular subject)
    - Grammar and Usage (20 Points): 18/20 (Only missing the article before "apple")
    - Clarity and Coherence (20 Points): 18/20 (Clear and understandable, just missing an article)
    - Total: 96/100
    
    Sentence 3: "I don't understand."
    - Syntax Appropriateness (30 Points): 30/30 (Proper use of negation in English)
    - Verb Tense and Form (30 Points): 30/30 (Correct verb form in present tense)
    - Grammar and Usage (20 Points): 20/20 (Perfect grammatical agreement and usage)
    - Clarity and Coherence (20 Points): 20/20 (Very clear and effectively communicates the message)
    - Total: 100/100
    
    ### Sentence 4: "Me don't understand."
    - **Syntax Appropriateness (30 Points)**: 10/30 (Incorrect subject pronoun for the sentence)
    - **Verb Tense and Form (30 Points)**: 25/30 (Correct verb form, but mismatch with the subject pronoun)
    - **Grammar and Usage (20 Points)**: 5/20 (Incorrect usage of pronoun which affects understanding)
    - **Clarity and Coherence (20 Points)**: 10/20 (Communicates intent but is grammatically incorrect and awkward)
    - **Total**: 50/100
    
    Sentence 5: "This is too easy."
    - Syntax Appropriateness (30 Points): 30/30 (Correct syntax with proper use of the demonstrative pronoun and verb form)
    - Verb Tense and Form (30 Points)**: 30/30 (Correct use of the present tense in a declarative sentence)
    - Grammar and Usage (20 Points): 20/20 (All grammatical elements are correctly used)
    - Clarity and Coherence (20 Points): 20/20 (The sentence is clear, coherent, and effectively communicates the statement)
    - Total: 100/100
    
    Although these examples are based on only a few messages, the entire chat history should be used to evaluate the grammar.`;    const grammarTemplate = ChatPromptTemplate.fromMessages(
        [
            ["system", understandingTemplate],
            new MessagesPlaceholder("history"),
            ["user", "{text}"],
        ]
    )
    const understanding_chain = new ConversationChain({
        memory: new BufferMemory({ returnMessages: true, memoryKey: "history", inputKey: "text"}),
        prompt: grammarTemplate,
        llm: llm,
    });
    console.log(req.body.count)
    if (req.body.count > 1) {
        const understanding_output =  await understanding_chain.invoke({text: req.body.input});
        const grammarScore = parseInt(understanding_output["response"]);
        res.status(200).json({ score: grammarScore });
    } else {
        res.status(200).json({ score: 1 });
    }
  }