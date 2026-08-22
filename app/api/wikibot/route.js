import Groq from "groq-sdk"

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function POST(request) {
    const { question } = await request.json()

    let wikiContent = ""
    let wikiLink = ""
    let wikiTitle = ""

    try {
        const cleanQuery = question
            .replace(/^(how do|how does|how did|how can|what is|what are|what was|why do|why does|why did|when did|when was|where is|who is|who was|tell me about|explain|describe)\s+/i, "")
            .replace(/\?$/, "")
            .trim()

        const searchFallback = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*&srlimit=5&srnamespace=0`,
            {
                headers: {
                    "User-Agent": "TechExplained/1.0 (https://wikibot-rho.vercel.app; znead@hotmail.com) WikiBot/1.0",
                    "Accept": "application/json",
                }
            }
        )
        const searchData = await searchFallback.json()
        const results = searchData?.query?.search || []

        for (const result of results) {
            const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`
            const pageResponse = await fetch(pageUrl, {
                headers: {
                    "User-Agent": "TechExplained/1.0 (https://wikibot-rho.vercel.app; znead@hotmail.com) WikiBot/1.0",
                    "Accept": "application/json",
                }
            })
            const pageData = await pageResponse.json()

            if (pageData.extract && pageData.extract.length > 200 && pageData.type !== "disambiguation") {
                wikiContent = pageData.extract
                wikiLink = pageData.content_urls?.desktop?.page || ""
                wikiTitle = pageData.title || ""
                break
            }
        }
    } catch (error) {
        console.error("Wikipedia fetch error:", error)
    }

    if (!wikiContent) {
        return Response.json(
            {
                answer: "I couldn't find an answer to that on Wikipedia. Try rephrasing your question or asking something more specific.",
                wikiLink: "",
                wikiTitle: "",
            },
            { headers: corsHeaders }
        )
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: "You are WikiBot, a helpful assistant that only answers using Wikipedia content provided to you. Always answer in 3-5 clear plain English sentences. Never add information not in the Wikipedia content provided.",
                },
                {
                    role: "user",
                    content: `Here is the Wikipedia content about "${wikiTitle}": "${wikiContent}"\n\nThe user asked: "${question}"\n\nUsing ONLY the Wikipedia content above, answer the user's question in 3-5 sentences.`,
                },
            ],
        })

        const answer = completion.choices[0]?.message?.content || "I couldn't generate an answer. Please try again."

        return Response.json(
            { answer, wikiLink, wikiTitle },
            { headers: corsHeaders }
        )
    } catch (error) {
        console.error("Groq error:", error)
        return Response.json(
            {
                answer: "I couldn't generate an answer right now. Please try again.",
                wikiLink: "",
                wikiTitle: "",
            },
            { headers: corsHeaders }
        )
    }
}
