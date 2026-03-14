from llama_cpp import Llama
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# 1. データベースの読み込み
print("データベースを読み込み中...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")
db_dir = "B:/自作アプリ/石魚/vector_db"
vectorstore = Chroma(persist_directory=db_dir, embedding_function=embeddings)

# 2. Gemma 2の召喚
print("Gemma 2をGPUにロード中...")
model_path = "B:/自作アプリ/AIモデル/gemma-2-9b-it-Q4_K_M.gguf"
llm = Llama(
    model_path=model_path,
    n_gpu_layers=-1, 
    n_ctx=6144,      
    verbose=False    
)

system_prompt = """あなたは金沢の海鮮と観光に精通した、親切で丁寧な一流コンシェルジュです。
【絶対ルール】
1. 丁寧で温かみのあるコンシェルジュらしい口調で話してください。
2. 渡された【参考情報】を元に、お店の魅力が伝わるように自然な文章で語ってください。
3. 【参考情報】にユーザーの求める条件（例：海鮮丼など）に合致する店がない場合は、絶対に他のお店で捏造せず「申し訳ありませんが、手元のデータに該当するお店がございません」と素直に答えてください。
4. ユーザーが特定のお店について質問している場合、参考情報の中に別のお店の情報が混ざっていても、それは絶対に無視して聞かれたお店のことだけを答えてください。"""

messages = [
    {"role": "user", "content": system_prompt + "\n理解したら「はい」と答えてください。"},
    {"role": "assistant", "content": "はい、承知いたしました。金沢の魅力をお伝えする一流のコンシェルジュとして、心を込めて丁寧にご案内いたします。"}
]

print("\n" + "="*50)
print("★ 金沢海鮮コンシェルジュ [Ver.3: 思考型AI] 起動！")
print("="*50)

while True:
    user_input = input("あなた: ")
    if user_input.strip() in ["終了", "exit", "quit"]:
        print("ご利用ありがとうございました。またのご利用をお待ちしております！")
        break
    if not user_input.strip():
        continue

    # AIによる検索キーワードの自動生成（Query Rewriting）
    search_query = user_input
    
    # 過去の会話がある場合のみ実行
    if len(messages) > 2:
        print("（文脈を読んで検索キーワードを思考中...）")
        
        # 過去の会話をテキストにまとめる
        history_text = ""
        for m in messages[2:]:
            role_name = "ユーザー" if m["role"] == "user" else "コンシェルジュ"
            history_text += f"{role_name}: {m['content']}\n"
            
        # Gemma 2へキーワード作成指示
        rewrite_prompt = f"""以下の【会話履歴】を踏まえて、【最新の質問】をデータベースで検索するための「最適なキーワード（単語の羅列）」に変換してください。
※絶対にキーワードのみを出力してください。他の説明や「キーワードは〜」という文章は不要です。

【会話履歴】
{history_text}
【最新の質問】
{user_input}"""

        rewrite_response = llm.create_chat_completion(
            messages=[{"role": "user", "content": rewrite_prompt}],
            max_tokens=30,
            temperature=0.1, 
            stream=False
        )
        search_query = rewrite_response["choices"][0]["message"]["content"].strip()
        print(f"（検索キーワードを決定しました: 『 {search_query} 』）")
    else:
        print(f"（検索キーワード: 『 {search_query} 』）")

    # ② データベース検索と回答生成
    results = vectorstore.similarity_search(search_query, k=3)
    
    context = ""
    for res in results:
        context += f"[{res.metadata.get('店舗名_項目', '不明')}]\n{res.page_content}\n\n"

    # 回答用プロンぷト
    current_prompt = f"""以下の【参考情報】をもとに、一流コンシェルジュとして答えてください。

【参考情報】
{context}

【質問】
ユーザーの入力：「{user_input}」
（※補足：つまり『{search_query}』に関する質問です）"""


    generation_messages = messages.copy()
    generation_messages.append({"role": "user", "content": current_prompt})

    print("Gemma 2: ", end="", flush=True)

    # 回答を生成（ストリーミング）
    response = llm.create_chat_completion(
        messages=generation_messages,
        max_tokens=1024, 
        temperature=0.7,
        stream=True
    )

    full_response = ""
    for chunk in response:
        if "content" in chunk["choices"][0]["delta"]:
            text = chunk["choices"][0]["delta"]["content"]
            print(text, end="", flush=True)
            full_response += text
    print("\n" + "-" * 50)

    # ③ 会話履歴の保存とメモリ管理
    messages.append({"role": "user", "content": user_input})
    messages.append({"role": "assistant", "content": full_response})

    if len(messages) > 8:
        messages = messages[:2] + messages[-6:]