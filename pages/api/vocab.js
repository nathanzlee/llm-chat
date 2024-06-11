// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {

    const complexity = await fetch('https://zylalabs.com/api/1820/text+readability+metrics+api/1481/get+metrics?text='.concat(req.body.input), {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer'.concat(" ", process.env.READABILITY_API_KEY)
        }
    })

    const score = await complexity.json()
        
        // axios(config).then(function (response) {
        // complexityScore = response.data["FLESCH_KINCAID"];
        // })
    res.status(200).json({ score: score['COLEMAN_LIAU'] });
  }
  