import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [conversation, setConversation] = useState([])
  const [query, setQuery] = useState('')
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [lexile, setLexile] = useState(200)

  async function chat(e) {
    e.preventDefault()
    if (loadingResponse) return
    console.log(query)
    setLoadingResponse(true)
    setQuery('')
    setConversation(c => [...c, {type: 'you', msg: query}])

    // fetch('/api/chat', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({query: query})
    // })
    // .then(req => req.json())
    // .then(res => {
    //   setConversation(c => [...c, {type: 'reply', msg: res['msg']}])
    // })
    fetch('/api/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({input: query, count: conversation.filter(c => c.type == 'you').length + 1, lexile: lexile})
    })
    .then(req => req.json())
    .then(res => {
      console.log(res.response)
      setConversation(c => [...c, {type: 'reply', msg: res.response, lexile: res.lexile}])
      console.log(res.lexile)
      setLexile(res.lexile)
      setLoadingResponse(false)
    })
  }
  

  return (
    <div className={(conversation.length > 0) ? "w-screen h-screen bg-[#212121] grid grid-rows-[100px_1fr_150px] overflow-hidden" : "w-screen h-screen bg-[url('/wave_background.png')] bg-cover grid grid-rows-[100px_1fr_150px] overflow-hidden"}>
      <div className="flex flex-row justify-between items-center p-4">
        <div><span className="text-[var(--purple)] text-3xl font-extrabold">G</span><span className="text-gray-400 text-3xl">ulu</span><span className="text-[var(--purple)] text-3xl font-extrabold">G</span><span className="text-gray-400 text-3xl">ulu</span></div>
        <div>H</div>
      </div>
      <div className="h-full overflow-auto">
        {
          (conversation.length > 0) ?
          (
            <div className="h-full flex flex-col items-center">
              {
                conversation.map(c => {
                  let character
                  if (c.lexile < 400) {
                    character = '/cat1.png'
                  } else if (c.lexile < 800) {
                    character = '/cat2.png'
                  } else if (c.lexile < 1200) {
                    character = '/cat3.png'
                  } else if (c.lexile < 1600) {
                    character = '/cat4.png'
                  } else {
                    character = '/cat5.png'
                  }
                  if (c['type'] == 'you') {
                    return (
                      <div className="w-[700px] flex flex-row justify-end">
                        <div className="text-right rounded-lg bg-[#2F2F2F] text-white p-[15px] max-w-[70%] mb-[20px]">
                          <span>{c.msg}</span>
                          {/* <div>Y</div> */}
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="w-[700px] flex flex-row justify-start items-start">
                        <Image
                            src={character}
                            width={60}
                            height={60}
                            alt="Logo"
                            className="mr-[20px]"
                          />
                        <div className="text-left rounded-lg bg-[#2F2F2F] text-white p-[15px] max-w-[80%] mb-[20px]">
                          <span>{c.msg}</span>
                        </div>
                      </div>
                    )
                  }
                  
                })
              }
              {
                (loadingResponse && (
                  <div className="w-[700px] flex flex-row justify-start">
                    <div className="text-left rounded-lg bg-[#2F2F2F] text-white p-[15px] max-w-[70%] mb-[20px]">
                      <span className="text-4xl">...</span>
                    </div>
                  </div>
                ))
              }
            </div>
          ) :
          (
            <div className="h-full text-center">
              <Image
                src="/logo.jpg"
                width={150}
                height={150}
                alt="Logo"
                className="mx-auto"
              />
              <h1 className="text-4xl text-white">Hi, how can I help?</h1>
            </div>
          )
        }
      </div>
      <form onSubmit={chat} className="flex flex-row justify-center items-center">
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-[700px] p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[30px] bg-gray-50 dark:bg-[#2F2F2F] dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Ask GuluGulu" 
              value={query}
              required 
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              autocomplete="one-time-code"
            />
            
            
            <svg className={(query !== '' && !loadingResponse) ? "cursor-pointer absolute end-2.5 bottom-2.5 rounded-full bg-white p-[5px]" : "cursor-pointer absolute end-2.5 bottom-2.5 rounded-full bg-[#676767] p-[5px]"} xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M5 12l7-7 7 7"/>
            </svg>

    
            
          </div>
      </form>
    </div>
  )
}
