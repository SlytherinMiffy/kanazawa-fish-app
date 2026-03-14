from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from llama_cpp import Llama
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

app = FastAPI(title="Kanazawa Fish Guide AI API")

# Configure CORS so the React app (typically on localhost:5173 or similar) can communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- Model & DB Initialization -------------
print("★ Initializing Database & Models (This might take a moment) ★")

print("Loading Embeddings DB...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")
db_dir = "B:/自作アプリ/石魚/vector_db"
try:
    vectorstore = Chroma(persist_directory=db_dir, embedding_function=embeddings)
except Exception as e:
    print(f"Error loading Chroma DB: {e}")
    vectorstore = None

print("Loading Gemma 2 Model...")
model_path = "B:/自作アプリ/AIモデル/gemma-2-9b-it-Q4_K_M.gguf"
try:
    llm = Llama(
        model_path=model_path,
        n_gpu_layers=-1, 
        n_ctx=6144,      
        verbose=False    
    )
except Exception as e:
    print(f"Error loading Llama model: {e}")
    llm = None

print("Initialization Complete!")
# -----------------------------------------------------

# Request schema for the chat API
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# The system prompt ensures the AI acts as the concierge
SYSTEM_PROMPT = """あなたは金沢の海鮮と観光に精通した、親切で丁寧な一流コンシェルジュです。
【絶対ルール】
1. 丁寧で温かみのあるコンシェルジュらしい口調で話してください。
2. 渡された【参考情報】を元に、お店の魅力が伝わるように自然な文章で語ってください。
3. 【参考情報】にユーザーの求める条件（例：海鮮丼など）に合致する店がない場合は、絶対に他のお店で捏造せず「申し訳ありませんが、手元のデータに該当するお店がございません」と素直に答えてください。
4. ユーザーが特定のお店について質問している場合、参考情報の中に別のお店の情報が混ざっていても、それは絶対に無視して聞かれたお店のことだけを答えてください。"""


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not llm or not vectorstore:
        raise HTTPException(status_code=500, detail="Model or Database not initialized.")

    if not request.messages:
        raise HTTPException(status_code=400, detail="Empty messages.")

    # Extract conversation history and the latest question
    latest_user_message = request.messages[-1].content
    
    # We ignore the system prompt from the frontend if they send it, as we enforce it here
    conversation_history = [
        msg for msg in request.messages[:-1] 
        if msg.role in ['user', 'assistant']
    ]

    # --- Keyword Generation (Query Rewriting) ---
    search_query = latest_user_message
    if len(conversation_history) > 1:
        # Construct history text for the LLM to rewrite the query based on context
        history_text = "\n".join([f"{'ユーザー' if m.role == 'user' else 'コンシェルジュ'}: {m.content}" for m in conversation_history[-4:]]) # Limit history for rewrite
        rewrite_prompt = f"""以下の【会話履歴】を踏まえて、【最新の質問】をデータベースで検索するための「最適なキーワード（単語の羅列）」に変換してください。
※絶対にキーワードのみを出力してください。他の説明や「キーワードは〜」という文章は不要です。

【会話履歴】
{history_text}
【最新の質問】
{latest_user_message}"""
        try:
            print("Rewriting query based on context...")
            rewrite_response = llm.create_chat_completion(
                messages=[{"role": "user", "content": rewrite_prompt}],
                max_tokens=30,
                temperature=0.1, 
                stream=False
            )
            search_query = rewrite_response["choices"][0]["message"]["content"].strip()
            print(f"Generated Search Query: {search_query}")
        except Exception as e:
            print(f"Query rewrite failed: {e}")
            # Fallback to the original user input if the rewrite fails

    # --- Vector DB Retrieval ---
    print(f"Searching for: {search_query}")
    try:
        results = vectorstore.similarity_search(search_query, k=3)
        context = ""
        for res in results:
            context += f"[{res.metadata.get('店舗名_項目', '不明')}]\n{res.page_content}\n\n"
    except Exception as e:
        print(f"Vector search failed: {e}")
        context = "【参考情報】（検索中にエラーが発生しました。一般的な知識で回答してください。）"


    # --- Final Answer Generation ---
    current_prompt = f"""以下の【参考情報】をもとに、一流コンシェルジュとして答えてください。

【参考情報】
{context}

【質問】
ユーザーの入力：「{latest_user_message}」
（※補足：つまり『{search_query}』に関する質問です）"""

    print("Generating comprehensive response...")
    
    # Prepare messages for final generation: Enforce System Rule + History + current context prompt
    llm_messages = [{"role": "user", "content": SYSTEM_PROMPT + "\n理解したら「はい」と答えてください。"},
                    {"role": "assistant", "content": "はい、承知いたしました。金沢の魅力をお伝えする一流のコンシェルジュとして、心を込めて丁寧にご案内いたします。"}]
    
    for msg in conversation_history[-6:]: # Include recent history to maintain flow
        llm_messages.append({"role": msg.role, "content": msg.content})
        
    llm_messages.append({"role": "user", "content": current_prompt})

    try:
        response = llm.create_chat_completion(
            messages=llm_messages,
            max_tokens=1024, 
            temperature=0.7,
            stream=False # Stream is set to false here for simplicity in a standard REST API.
                         # If you want streaming on the frontend, you'd use FastAPI's StreamingResponse.
        )
        
        reply_text = response["choices"][0]["message"]["content"]
        return {"reply": reply_text}
    except Exception as e:
        print(f"LLM Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Make sure to run the frontend separately.
    print("Starting API Server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
