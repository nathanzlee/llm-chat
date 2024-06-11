// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    const grammar = await fetch('https://api.perfecttense.com/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.PERFECT_TENSE_OWN_API_KEY,
          'AppAuthorization': process.env.PERFECT_TENSE_APP_API_KEY
        },
        body: JSON.stringify({
          text: req.body.input,
          "responseType":["corrected","grammarScore","rulesApplied","summary"]
        })
  
      })
  
    const grammarRes = await grammar.json();
    const grammarScore = grammarRes["grammarScore"];
    res.status(200).json({ score: grammarScore });
  }
  